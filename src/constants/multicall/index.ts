import { ChainId } from '@pancakeswap-libs/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.CYPRESS]: '0x1Ee38d535d541c55C9dae27B12edf090C608E6Fb', // TODO
  [ChainId.BAOBAB]: '0x9f405a0a22a2158345cda22cc1881579b1add85e'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
