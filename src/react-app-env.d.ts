/// <reference types="react-scripts" />

declare module 'jazzicon' {
  export default function(diameter: number, seed: number): HTMLElement
}

declare module 'fortmatic'

interface Window {
  ethereum?: {
    isMetaMask?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
  }
  web3?: any
  klaytn?: any
  caver?: any
  // klaytn?: KlaytnAPI
}

declare module 'content-hash' {
  declare function decode(x: string): string
  declare function getCodec(x: string): string
}

declare module 'multihashes' {
  declare function decode(buff: Uint8Array): { code: number; name: string; length: number; digest: Uint8Array }
  declare function toB58String(hash: Uint8Array): string
}

interface KlaytnAPI {
  sendAsync: (options: any, callback: (err, result: any) => void) => void //  https://docs.kaikas.io/02_api_reference/01_klaytn_provider#klaytn.sendasync-options-callback
  enable: () => Promise<string[]>
  on: (method: 'accountsChanged' | 'networkChanged', listener: (...args: any[]) => void) => void
  on: (method: 'accountsChanged', listener: (accounts: string[]) => void) => void
  on: (method: 'networkChanged', listener: () => void) => void
}
