import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { CaverProvider } from 'klaytn-providers';

export function getWeb3Library(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 15000
  return library
}

export function getCaverLibrary(provider: any): CaverProvider | JsonRpcProvider {
  console.log('provider!', provider);
  if (provider instanceof JsonRpcProvider) {
    return provider
  }
  const library = new CaverProvider(provider)
  library.pollingInterval = 15000
  return library
}
