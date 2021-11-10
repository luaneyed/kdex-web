import axios, { AxiosError } from 'axios';
import { AbiItem } from 'caver-js/packages/caver-utils';
import { useKlipModal } from 'components/KlipModal/useKlipModal';

interface KlipTransaction {
  abi: AbiItem
  params: any[]
  to: string
  value: string
  from?: string
}

type KlipTransactionResult = { status: 'canceled' | 'error' } | { status: 'success' | 'fail', tx_hash: string };

export type KlipTransactionExecutor = (transaction: KlipTransaction) => Promise<KlipTransactionResult>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Result = { status: 'prepared' | 'canceled' | 'error' } | { status: 'success' | 'fail' | 'pending', tx_hash: string };

let curRequester: KlipContractExecution | undefined;

class KlipContractExecution {
  constructor(readonly requestKey: string, readonly expirationTime: number) {}

  async tryResult(): Promise<Result> {
    try {
      const { data: { status, result } } = await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${this.requestKey}`);

      return status === 'requested' || status === 'completed'
        ? result
        : { status };
    } catch (e) {
      if ((e as AxiosError)?.response?.status === 400) {
        return { status: 'error' };
      }
      throw e;
    }
  }

  async waitResult(interval = 700): Promise<KlipTransactionResult> {
    curRequester = this;
    while (curRequester === this) {
      const result = await this.tryResult();
      if (['error', 'success', 'fail'].includes(result.status)) {
        return result as any;
      }
      await sleep(interval);
    }
    return { status: 'canceled' };
  }
}

const executeContractWithKlip = (bappName: string) => async (inputTransaction: KlipTransaction) => {
  const transaction = {
    ...inputTransaction,
    abi: JSON.stringify(inputTransaction.abi),
    params: JSON.stringify(inputTransaction.params),
  };
  
  const { data: { request_key, expiration_time } } = await axios.post(
    'https://a2a-api.klipwallet.com/v2/a2a/prepare',
    {
      bapp: { name: bappName },
      type: 'execute_contract',
      transaction,
    },
  );

  return new KlipContractExecution(request_key, expiration_time * 1000);
};

export const useKlipContractExecutor = (bappName: string): KlipTransactionExecutor => useKlipModal(
  executeContractWithKlip(bappName),
  'Execute Transaction with Kakao Klip',
);
