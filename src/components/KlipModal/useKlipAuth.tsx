import { useModal } from '@pancakeswap-libs/uikit';
import ky from 'ky';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import { KlipModal } from '.';

export const useKlipAuth = () => {
  const [requestKey, setRequestKey] = useState('');
  const [expirationTime, setExpirationTime] = useState(Date.now());
  const [modal, setModal] = useState<ReactElement>();
  const [showModal] = useModal(modal);

  useEffect(() => {
    if (requestKey && expirationTime) {
      setModal(<KlipModal requestKey={requestKey} expirationTime={expirationTime} />);
      console.log('setmodal!');
    }
  }, [requestKey, expirationTime]);

  useEffect(() => {
    console.log('modal changed!!', modal);
    if (modal) {
      console.log('show!!');
      showModal();
    }
  }, [modal, showModal])

  return useCallback(async () => {
    const mockData = {
      bapp: {
        name: 'definix',
      },
      type: 'auth',
    }
    const request = await ky.post('https://a2a-api.klipwallet.com/v2/a2a/prepare', { json: mockData });

    const { request_key, expiration_time } = await request.json();
    setRequestKey(request_key);
    setExpirationTime(expiration_time);
    // showModal();
  }, []);
};
