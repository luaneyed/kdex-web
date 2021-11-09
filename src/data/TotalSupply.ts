import { BigNumber } from '@ethersproject/bignumber';
import { Token, TokenAmount } from '@pancakeswap-libs/sdk';

import { useTokenContract } from '../hooks/useContract';
import { useSingleCallResult } from '../state/multicall/hooks';

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useTotalSupply(useCaver: boolean, token?: Token): TokenAmount | undefined {
  const contract = useTokenContract(useCaver, token?.address, false);

  const totalSupply: BigNumber = useSingleCallResult(useCaver, contract, 'totalSupply')?.result?.[0]

  return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined
}

export default useTotalSupply
