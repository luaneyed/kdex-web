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
import { connectorsByName, klipConnector } from 'connectors';
import { NoKaikasProviderError } from 'connectors/KaikasConnector';
import useToast from 'hooks/useToast';
import { useCallback } from 'react';
import { useWalletType, WalletType } from 'state/atoms';
import { useKlipAuthenticationModal } from 'utils/klipAuth';

import { useKlipContractExecutor } from '../utils/klipContractExecutor';

const useAuth = () => {
  const [, setWalletType] = useWalletType();
  const web3Context = useWeb3React();
  const caverContext = useCaverJsReact();
  const authKlip = useKlipAuthenticationModal('kdex');
  const klipTransactionExecutor = useKlipContractExecutor('kdex');
  const { toastError } = useToast();

  const login = useCallback(async (connectorID: ConnectorNames) => {
    const connector = connectorsByName[connectorID]
    if (connector) {
      if (connectorID === ConnectorNames.Klip) {
        const account = await authKlip();
        if (account) {
          klipConnector.prepare(account, klipTransactionExecutor);
        } else return;
      }
      
      // const context = web3Context;
      const context = (connectorID === ConnectorNames.Kaikas || connectorID === ConnectorNames.Klip) ? caverContext : web3Context;
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
      });
      if (connectorID === ConnectorNames.Kaikas) {
        setWalletType(WalletType.Kaikas);
      } else if (connectorID === ConnectorNames.Klip) {
        setWalletType(WalletType.Klip);
      } else {
        setWalletType(WalletType.MetaMask);
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
      setWalletType(null);
    },
  };
}

export default useAuth
