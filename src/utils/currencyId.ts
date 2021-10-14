import { Currency, KLAY, Token } from '@pancakeswap-libs/sdk'

export function currencyId(currency: Currency): string {
  if (currency === KLAY) return 'KLAY'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}

export default currencyId
