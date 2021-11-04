import { namehash } from 'ethers/lib/utils';
import { useMemo } from 'react';

import { useSingleCallResult } from '../state/multicall/hooks';
import isZero from '../utils/isZero';
import { useENSRegistrarContract, useENSResolverContract } from './useContract';

/**
 * Does a lookup for an ENS name to find its contenthash.
 */
export default function useENSContentHash(useCaver: boolean, ensName?: string | null): { loading: boolean; contenthash: string | null } {
  const ensNodeArgument = useMemo(() => {
    if (!ensName) return [undefined]
    try {
      return ensName ? [namehash(ensName)] : [undefined]
    } catch (error) {
      return [undefined]
    }
  }, [ensName])
  
  const registrarContract = useENSRegistrarContract(useCaver, false);
  const resolverAddressResult = useSingleCallResult(useCaver, registrarContract, 'resolver', ensNodeArgument)
  const resolverAddress = resolverAddressResult.result?.[0]
  const resolverContract = useENSResolverContract(
    useCaver,
    resolverAddress && isZero(resolverAddress) ? undefined : resolverAddress,
    false
  )
  const contenthash = useSingleCallResult(useCaver, resolverContract, 'contenthash', ensNodeArgument)

  return {
    contenthash: contenthash.result?.[0] ?? null,
    loading: resolverAddressResult.loading || contenthash.loading
  }
}
