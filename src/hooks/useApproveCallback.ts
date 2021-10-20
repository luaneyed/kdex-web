import { BigNumber } from '@ethersproject/bignumber';
import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { CurrencyAmount, KLAY, TokenAmount, Trade } from '@pancakeswap-libs/sdk';
import AddressInputPanel from 'components/AddressInputPanel';
import { useCallback, useMemo } from 'react';

import { useActiveWeb3React } from '.';
import { ROUTER_ADDRESS } from '../constants';
import { useTokenAllowance } from '../data/Allowances';
import { Field } from '../state/swap/actions';
import { useHasPendingApproval, useTransactionAdder } from '../state/transactions/hooks';
import { calculateGasMargin } from '../utils';
import { computeSlippageAdjustedAmounts } from '../utils/prices';
import { useTokenCaverContract, useTokenWeb3Contract } from './useContract';

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  const { account } = useActiveWeb3React()
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === KLAY) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenWeb3Contract(token?.address)
  const tokenCaverContract = useTokenCaverContract(token?.address)
  const addTransaction = useTransactionAdder()

  const useCaver = true;

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!token) {
      console.error('no token')
      return
    }

    let estimateApproveGas;
    let sendApprove;
    if (useCaver) {
      if (!tokenCaverContract) {
        console.error('tokenCaverContract is null')
        return
      }
      estimateApproveGas = (_spender, amount) => {
        console.log('caver estimate', _spender, amount);
        return tokenCaverContract.methods.approve(_spender, amount.toString()).estimateGas({ from: account });
      };
      sendApprove = (_spender, amount, gasLimit) => tokenCaverContract.methods.approve(_spender, amount).send({ from: account, gas: gasLimit });
    } else {
      if (!tokenContract) {
        console.error('tokenContract is null')
        return
      }
      estimateApproveGas = (_spender, amount) => tokenContract.estimateGas.approve(_spender, amount);
      sendApprove = (_spender, amount, gasLimit) => tokenContract.approve(_spender, amount, { gasLimit });
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    let useExact = false
    const estimatedGas = await estimateApproveGas(spender, MaxUint256).catch((e) => {
      console.log('estimate catch!!', e);
      // throw e;
      // // general fallback for tokens who restrict approval amounts
      useExact = true
      return estimateApproveGas(spender, amountToApprove.raw.toString())
    })

    console.log('estimatedGas!', estimatedGas, useExact, spender, MaxUint256, calculateGasMargin(BigNumber.from(estimatedGas.toString())).toNumber());

    const x = sendApprove(spender, useExact ? amountToApprove.raw.toString() : MaxUint256, calculateGasMargin(BigNumber.from(estimatedGas.toString())));

    console.log('x!', tokenContract);

    // eslint-disable-next-line consistent-return
    return x
      .then((response: TransactionResponse) => {
        console.log('approve respone!', response);
        addTransaction(response, {
          summary: `Approve ${amountToApprove.currency.symbol}`,
          approval: { tokenAddress: token.address, spender },
        })
      })
      .catch((error: Error) => {
        console.log('catch!!!!!', error);
        console.error('Failed to approve token', error)
        throw error
      })
  }, [account, approvalState, token, tokenContract, tokenCaverContract, useCaver, amountToApprove, spender, addTransaction])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage]
  )
  return useApproveCallback(amountToApprove, ROUTER_ADDRESS)
}
