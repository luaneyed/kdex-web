import React from 'react';

import { useActiveWeb3Context } from '../../hooks';
import Modal from '../Modal';
import ConfirmationPendingContent from './ConfirmationPendingContent';
import TransactionSubmittedContent from './TransactionSubmittedContent';

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  useCaver: boolean
}

const TransactionConfirmationModal = ({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  useCaver,
}: ConfirmationModalProps) => {
  const { chainId } = useActiveWeb3Context(useCaver);

  if (!chainId) return null

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
      ) : (
        content()
      )}
    </Modal>
  )
}

export default TransactionConfirmationModal
