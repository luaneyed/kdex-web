import React from 'react'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { createCaverJsReactRoot, CaverJsReactProvider } from '@sixnetwork/caverjs-react-core'
import { Provider } from 'react-redux'
import { ModalProvider } from '@pancakeswap-libs/uikit'
import { NetworkContextName } from './constants'
import store from './state'
import { getCaverLibrary, getWeb3Library } from './utils/getLibrary'
import { ThemeContextProvider } from './ThemeContext'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)
const CaverJsProviderNetwork = createCaverJsReactRoot(NetworkContextName)

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
