import { useMemo } from 'react'
import contenthashToUri from '../utils/contenthashToUri'
import { parseENSAddress } from '../utils/parseENSAddress'
import uriToHttp from '../utils/uriToHttp'
import useENSContentHash from './useENSContentHash'

export default function useHttpLocations(useCaver: boolean, uri: string | undefined): string[] {
  const ens = useMemo(() => (uri ? parseENSAddress(uri) : undefined), [uri])
  const resolvedContentHash = useENSContentHash(useCaver, ens?.ensName);
  return useMemo(() => {
    if (ens) {
      return resolvedContentHash.contenthash ? uriToHttp(contenthashToUri(resolvedContentHash.contenthash)) : []
    } 
      return uri ? uriToHttp(uri) : []
    
  }, [ens, resolvedContentHash.contenthash, uri])
}
