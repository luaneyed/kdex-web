import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { ChainId, WKLAY } from '@pancakeswap-libs/sdk';
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import Caver, { Contract as CaverContract } from 'caver-js';
import { useCallback, useMemo } from 'react';
import { getProviderOrSigner, isAddress } from 'utils';
import { CaverCommonContract, CommonContract, EthersCommonContract, KlipCommonContract } from 'utils/contract';
import { KlipProvider } from 'connectors/KlipConnector';

import { useActiveCaverReact, useActiveWeb3Context, useActiveWeb3React } from '.';
import { ROUTER_ADDRESS } from '../constants';
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json';
import ENS_ABI from '../constants/abis/ens-registrar.json';
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20';
import ERC20_ABI from '../constants/abis/erc20.json';
import WKLAY_ABI from '../constants/abis/wklay.json';
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall';
import { useWalletType, WalletType } from '../state/atoms';
import { abi as IUniswapV2Router02ABI } from '../utils/kdexRouter.json';

// account is optional
export function getEthersContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getCaverContract(address: string, ABI: any): CaverContract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  // console.log('new caver Contract!', caver.account, caver.abi);

  const { caver } = window;
  /* eslint-disable-next-line new-cap */
  return new caver.klay.Contract(
    ABI,
    address
  )
  // contract.options.gas = 3000000
}

// returns null on errors
export function useContractGetter() {
  const [walletType] = useWalletType();
  const { library: web3Library, account: web3Account } = useActiveWeb3React();
  const { library: caverLibrary, account: caverAccount } = useActiveCaverReact();

  return useCallback((address: string | undefined, ABI: any, withSignerIfPossible = true): CommonContract | null => {
    const useCaver = walletType !== WalletType.MetaMask;
    const account = (useCaver ? web3Account : caverAccount) ?? undefined;

    if (!address || !ABI || !web3Library || !caverLibrary) return null;
    try {
      const ethersContract = getEthersContract(address, ABI, web3Library, withSignerIfPossible && account ? account : undefined);

      if (!useCaver) {
        return new EthersCommonContract(ethersContract);
      }
      if (walletType === WalletType.Klip) {
        if (caverLibrary instanceof KlipProvider) {
          return new KlipCommonContract(caverLibrary, getCaverContract(address, ABI), ethersContract.interface, account);
        }
        //  Can occur while updating
        console.error('Wallet Type is Klip but caverLibrary is not KlipProvider');
        return null;
      }
      return new CaverCommonContract(getCaverContract(address, ABI), ethersContract.interface, account);
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [walletType, web3Library, caverLibrary, web3Account, caverAccount])
}

// returns null on errors
export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): CommonContract | null {
  return useContractGetter()(address, ABI, withSignerIfPossible);
}

// account is optional
export function useRouterContract(): CommonContract | null {
  return useContract(ROUTER_ADDRESS, IUniswapV2Router02ABI);
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): CommonContract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useWKLAYContract(withSignerIfPossible?: boolean): CommonContract | null {
  const { chainId } = useActiveWeb3Context();
  return useContract(chainId ? WKLAY[chainId].address : undefined, WKLAY_ABI, withSignerIfPossible);
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): CommonContract | null {
  const { chainId } = useActiveWeb3Context();
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.CYPRESS:
      case ChainId.BAOBAB:
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible);
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): CommonContract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): CommonContract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): CommonContract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible);
}

export function useMulticallContract(): CommonContract | null {
  const { chainId } = useActiveWeb3Context();
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false);
}
