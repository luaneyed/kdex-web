import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ChainId, Currency, CurrencyAmount, JSBI, KLAY, Percent, Token } from '@pancakeswap-libs/sdk';
import Caver, { Contract as CaverContract } from 'caver-js';

import { ROUTER_ADDRESS } from '../constants';
import { TokenAddressMap } from '../state/lists/hooks';
import { CaverCommonContract, CommonContract, EthersCommonContract } from './contract';
import { abi as IUniswapV2Router02ABI } from './kdexRouter.json';

// const RPC_URL = 'kenn';
// export const caver =
//   typeof window !== 'undefined' && window.klaytn
//     ? new Caver(window.klaytn)
//     : new Caver(RPC_URL)

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const KLAYTNSCOPE_PREFIXES: { [chainId in ChainId]: string } = {
  8217: '',
  1001: 'baobab.'
}

export function getKlaytnScopeLink(chainId: ChainId, data: string, type: 'transaction' | 'token' | 'address'): string {
  const prefix = `https://${KLAYTNSCOPE_PREFIXES[chainId] || KLAYTNSCOPE_PREFIXES[ChainId.CYPRESS]}scope.klaytn.com`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token':
    case 'address':
    default: {
      return `${prefix}/account/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(Math.floor(num)), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

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

export function getContract(useCaver: boolean, address: string, abi: any, library: Web3Provider, account?: string): CommonContract {
  const ethersContract = getEthersContract(address, abi, library, account);
  
  return useCaver
    ? new CaverCommonContract(getCaverContract(address, abi), ethersContract.interface, account)
    : new EthersCommonContract(ethersContract);
}

// account is optional
export function getRouterContract(useCaver: boolean, _: number, library: Web3Provider, account?: string): CommonContract {
  return getContract(useCaver, ROUTER_ADDRESS, IUniswapV2Router02ABI, library, account);
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === KLAY) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}
