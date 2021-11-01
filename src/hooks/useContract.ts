import { Contract } from '@ethersproject/contracts';
import { ChainId, WKLAY } from '@pancakeswap-libs/sdk';
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { Contract as CaverContract } from 'caver-js';
import { useMemo } from 'react';

import { useActiveWeb3React } from '.';
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json';
import ENS_ABI from '../constants/abis/ens-registrar.json';
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20';
import ERC20_ABI from '../constants/abis/erc20.json';
import WKLAY_ABI from '../constants/abis/wklay.json';
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall';
import { getCaverContract, getEthersContract } from '../utils';

export { CaverContract };

// returns null on errors
function useEthersContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account, connector } = useActiveWeb3React()
  // console.log('connector!', connector);
  // console.log('library!', library);
  // console.log('account!', account);

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getEthersContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

// returns null on errors
function useCaverContract(address: string | undefined, ABI: any, withSignerIfPossible = true): CaverContract | null {
  const { library, account, connector } = useActiveWeb3React()
  // console.log('connector!', connector);
  // console.log('library!', library);
  // console.log('account!', account);

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getCaverContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useTokenEthersContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useEthersContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useTokenCaverContract(tokenAddress?: string, withSignerIfPossible?: boolean): CaverContract | null {
  return useCaverContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWKLAYContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useEthersContract(chainId ? WKLAY[chainId].address : undefined, WKLAY_ABI, withSignerIfPossible);
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.CYPRESS:
      case ChainId.BAOBAB:
    }
  }
  return useEthersContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useEthersContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useEthersContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useEthersContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useEthersContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}
