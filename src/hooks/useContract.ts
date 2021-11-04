import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { ChainId, WKLAY } from '@pancakeswap-libs/sdk';
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import Caver, { Contract as CaverContract } from 'caver-js';
import { useMemo } from 'react';
import { getProviderOrSigner, isAddress } from 'utils';
import { CaverCommonContract, CommonContract, EthersCommonContract } from 'utils/contract';

import { useActiveCaverReact, useActiveWeb3React } from '.';
import { ROUTER_ADDRESS } from '../constants';
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json';
import ENS_ABI from '../constants/abis/ens-registrar.json';
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20';
import ERC20_ABI from '../constants/abis/erc20.json';
import WKLAY_ABI from '../constants/abis/wklay.json';
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall';
import { abi as IUniswapV2Router02ABI } from '../utils/kdexRouter.json';

// account is optional
export function getEthersContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  console.log('new web3 Contract!');
  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getCaverContract(address: string, ABI: any): CaverContract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  // console.log('new caver Contract!', caver.account, caver.abi);

  const { caver } = window;
  console.log('new caver contract!', caver);
  /* eslint-disable-next-line new-cap */
  return new caver.klay.Contract(
    ABI,
    address
  )
  // contract.options.gas = 3000000
}

// returns null on errors
function useContract(useCaver: boolean, address: string | undefined, ABI: any, withSignerIfPossible = true): CommonContract | null {
  const { library, account: web3Account } = useActiveWeb3React();
  const { account: caverAccount } = useActiveCaverReact();

  return useMemo(() => {
    const account = (useCaver ? web3Account : caverAccount) ?? undefined;

    if (!address || !ABI || !library) return null
    try {
      const ethersContract = getEthersContract(address, ABI, library, withSignerIfPossible && account ? account : undefined);
      
      return useCaver
        ? new CaverCommonContract(getCaverContract(address, ABI), ethersContract.interface, account)
        : new EthersCommonContract(ethersContract);
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [useCaver, address, ABI, library, withSignerIfPossible, web3Account, caverAccount])
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

// account is optional
export function useRouterContract(useCaver: boolean): CommonContract | null {
  return useContract(useCaver, ROUTER_ADDRESS, IUniswapV2Router02ABI);
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

export function useENSRegistrarContract(useCaver: boolean, withSignerIfPossible?: boolean): CommonContract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.CYPRESS:
      case ChainId.BAOBAB:
    }
  }
  return useContract(useCaver, address, ENS_ABI, withSignerIfPossible);
}

export function useENSRegistrarEthersContract(withSignerIfPossible?: boolean): Contract | null {
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

export function useENSResolverContract(useCaver: boolean, address: string | undefined, withSignerIfPossible?: boolean): CommonContract | null {
  return useContract(useCaver, address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
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
