import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { CaverProvider, Formatter } from 'klaytn-providers';

export function getWeb3Library(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 15000
  return library
}

class MyFormatter extends Formatter {
  getDefaultFormats() {
    const f = super.getDefaultFormats();
    delete f.receipt.cumulativeGasUsed; //  Not supported by klaytn EN
    delete f.receipt.type;  //  Different with ethereum
    return f;
  }
}

const formatter = new MyFormatter();

class MyCaverProvider extends CaverProvider {
  static getFormatter() {
    return formatter;
  }
}

export function getCaverLibrary(provider: any): CaverProvider | JsonRpcProvider {
  if (provider instanceof JsonRpcProvider) {
    return provider
  }
  const library = new MyCaverProvider(provider)
  library.pollingInterval = 15000
  return library
}
