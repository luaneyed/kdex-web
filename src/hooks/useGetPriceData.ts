import { useEffect, useState } from 'react';

import { isBaobab } from '../constants';

type ApiResponse = {
  updated_at: string
  data: {
    [key: string]: {
      name: string
      symbol: string
      price: string
      price_KLAY: string
    }
  }
}

const api = 'https://api.pancakeswap.info/api/tokens'

const useGetPriceData = () => {
  const [data, setData] = useState<ApiResponse | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch(api)
        // const res: ApiResponse = await response.json()

        // setData(res)
        setData({
          updated_at: '1634721441166',
          data: isBaobab
            ? {
              '0x99ac0F642821C33eDcBeaf079Ad691b72b495de0': { name: 'Luan', symbol: 'LUAN', price: '100.630750102465338778820291386823', price_KLAY: '0.2497511514106803736955898938878719' },
              '0x66F80d658792765aE76c64c1110D003930797062': { name: 'Damon', symbol: 'DAMON', price: '100.630750102465338778820291386823', price_KLAY: '0.2497511514106803736955898938878719' },
              '0x94e5b0A5fe58595A14d123A27eCc1feAB4D3F5e0': { name: 'Kay', symbol: 'KAY', price: '100.630750102465338778820291386823', price_KLAY: '0.2497511514106803736955898938878719' },
              '0x9f25b88E25F74B711D38C228fabbB5178b5F6864': { name: 'Ross', symbol: 'ROSS', price: '100.630750102465338778820291386823', price_KLAY: '0.2497511514106803736955898938878719' },
            }
            : {
              '0xC6a2Ad8cC6e4A7E08FC37cC5954be07d499E7654': { name: 'KlaySwap Protocal', symbol: 'KSP', price: '100.630750102465338778820291386823', price_KLAY: '0.126639' },
              '0xceE8FAF64bB97a73bb51E115Aa89C17FfA8dD167': { name: 'Orbit Bridge Klaytn USD Tether', symbol: 'KUSDT', price: '100.630750102465338778820291386823', price_KLAY: '1.562219' },
              '0x754288077D0fF82AF7a5317C7CB8c444D421d103': { name: 'Orbit Bridge Klaytn USD Coin', symbol: 'KUSDC', price: '100.630750102465338778820291386823', price_KLAY: '1.572089' },
              '0x5c74070FDeA071359b86082bd9f9b3dEaafbe32b': { name: 'Klaytn Dai', symbol: 'KDAI', price: '100.630750102465338778820291386823', price_KLAY: '1.569551' },
            },
        })
      } catch (error) {
        console.error('Unable to fetch price data:', error)
      }
    }

    fetchData()
  }, [setData])

  return data
}

export default useGetPriceData
