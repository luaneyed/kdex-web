import { Contract } from '@ethersproject/contracts';
import { ChainId, WKLAY } from '@pancakeswap-libs/sdk';
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { useMemo } from 'react';
import { CaverContract, CommonContract } from 'utils/contract';

import { useActiveWeb3React } from '.';
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json';
import ENS_ABI from '../constants/abis/ens-registrar.json';
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20';
import ERC20_ABI from '../constants/abis/erc20.json';
import WKLAY_ABI from '../constants/abis/wklay.json';
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall';
import { getCaverContract, getContract, getEthersContract } from '../utils';

// returns null on errors
function useContract(useCaver: boolean, address: string | undefined, ABI: any, withSignerIfPossible = true): CommonContract | null {
  const { library, account, connector } = useActiveWeb3React()
  // console.log('connector!', connector);
  // console.log('library!', library);
  // console.log('account!', account);

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(useCaver, address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [useCaver, address, ABI, library, withSignerIfPossible, account])
}

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

export function useTokenContract(useCaver: boolean, tokenAddress?: string, withSignerIfPossible?: boolean): CommonContract | null {
  return useContract(useCaver, tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useWKLAYContract(useCaver: boolean, withSignerIfPossible?: boolean): CommonContract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(useCaver, chainId ? WKLAY[chainId].address : undefined, WKLAY_ABI, withSignerIfPossible);
}

export function useWKLAYEthersContract(withSignerIfPossible?: boolean): Contract | null {
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

export function useENSResolverEthersContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useEthersContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(useCaver: boolean, tokenAddress?: string, withSignerIfPossible?: boolean): CommonContract | null {
  return useContract(useCaver, tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useEthersContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useMulticallEthersContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useEthersContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}
