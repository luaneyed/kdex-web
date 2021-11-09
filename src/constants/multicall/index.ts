import { ChainId } from '@pancakeswap-libs/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.CYPRESS]: '0x6781f8eADc5DF8897bE2CAA81E02c9Ec014C3999',
  [ChainId.BAOBAB]: '0x9f405a0a22a2158345cda22cc1881579b1add85e',
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
