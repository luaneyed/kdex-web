import { ChainId, JSBI, Percent, Token, WKLAY } from '@pancakeswap-libs/sdk'

export const ROUTER_ADDRESS = '0xecDC29C1A9C286C771686301554C219D4dDaA93e'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const DAMON = new Token(ChainId.BAOBAB, '0x66F80d658792765aE76c64c1110D003930797062', 18, 'DAMON', 'Damon');
export const KAY = new Token(ChainId.BAOBAB, '0x94e5b0A5fe58595A14d123A27eCc1feAB4D3F5e0', 16, 'KAY', 'Kay');
export const ROSS = new Token(ChainId.BAOBAB, '0x9f25b88E25F74B711D38C228fabbB5178b5F6864', 8, 'ROSS', 'Ross');
export const LUAN = new Token(ChainId.BAOBAB, '0x99ac0F642821C33eDcBeaf079Ad691b72b495de0', 6, 'LUAN', 'Luan');

// export const CAKE = new Token(ChainId.CYPRESS, '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', 18, 'CAKE', 'PancakeSwap Token')
// export const WBNB = new Token(ChainId.CYPRESS, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB', 'Wrapped BNB')
// export const DAI = new Token(ChainId.CYPRESS, '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', 18, 'DAI', 'Dai Stablecoin')
// export const BUSD = new Token(ChainId.CYPRESS, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'Binance USD')
// export const BTCB = new Token(ChainId.CYPRESS, '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', 18, 'BTCB', 'Binance BTC')
// export const USDT = new Token(ChainId.CYPRESS, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'Tether USD')
// export const UST = new Token(
//   ChainId.CYPRESS,
//   '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
//   18,
//   'UST',
//   'Wrapped UST Token'
// )
// export const ETH = new Token(
//   ChainId.CYPRESS,
//   '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
//   18,
//   'ETH',
//   'Binance-Peg Ethereum Token'
// )

const WKLAY_ONLY: ChainTokenList = {
  [ChainId.CYPRESS]: [WKLAY[ChainId.CYPRESS]],
  [ChainId.BAOBAB]: [WKLAY[ChainId.BAOBAB]],
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WKLAY_ONLY,
  [ChainId.CYPRESS]: [...WKLAY_ONLY[ChainId.CYPRESS], DAMON, KAY, ROSS, LUAN],
  [ChainId.BAOBAB]: [...WKLAY_ONLY[ChainId.BAOBAB], DAMON, KAY, ROSS, LUAN],
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.CYPRESS]: {},
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WKLAY_ONLY,
  [ChainId.CYPRESS]: [...WKLAY_ONLY[ChainId.CYPRESS], DAMON, LUAN],
  [ChainId.BAOBAB]: [...WKLAY_ONLY[ChainId.BAOBAB], DAMON, LUAN],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WKLAY_ONLY,
  [ChainId.CYPRESS]: [...WKLAY_ONLY[ChainId.CYPRESS], DAMON, KAY, ROSS, LUAN],
  [ChainId.BAOBAB]: [...WKLAY_ONLY[ChainId.BAOBAB], DAMON, KAY, ROSS, LUAN],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.CYPRESS]: [
    [DAMON, LUAN],
    [KAY, LUAN],
    [ROSS, LUAN],
  ],
  [ChainId.BAOBAB]: [
    [DAMON, LUAN],
    [KAY, LUAN],
    [ROSS, LUAN],
  ],
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 80
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much KLAY so they end up with <.01
export const MIN_KLAY: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 KLAY
