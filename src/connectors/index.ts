import { Web3Provider } from '@ethersproject/providers';
import { ConnectorNames } from '@pancakeswap-libs/uikit';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
// import { KlipConnector } from '@sixnetwork/klip-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { KlipConnector } from 'utils/klipConnector';

import { KaikasConnector } from './KaikasConnector';
import { NetworkConnector } from './NetworkConnector';

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL

export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? '1001')

if (typeof NETWORK_URL === 'undefined') {
  throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
}

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL },
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  // eslint-disable-next-line no-return-assign
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({
  supportedChainIds: [8217, 1001],
})

export const kaikasConnector = new KaikasConnector({ supportedChainIds: [8217, 1001] });
// KlipConnector의 actiavte 구현이 엉망이라서 modal 기능 안 쓰고 직접 구현
export const klipConnector = new KlipConnector({ supportedChainIds: [8217] });

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { [NETWORK_CHAIN_ID]: NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000,
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Uniswap',
  appLogoUrl:
    'https://mpng.pngfly.com/20181202/bex/kisspng-emoji-domain-unicorn-pin-badges-sticker-unicorn-tumblr-emoji-unicorn-iphoneemoji-5c046729264a77.5671679315437924251569.jpg',
})

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.Kaikas]: kaikasConnector,
  [ConnectorNames.Klip]: klipConnector,
}
