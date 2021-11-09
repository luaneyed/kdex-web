import { JsonRpcProvider } from '@ethersproject/providers';
import { AbstractConnector } from '@sixnetwork/caverjs-react-abstract-connector';
import { AbstractConnectorArguments, ConnectorUpdate } from '@sixnetwork/caverjs-react-types';
import Caver from 'caver-js';

import getRPCHelper from './getRPCHelper';

// import warning from 'tiny-warning'
// const Caver = require("caver-js")
export class NoKlaytnProviderError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'No Klaytn provider was found on window.klaytn.'
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class KlipConnector extends AbstractConnector {
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs)
  }

  private account: string | null = null;

  private providerCaver;

  public async activate(): Promise<ConnectorUpdate> { //  Unused
    const provider = new JsonRpcProvider(await getRPCHelper(), { name: 'cypress', chainId: 8217 });
    this.providerCaver = provider;
    return { provider };
  }

  public async setAccount(account: string) {
    this.account = account;
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
