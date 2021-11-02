import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@pancakeswap-libs/sdk'
import { connectorLocalStorageKey } from '@pancakeswap-libs/uikit'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { CaverJsReactContextInterface } from '@sixnetwork/caverjs-react-core/dist/types'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
// eslint-disable-next-line import/no-unresolved
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { CaverProvider } from 'klaytn-providers'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { injected } from '../connectors'
import { NetworkContextName } from '../constants'

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3ReactCore<Web3Provider>();
  const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName);

  return context.active ? context : contextNetwork
}

export function useActiveCaverReact(): CaverJsReactContextInterface<CaverProvider> & { chainId?: ChainId } {
  const context = useCaverJsReact<CaverProvider>();
  const contextNetwork = useCaverJsReact<CaverProvider>(NetworkContextName);
  return context.active ? context : contextNetwork;
}


export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      const hasSignedIn = window.localStorage.getItem(connectorLocalStorageKey)
      if (isAuthorized && hasSignedIn) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else if (isMobile && window.klaytn && hasSignedIn) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { klaytn } = window

    if (klaytn && klaytn.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch((e) => {
          console.error('Failed to activate after chain changed', e)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch((e) => {
            console.error('Failed to activate after accounts changed', e)
          })
        }
      }

      klaytn.on('networkChanged', handleChainChanged);
      klaytn.on('accountsChanged', handleAccountsChanged);

      return () => {
        // if (klaytn.removeListener) {
        //   klaytn.removeListener('chainChanged', handleChainChanged)
        //   klaytn.removeListener('accountsChanged', handleAccountsChanged)
        // }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}
