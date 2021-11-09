import { ModalProvider } from '@pancakeswap-libs/uikit';
import { CaverJsReactProvider, createCaverJsReactRoot } from '@sixnetwork/caverjs-react-core';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import React from 'react';
import { Provider } from 'react-redux';

import { CaverNetworkContextName, Web3NetworkContextName } from './constants';
import store from './state';
import { ThemeContextProvider } from './ThemeContext';
import { getCaverLibrary, getWeb3Library } from './utils/getLibrary';

const Web3ProviderNetwork = createWeb3ReactRoot(Web3NetworkContextName);
const CaverJsProviderNetwork = createCaverJsReactRoot(CaverNetworkContextName);

const Providers: React.FC = ({ children }) =>
<Web3ReactProvider getLibrary={getWeb3Library}>
  <Web3ProviderNetwork getLibrary={getWeb3Library}>
    <CaverJsReactProvider getLibrary={getCaverLibrary}>
      <CaverJsProviderNetwork getLibrary={getCaverLibrary}>
        <Provider store={store}>
          <ThemeContextProvider>
            <ModalProvider>{children}</ModalProvider>
          </ThemeContextProvider>
        </Provider>
      </CaverJsProviderNetwork>
    </CaverJsReactProvider>
  </Web3ProviderNetwork>
</Web3ReactProvider>;


export default Providers
