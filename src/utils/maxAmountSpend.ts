import { CurrencyAmount, KLAY, JSBI } from '@pancakeswap-libs/sdk'
import { MIN_KLAY } from '../constants'

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(currencyAmount?: CurrencyAmount): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency === KLAY) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_KLAY)) {
      return CurrencyAmount.klay(JSBI.subtract(currencyAmount.raw, MIN_KLAY))
    }
    return CurrencyAmount.klay(JSBI.BigInt(0))
  }
  return currencyAmount
}

export default maxAmountSpend
