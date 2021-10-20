import { AbstractConnectorArguments, ConnectorUpdate } from "@web3-react/types";
import { AbstractConnector } from "@web3-react/abstract-connector";
import warning from "tiny-warning";

// type SendReturnResult = { result: any }
// type SendReturn = any

// type Send = (method: string, params?: any[]) => Promise<SendReturnResult | SendReturn>
// type SendOld = ({ method }: { method: string }) => Promise<SendReturnResult | SendReturn>

// function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
//   return sendReturn.hasOwnProperty("result") ? sendReturn.result : sendReturn;
// }

const __DEV__ = true;

export class NoKaikasProviderError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = "No Kaikas provider was found on window.klaytn.";
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super();
    this.name = this.constructor.name;
    this.message = "The user rejected the request.";
  }
}

const sendKlaytn = (options: any) => new Promise<any>((resolve, reject) => {
  console.log('sending!', options);
  window.klaytn!.sendAsync(options, (err, result) => {
    if (err) reject(err);
    else resolve(result.result);
  })
})

export class KaikasConnector extends AbstractConnector {
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs);

    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  private handleChainChanged(chainId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId);
    }
    this.emitUpdate({ chainId, provider: window.klaytn });
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts);
    }
    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  private handleClose(code: number, reason: string): void {
    if (__DEV__) {
      console.log("Handling 'close' event with payload", code, reason);
    }
    this.emitDeactivate();
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!window.klaytn) {
      throw new NoKaikasProviderError();
    }

    window.klaytn.on('accountsChanged', this.handleAccountsChanged);

    // try to activate + get account via eth_requestAccounts
    // let account;
    // try {
    //   account = await window.klaytn.sendAsync(
    //     "eth_requestAccounts"
    //   ).then((sendReturn) => parseSendReturn(sendReturn)[0]);
    // } catch (error) {
    //   if ((error as any).code === 4001) {
    //     throw new UserRejectedRequestError();
    //   }
    //   warning(
    //     false,
    //     "eth_requestAccounts was unsuccessful, falling back to enable"
    //   );
    // }

    // // if unsuccessful, try enable
    // if (!account) {
    //   // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
    //   account = await window.klaytn.enable().then(
    //     (sendReturn) => sendReturn && parseSendReturn(sendReturn)[0]
    //   );
    // }

    const accounts = await window.klaytn.enable();
    const account = accounts[0];

    return { provider: window.klaytn, ...(account ? { account } : {}) };
  }

  public async getProvider(): Promise<any> {
    return window.klaytn;
  }

  public async getChainId(): Promise<number | string> {
    if (!window.klaytn) {
      throw new NoKaikasProviderError();
    }

    let chainId;
    try {
      chainId = await sendKlaytn({ jsonrpc: '2.0', method: 'net_networkID', params: [] });
    } catch {
      warning(false, 'net_networkID was unsuccessful, falling back to net_version');
    }

    if (!chainId) {
      try {
        chainId = await sendKlaytn({ method: 'net_version', params: [], id: 67 });
      } catch {
        warning(false, 'net_version was unsuccessful');
      }
    }

    // if (!chainId) {
    //   if ((window.klaytn as any).isDapper) {
    //     chainId = parseSendReturn(
    //       (window.klaytn as any).cachedResults.net_version
    //     );
    //   } else {
    //     chainId =
    //       (window.klaytn as any).chainId ||
    //       (window.klaytn as any).netVersion ||
    //       (window.klaytn as any).networkVersion ||
    //       (window.klaytn as any)._chainId;
    //   }
    // }

    return chainId;
  }

  public async getAccount(): Promise<null | string> {
    if (!window.klaytn) {
      throw new NoKaikasProviderError();
    }

    let account;
    try {
      const accounts = await sendKlaytn({ method: 'klay_accounts', params: [], id: 1 });
      account = accounts[0];
    } catch {
      warning(false, "klay_accounts was unsuccessful, falling back to enable");
    }

    if (!account) {
      try {
        const accounts = await window.klaytn.enable();
        account = accounts[0];
      } catch {
        warning(false, 'enable was unsuccessful');
      }
    }

    return account;
  }

  public deactivate() {
    // if (window.klaytn && window.klaytn.removeListener) {
    //   window.klaytn.removeListener(
    //     "chainChanged",
    //     this.handleChainChanged
    //   );
    //   window.klaytn.removeListener(
    //     "accountsChanged",
    //     this.handleAccountsChanged
    //   );
    //   window.klaytn.removeListener("close", this.handleClose);
    //   window.klaytn.removeListener(
    //     "networkChanged",
    //     this.handleNetworkChanged
    //   );
    // }
  }

  public async isAuthorized(): Promise<boolean> {
    if (!window.klaytn) {
      return false;
    }

    try {
      const accounts = await sendKlaytn({ method: 'klay_accounts', params: [], id: 1 });
      return accounts.length > 0;
    } catch {
      return false;
    }
  }
}
