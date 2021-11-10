import { useModal } from '@pancakeswap-libs/uikit';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import { KlipModal } from '.';

export interface KlipRequest<R> {
  readonly requestKey: string;
  readonly expirationTime: number;
  waitResult(interval?: number): Promise<R>;
}

export const useKlipModal = <R, T extends (...args: any[]) => Promise<KlipRequest<R>>>(prepare: T, title: string) => {
  const [requestKey, setRequestKey] = useState('');
  const [expirationTime, setExpirationTime] = useState(0);
  const [modal, setModal] = useState<ReactElement>();
  const [showModal, closeModal] = useModal(modal);
  const [isModalShowed, setIsModalShowed] = useState(false);

  useEffect(() => {
    if (!modal && requestKey && expirationTime) {
      setModal(<KlipModal title={title} requestKey={requestKey} expirationTime={expirationTime} />);
    }
  }, [title, modal, requestKey, expirationTime]);

  useEffect(() => {
    if (!isModalShowed && modal) {
      setIsModalShowed(true);
      showModal();
    }
  }, [isModalShowed, modal, showModal]);

  return useCallback(async (...args: Parameters<T>) => {
    setRequestKey('');
    setExpirationTime(0);
    setModal(undefined);
    setIsModalShowed(false);
    const request = await prepare(...args);
    setRequestKey(request.requestKey);
    setExpirationTime(request.expirationTime);  //  -> modal is showed here
    return request.waitResult().finally(closeModal);
  }, [prepare, closeModal]);
};
