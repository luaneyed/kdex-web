import { Button, ButtonProps, useWalletModal } from '@pancakeswap-libs/uikit';
import useAuth from 'hooks/useAuth';
import useI18n from 'hooks/useI18n';
import React from 'react';

const UnlockButton: React.FC<ButtonProps> = (props) => {
  const TranslateString = useI18n()
  const { login, logout } = useAuth();
  const { onPresentConnectModal } = useWalletModal(login, logout)

  return (
    <Button onClick={onPresentConnectModal} {...props}>
      {TranslateString(292, 'Unlock Wallet')}
    </Button>
  )
}

export default UnlockButton
