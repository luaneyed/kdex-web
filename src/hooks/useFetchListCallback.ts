import { nanoid } from '@reduxjs/toolkit';
import { TokenList } from '@uniswap/token-lists';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../state';
import { fetchTokenList } from '../state/lists/actions';
import getTokenList from '../utils/getTokenList';
import resolveENSContentHashEthers, { useENSResolver } from '../utils/resolveENSContentHash';

export function useFetchListCallback(useCaver: boolean): (listUrl: string) => Promise<TokenList> {
  const dispatch = useDispatch<AppDispatch>()
  const ensResolver = useENSResolver(useCaver);

  // const ensResolver = useCallback(
  //   (ensName: string) => {
  //     if (!library || chainId !== ChainId.CYPRESS) {
  //       if (NETWORK_CHAIN_ID === ChainId.CYPRESS) {
  //         const networkLibrary = getNetworkLibrary()
  //         if (networkLibrary) {
  //           return resolveENSContentHashEthers(ensName, networkLibrary)
  //         }
  //       }
  //       throw new Error('Could not construct mainnet ENS resolver')
  //     }
  //     return resolveENSContentHashEthers(ensName, library)
  //   },
  //   [chainId, library]
  // )

  return useCallback(
    async (listUrl: string) => {
      const requestId = nanoid()
      dispatch(fetchTokenList.pending({ requestId, url: listUrl }))
      return getTokenList(listUrl, ensResolver)
        .then((tokenList) => {
          dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }))
          return tokenList
        })
        .catch((error) => {
          console.error(`Failed to get list at url ${listUrl}`, error)
          dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }))
          throw error
        })
    },
    [dispatch, ensResolver]
  )
}

export default useFetchListCallback
