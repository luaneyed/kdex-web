import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CommonTransactionReceipt } from 'utils/contract';

import { AppDispatch, AppState } from '..';
import { useActiveWeb3Context } from '../../hooks';
import { addTransaction } from './actions';
import { TransactionDetails } from './reducer';

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(useCaver: boolean): (
  response: CommonTransactionReceipt,
  customData?: { summary?: string; approval?: { tokenAddress: string; spender: string } }
) => void {
  const { chainId, account } = useActiveWeb3Context(useCaver);
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (
      response: CommonTransactionReceipt,
      { summary, approval }: { summary?: string; approval?: { tokenAddress: string; spender: string } } = {}
    ) => {
      if (!account) return
      if (!chainId) return

      const hash = response.transactionHash;
      // const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(addTransaction({ hash, from: account, chainId, approval, summary }))
    },
    [dispatch, chainId, account]
  )
}

// returns all the transactions for the current chain
export function useAllTransactions(useCaver: boolean): { [txHash: string]: TransactionDetails } {
  const { chainId } = useActiveWeb3Context(useCaver);

  const state = useSelector<AppState, AppState['transactions']>((s) => s.transactions)

  return chainId ? state[chainId] ?? {} : {}
}

export function useIsTransactionPending(useCaver: boolean, transactionHash?: string): boolean {
  const transactions = useAllTransactions(useCaver);

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(useCaver: boolean, tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions(useCaver);
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        }
        const { approval } = tx
        if (!approval) return false
        return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx)
      }),
    [allTransactions, spender, tokenAddress]
  )
}
