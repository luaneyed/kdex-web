import { Text } from '@pancakeswap-libs/uikit';
import React, { useContext } from 'react';
import { AlertCircle, CheckCircle } from 'react-feather';
import styled, { ThemeContext } from 'styled-components';

import { useActiveWeb3Context } from '../../hooks';
import { getKlaytnScopeLink } from '../../utils';
import { AutoColumn } from '../Column';
import { AutoRow } from '../Row';
import { ExternalLink } from '../Shared';

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function TransactionPopup({
  hash,
  success,
  summary,
  useCaver,
}: {
  hash: string
  success?: boolean
  summary?: string
  useCaver: boolean
}) {
  const { chainId } = useActiveWeb3Context(useCaver);

  const theme = useContext(ThemeContext)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? (
          <CheckCircle color={theme.colors.success} size={24} />
        ) : (
          <AlertCircle color={theme.colors.failure} size={24} />
        )}
      </div>
      <AutoColumn gap="8px">
        <Text>{summary ?? `Hash: ${hash.slice(0, 8)}...${hash.slice(58, 65)}`}</Text>
        {chainId && <ExternalLink href={getKlaytnScopeLink(chainId, hash, 'transaction')}>View on klaytnscope</ExternalLink>}
      </AutoColumn>
    </RowNoFlex>
  )
}
