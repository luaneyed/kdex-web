import { useModal } from '@pancakeswap-libs/uikit';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import { KlipModal } from '.';

interface KlipRequest {
  readonly requestKey: string;
  readonly expirationTime: number;
  waitResult(interval?: number): Promise<string | null>;
}

export const useKlipModal = (prepare: () => Promise<KlipRequest>) => {
  const [requestKey, setRequestKey] = useState('');
  const [expirationTime, setExpirationTime] = useState(0);
  const [modal, setModal] = useState<ReactElement>();
  const [showModal, closeModal] = useModal(modal);
  const [isModalShowed, setIsModalShowed] = useState(false);

  useEffect(() => {
    if (!modal && requestKey && expirationTime) {
      setModal(<KlipModal requestKey={requestKey} expirationTime={expirationTime} />);
    }
  }, [modal, requestKey, expirationTime]);

  useEffect(() => {
    if (!isModalShowed && modal) {
      setIsModalShowed(true);
      showModal();
    }
  }, [isModalShowed, modal, showModal]);

  return useCallback(async () => {
    setRequestKey('');
    setExpirationTime(0);
    setModal(undefined);
    setIsModalShowed(false);
    const request = await prepare();
    setRequestKey(request.requestKey);
    setExpirationTime(request.expirationTime);  //  -> modal is showed here
    return request.waitResult().finally(closeModal);
  }, [prepare, closeModal]);
};
