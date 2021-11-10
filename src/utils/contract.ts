import { Contract } from '@ethersproject/contracts';
import { Interface, ParamType } from '@ethersproject/contracts/node_modules/@ethersproject/abi';
import { BigNumber } from '@ethersproject/contracts/node_modules/@ethersproject/bignumber';
import { Contract as CaverContract } from 'caver-js';
import { TransactionReceipt } from 'caver-js/packages/caver-rtm';
import { AbiOutput, StateMutabilityType } from 'caver-js/packages/caver-utils';

import { KlipProvider } from './klipConnector';

export { CaverContract }

export class EthersCommonContract implements CommonContract {
  constructor(private readonly origin: Contract) {}

  readonly address = this.origin.address;

  readonly interface = this.origin.interface;

  readonly methods = Object.fromEntries(
    Object.keys(this.origin.functions)
      .map((name) => [
        name,
        (...args: Array<any>) => ({
          estimateGas: (options: EstimateGasOptions) => this.origin.estimateGas[name](...args, options),
          call: (options: CallOptions) => this.origin.callStatic[name](...args, options),
          send: (options: SendOptions): Promise<CommonTransactionReceipt> => this.origin[name](...args, options),
        }),
      ])
  );
}

export class CaverCommonContract implements CommonContract {
  constructor(protected readonly origin: CaverContract, protected readonly inter: Interface, protected readonly account?: string) {}

  readonly address = this.origin.options.address;
  
  readonly interface = this.inter;

  readonly methods = Object.fromEntries(
    Object.entries(this.origin.methods)
    .map(([name, method]) => [
      name,
      (...args: Array<any>) => {
        const withArgs = (method as any)(...args);
        return ({
          //  todo : remove default account
          estimateGas: ({ from = this.account, gasLimit, value }: EstimateGasOptions) => withArgs.estimateGas({ from, gas: gasLimit, value }),
          //  klaytn은 call에 value 넘기면 에러 나서 못 넘김
          call: ({ from = this.account, gasPrice, gasLimit }: CallOptions) => withArgs.call({ from, gasPrice, gas: gasLimit }),
          send: async ({ from = this.account, gasPrice, gasLimit, value }: SendOptions): Promise<CommonTransactionReceipt> => {
            const r: TransactionReceipt = await withArgs.send({ from, gasPrice, gas: gasLimit, value });
            return {
              to: r.to,
              from: r.from,
              contractAddress: r.contractAddress,
              transactionIndex: r.transactionIndex === null ? null : Number(r.transactionIndex),
              gasUsed: BigNumber.from(r.gasUsed),
              logsBloom: r.logsBloom,
              blockHash: r.blockHash,
              transactionHash: r.transactionHash,
              logs: r.logs?.map((l) => ({
                blockNumber: l.blockNumber === undefined ? undefined : Number(l.blockNumber),
                blockHash: l.blockHash,
                transactionIndex: l.transactionIndex === undefined ? undefined : Number(l.transactionIndex),
                removed: l.removed,
                address: l.address,
                data: l.data,
                topics: l.topics,
                transactionHash: l.transactionHash,
                logIndex: l.logIndex === undefined ? undefined : Number(l.logIndex),
              })),
              blockNumber: r.blockNumber === undefined ? undefined : Number(r.blockNumber),
              // type: r.typeInt,
            }
          },
      });
      }])
  );
}

export class KlipCommonContract extends CaverCommonContract {
  constructor(private readonly provider: KlipProvider, _origin: CaverContract, _inter: Interface, _account?: string) {
    super(_origin, _inter, _account);
  }

  private convertOutput(output: ParamType): AbiOutput {
    return {
      name: output.name,
      type: output.type,
      components: output.components?.map((c) => this.convertOutput(c)),
    };
  }

  readonly methods = Object.fromEntries(
    Object.entries(this.origin.methods)
    .map(([name, method]) => [
      name,
      (...args: Array<any>) => ({
        //  todo : remove default account
        estimateGas: ({ from = this.account, gasLimit, value }: EstimateGasOptions) => (method as any)(...args).estimateGas({ from, gas: gasLimit, value }),
        //  klaytn은 call에 value 넘기면 에러 나서 못 넘김
        call: ({ from = this.account, gasPrice, gasLimit }: CallOptions) => (method as any)(...args).call({ from, gasPrice, gas: gasLimit }),
        send: async ({ value }: SendOptions): Promise<CommonTransactionReceipt> => {
          const fn = this.inter.getFunction(name);
          const abi = {
            constant: fn.constant,
            inputs: fn.inputs.map((i) => ({ name: i.name, type: i.type })),
            name: fn.name,
            outputs: fn.outputs?.map((o) => this.convertOutput(o)),
            payable: fn.payable,
            stateMutability: fn.stateMutability as StateMutabilityType,
            type: fn.type,
          };

          //  Klip은 uint256에 hex 넘기면 invalid params 에러 남
          const params = args.map((a, i) => abi.inputs![i].type === 'uint256' ? BigNumber.from(a).toString() : a);
          const minUnit = '1000000000000';

          const result = await this.provider.sendWithKlip(abi, params, this.address, value ? BigNumber.from(value).div(minUnit).mul(minUnit).toString() : '0');
          if (result.status !== 'success') {
            throw new Error('Transacion failed!');
          }
          const { tx_hash } = result;

          const r = await this.provider.getTransactionReceipt(tx_hash);
          console.log('Klip Transaction Receipt', r);

          return {
            to: r.to,
            from: r.from,
            contractAddress: r.contractAddress,
            transactionIndex: r.transactionIndex === null ? null : Number(r.transactionIndex),
            gasUsed: BigNumber.from(r.gasUsed),
            logsBloom: r.logsBloom,
            blockHash: r.blockHash,
            transactionHash: r.transactionHash,
            logs: r.logs?.map((l) => ({
              blockNumber: l.blockNumber === undefined ? undefined : Number(l.blockNumber),
              blockHash: l.blockHash,
              transactionIndex: l.transactionIndex === undefined ? undefined : Number(l.transactionIndex),
              removed: l.removed,
              address: l.address,
              data: l.data,
              topics: l.topics,
              transactionHash: l.transactionHash,
              logIndex: l.logIndex === undefined ? undefined : Number(l.logIndex),
            })),
            blockNumber: r.blockNumber === undefined ? undefined : Number(r.blockNumber),
            // type: r.t,
          }
        },
      }),
    ])
  );
}

export interface CommonTransactionReceipt {
  to: string | null;
  from: string;
  contractAddress: string,
  transactionIndex: number | null;
  // root?: string,
  gasUsed: BigNumber;
  logsBloom: string;
  blockHash: string;
  transactionHash: string;
  logs?: {
    blockNumber?: number;
    blockHash?: string;
    transactionIndex?: number;

    removed?: boolean;

    address?: string;
    data?: string;

    topics?: Array<string>;

    transactionHash?: string;
    logIndex?: number;
  }[];
  blockNumber?: number;
  // confirmations: number,
  // cumulativeGasUsed: BigNumber,
  // effectiveGasPrice: BigNumber,
  // byzantium: boolean,
  // type: number;
  // status?: number
}

interface EstimateGasOptions { from?: string, gasLimit?: number, value?: string | BigNumber }
interface CallOptions { from?: string, gasPrice?: string, gasLimit?: number, value?: string | BigNumber }
interface SendOptions { from?: string, gasPrice?: string, gasLimit?: number, value?: string | BigNumber }

export interface CommonContract {
  readonly address: string;
  readonly interface: Interface;
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
      estimateGas(options: EstimateGasOptions): Promise<BigNumber>
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
