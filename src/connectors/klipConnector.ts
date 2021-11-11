import { Networkish } from '@ethersproject/networks';
import { Formatter, JsonRpcProvider } from '@ethersproject/providers';
import { ConnectionInfo } from '@ethersproject/providers/node_modules/@ethersproject/web';
import { AbstractConnector } from '@sixnetwork/caverjs-react-abstract-connector';
import { AbstractConnectorArguments, ConnectorUpdate } from '@sixnetwork/caverjs-react-types';
import { AbiItem } from 'caver-js/packages/caver-utils';

import getRPCHelper from '../utils/getRPCHelper';
import { KlipTransactionExecutor } from '../utils/klipContractExecutor';

class MyFormatter extends Formatter {
  getDefaultFormats() {
    const f = super.getDefaultFormats();
    delete f.receipt.cumulativeGasUsed; //  Not supported by klaytn EN
    delete f.receipt.type;  //  Different with ethereum
    return f;
  }
}

const formatter = new MyFormatter();


export class KlipProvider extends JsonRpcProvider {
  constructor(private readonly account: string, private readonly executor: KlipTransactionExecutor, url?: ConnectionInfo | string, network?: Networkish) {
    super(url, network);
  }

  static getFormatter() {
    return formatter;
  }

  sendWithKlip(abi: AbiItem, params: any[], to: string, value: string) {
    return this.executor({ abi, params, to, value, from: this.account });
  }
}

export class KlipConnector extends AbstractConnector {
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs)
  }

  private account: string | null = null;

  private executor: KlipTransactionExecutor | null = null;

  private providerCaver;

  public async activate(): Promise<ConnectorUpdate> { //  Unused
    if (!this.account || !this.executor) {
      throw new Error('KlipConnector is not prepared');
    }
    const provider = new KlipProvider(this.account, this.executor, await getRPCHelper(), { name: 'cypress', chainId: 8217 });
    this.providerCaver = provider;
    return { provider };
  }

  public async prepare(account: string, executor: KlipTransactionExecutor) {
    this.account = account;
    this.executor = executor;
  }

  public async getProvider(): Promise<any> {
    return this.providerCaver
  }

  public async getChainId(): Promise<number | string> {
    return 8217;  //  Only Cypress
  }

  public async getAccount(): Promise<null | string> {
    return this.account;
  }

  public deactivate() {
    this.account = null;
  }
}
