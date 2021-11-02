import { connectorLocalStorageKey, ConnectorNames } from '@pancakeswap-libs/uikit';
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from '@web3-react/walletconnect-connector';
import { useKlipAuth } from 'components/KlipModal/useKlipAuth';
import { connectorsByName } from 'connectors';
import { NoKaikasProviderError } from 'connectors/KaikasConnector';
import useToast from 'hooks/useToast';
import { useCallback } from 'react';

const useAuth = () => {
  const web3Context = useWeb3React();
  const caverContext = useCaverJsReact();
  const showKlipModal = useKlipAuth();
  const { toastError } = useToast()

  const login = useCallback((connectorID: ConnectorNames) => {
    const connector = connectorsByName[connectorID]
    if (connector) {
      if (connectorID === ConnectorNames.Klip) {
        showKlipModal();
      } else {
        const context = connectorID === ConnectorNames.Kaikas ? caverContext : web3Context;
        context.activate(connector, async (error: Error) => {
          window.localStorage.removeItem(connectorLocalStorageKey)
          if (error instanceof UnsupportedChainIdError) {
            toastError('Unsupported Chain Id', 'Unsupported Chain Id Error. Check your chain Id.')
          } else if (error instanceof NoEthereumProviderError || error instanceof NoKaikasProviderError) {
            toastError('Provider Error', 'No provider was found')
          } else if (
            error instanceof UserRejectedRequestErrorInjected ||
            error instanceof UserRejectedRequestErrorWalletConnect
          ) {
            if (connector instanceof WalletConnectConnector) {
              const walletConnector = connector as WalletConnectConnector
              walletConnector.walletConnectProvider = null
            }
            toastError('Authorization Error', 'Please authorize to access your account')
          } else {
            toastError(error.name, error.message)
          }
        })
      }
    } else {
      toastError("Can't find connector", 'The connector config is wrong')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    login,
    logout: () => {
      web3Context.deactivate();
      caverContext.deactivate();
    },
  };
}

export default useAuth
