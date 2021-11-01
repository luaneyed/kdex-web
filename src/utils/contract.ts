import { Fragment, Indexed, Interface, JsonFragment, Result } from "@ethersproject/abi";
import { Block, BlockTag, Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { BytesLike } from "@ethersproject/bytes";
import { Contract, ContractFunction, ContractInterface, EventFilter, PopulatedTransaction } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/contracts/node_modules/@ethersproject/bignumber";
import { CaverContract } from "hooks/useContract";

export class EthersCommonContract implements CommonContract {
  constructor(private readonly origin: Contract) {}

  readonly callStatic = this.origin.callStatic;
  readonly estimateGas = this.origin.estimateGas;

  runMethod(name: string) {
    return (...args: Array<any>): {
      estimateGas(options: EstimateGasOptions): Promise<any>
      call(options: CallOptions): Promise<any>
      send(options: SendOptions): Promise<CommonTransactionReceipt>
    } => {
      return {
        estimateGas: (options) => Promise.resolve(null),
        call: (options) => this.origin.callStatic[name](...args),
        send: (options) => new Promise((resolve, reject) => {
          this.origin.functions[name](...args)
            .on
        }),
      }
    }
  }
}


export class CaverCommonContract implements CommonContract {
  constructor(private readonly origin: CaverContract) {}

  readonly methods = this.origin.methods;
}

export interface CommonTransactionReceipt {
  to: string;
  from: string;
  contractAddress: string,
  transactionIndex: number,
  root?: string,
  gasUsed: BigNumber,
  logsBloom: string,
  blockHash: string,
  transactionHash: string,
  logs: Array<Log>,
  blockNumber: number,
  confirmations: number,
  cumulativeGasUsed: BigNumber,
  effectiveGasPrice: BigNumber,
  byzantium: boolean,
  type: number;
  status?: number
};

interface EstimateGasOptions { from?: string, gas?: number, value?: number }
interface CallOptions { from?: string, gasPrice?: string, gas?: number }
interface SendOptions { from: string, gasPrice?: string, gas: number, value?: number }

export interface CommonContract {
  // readonly address: string;
  // readonly interface: Interface;
  // readonly signer: Signer;
  // readonly provider: Provider;
  // readonly functions: {
  //     [name: string]: ContractFunction;
  // };
  // readonly callStatic: {
  //     [name: string]: ContractFunction;
  // };
  // readonly estimateGas: {
  //     [name: string]: ContractFunction<BigNumber>;
  // };

  methods: {
    [name: string]: (...args: Array<any>) => {
      estimateGas(options: EstimateGasOptions): Promise<any>
      call(options: CallOptions): Promise<any>
      send(options: SendOptions): Promise<CommonTransactionReceipt>
    };
  };
  // readonly populateTransaction: {
  //     [name: string]: ContractFunction<PopulatedTransaction>;
  // };
  // readonly filters: {
  //     [name: string]: (...args: Array<any>) => EventFilter;
  // };
  // readonly [key: string]: ContractFunction | any;
  // readonly resolvedAddress: Promise<string>;
  // readonly deployTransaction: TransactionResponse;
  // _deployedPromise: Promise<CommonContract>;
  // _runningEvents: {
  //     [eventTag: string]: RunningEvent;
  // };
  // _wrappedEmits: {
  //     [eventTag: string]: (...args: Array<any>) => void;
  // };
  // constructor(addressOrName: string, contractInterface: ContractInterface, signerOrProvider?: Signer | Provider);
  // static getContractAddress(transaction: {
  //     from: string;
  //     nonce: BigNumberish;
  // }): string;
  // static getInterface(contractInterface: ContractInterface): Interface;
  // deployed(): Promise<CommonContract>;
  // _deployed(blockTag?: BlockTag): Promise<CommonContract>;
  // fallback(overrides?: TransactionRequest): Promise<TransactionResponse>;
  // connect(signerOrProvider: Signer | Provider | string): CommonContract;
  // attach(addressOrName: string): CommonContract;
  // static isIndexed(value: any): value is Indexed;
  // private _normalizeRunningEvent;
  // private _getRunningEvent;
  // _checkRunningEvents(runningEvent: RunningEvent): void;
  // _wrapEvent(runningEvent: RunningEvent, log: Log, listener: Listener): Event;
  // private _addEventListener;
  // queryFilter(event: EventFilter, fromBlockOrBlockhash?: BlockTag | string, toBlock?: BlockTag): Promise<Array<Event>>;
  // on(event: EventFilter | string, listener: Listener): this;
  // once(event: EventFilter | string, listener: Listener): this;
  // emit(eventName: EventFilter | string, ...args: Array<any>): boolean;
  // listenerCount(eventName?: EventFilter | string): number;
  // listeners(eventName?: EventFilter | string): Array<Listener>;
  // removeAllListeners(eventName?: EventFilter | string): this;
  // off(eventName: EventFilter | string, listener: Listener): this;
  // removeListener(eventName: EventFilter | string, listener: Listener): this;
}
