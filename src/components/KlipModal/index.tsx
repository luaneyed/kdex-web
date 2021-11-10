import { Flex, Modal, Text } from '@pancakeswap-libs/uikit';
// eslint-disable-next-line import/no-unresolved
import QRCode from 'qrcode.react';
import React, { useEffect, useState } from 'react';

interface Props {
  title: string;
  requestKey: string;
  expirationTime: number;
  onDismiss?: () => void;
}

export const KlipModal: React.FC<Props> = ({ title, requestKey, expirationTime, onDismiss = () => { console.log('klipModal dismiss!!') } }) => {
  const [leftMs, setLeftMs] = useState(expirationTime - Date.now());
  
  useEffect(() => {
    const id = setInterval(() => setLeftMs(expirationTime - Date.now()), 1000);
    return () => clearInterval(id);
  }, [expirationTime]);

  return <Modal title={title} onDismiss={onDismiss}>
    <Flex justifyContent="center">
      <QRCode value={`https://klipwallet.com/?target=/a2a?request_key=${requestKey}`} />
    </Flex>
    <Text
      fontSize="20px"
      bold
      style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "8px" }}
    >
      Scan the QR code through a QR code <br />
      reader or the KakaoTalk app.
    </Text>
    <Flex justifyContent="center">
      Left time : {Math.floor(leftMs / 60000)} : {Math.floor(leftMs % 60000 / 1000)}
    </Flex>
  </Modal>;
}
