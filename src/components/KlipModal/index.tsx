import { Flex, Modal, Text } from '@pancakeswap-libs/uikit';
import QRCode from 'qrcode.react';
import React, { useEffect, useState } from 'react';

interface Props {
  requestKey: string;
  expirationTime: number;
  onDismiss?: () => void;
}

export const KlipModal: React.FC<Props> = ({ requestKey, expirationTime, onDismiss = () => { console.log('klipModal dismiss!!') } }) => {
  const [leftMs, setLeftMs] = useState(0);
  
  useEffect(() => {
    console.log('ue!', new Date(expirationTime));
    const id = setInterval(() => setLeftMs(expirationTime - Date.now()), 1000);
    return () => clearInterval(id);
  }, [expirationTime]);

  return <Modal title="Connect to Kakao Klip via QR Code" onDismiss={onDismiss}>
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
      Left time : {Math.floor(leftMs / 60000)} : {leftMs % 60000}
    </Flex>
  </Modal>;
}
