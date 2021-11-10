import { ChainId, JSBI, Percent, Token, WKLAY } from '@pancakeswap-libs/sdk'

export const isBaobab = process.env.REACT_APP_CHAIN_ID === '1001';
export const ROUTER_ADDRESS = isBaobab ? '0xecDC29C1A9C286C771686301554C219D4dDaA93e' : '0x24694eAe27074E5b5325E0b7Bb4d4a64BC479ae0';

console.log('isBaobab!', isBaobab);

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}


// baobab tokens

export const LUAN = new Token(ChainId.BAOBAB, '0x99ac0F642821C33eDcBeaf079Ad691b72b495de0', 6, 'LUAN', 'Luan');
export const DAMON = new Token(ChainId.BAOBAB, '0x66F80d658792765aE76c64c1110D003930797062', 18, 'DAMON', 'Damon');
export const KAY = new Token(ChainId.BAOBAB, '0x94e5b0A5fe58595A14d123A27eCc1feAB4D3F5e0', 16, 'KAY', 'Kay');
export const ROSS = new Token(ChainId.BAOBAB, '0x9f25b88E25F74B711D38C228fabbB5178b5F6864', 8, 'ROSS', 'Ross');

// cypress tokens

export const KSP = new Token(ChainId.CYPRESS, '0xC6a2Ad8cC6e4A7E08FC37cC5954be07d499E7654', 18, 'KSP', 'KlaySwap Protocal');
export const KUSDT = new Token(ChainId.CYPRESS, '0xceE8FAF64bB97a73bb51E115Aa89C17FfA8dD167', 6, 'KUSDT', 'Orbit Bridge Klaytn USD Tether');
export const KUSDC = new Token(ChainId.CYPRESS, '0x754288077D0fF82AF7a5317C7CB8c444D421d103', 6, 'KUSDC', 'Orbit Bridge Klaytn USD Coin');
export const KDAI = new Token(ChainId.CYPRESS, '0x5c74070FDeA071359b86082bd9f9b3dEaafbe32b', 18, 'KDAI', 'Klaytn Dai');

const WKLAY_ONLY: ChainTokenList = {
  [ChainId.CYPRESS]: [WKLAY[ChainId.CYPRESS]],
  [ChainId.BAOBAB]: [WKLAY[ChainId.BAOBAB]],
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WKLAY_ONLY,
  [ChainId.CYPRESS]: [...WKLAY_ONLY[ChainId.CYPRESS], KSP, KUSDT, KUSDC, KDAI],
  [ChainId.BAOBAB]: [...WKLAY_ONLY[ChainId.BAOBAB], LUAN, DAMON, KAY, ROSS],
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
  [ChainId.CYPRESS]: [...WKLAY_ONLY[ChainId.CYPRESS], KSP, KUSDT],
  [ChainId.BAOBAB]: [...WKLAY_ONLY[ChainId.BAOBAB], LUAN, DAMON],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WKLAY_ONLY,
  [ChainId.CYPRESS]: [...WKLAY_ONLY[ChainId.CYPRESS], KSP, KUSDT, KDAI],
  [ChainId.BAOBAB]: [...WKLAY_ONLY[ChainId.BAOBAB], LUAN, DAMON, KAY],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.CYPRESS]: [
    [KSP, KUSDT],
    [KSP, KUSDC],
    [KSP, KDAI],
  ],
  [ChainId.BAOBAB]: [
    [LUAN, DAMON],
    [LUAN, KAY],
    [LUAN, ROSS],
  ],
}

export const Web3NetworkContextName = 'WEB3-NETWORK'
export const CaverNetworkContextName = 'CAVER-NETWORK'

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
