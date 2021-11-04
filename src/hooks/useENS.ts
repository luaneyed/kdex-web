import { isAddress } from '../utils'
import useENSAddress from './useENSAddress'
import useENSName from './useENSName'

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
export default function useENS(
  useCaver: boolean,
  nameOrAddress?: string | null
): { loading: boolean; address: string | null; name: string | null } {
  const validated = isAddress(nameOrAddress)
  const reverseLookup = useENSName(useCaver, validated || undefined);
  const lookup = useENSAddress(useCaver, nameOrAddress);

  return {
    loading: reverseLookup.loading || lookup.loading,
    address: validated || lookup.address,
    name: reverseLookup.ENSName ? reverseLookup.ENSName : !validated && lookup.address ? nameOrAddress || null : null
  }
}
