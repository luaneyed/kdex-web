import { Menu as UikitMenu } from '@pancakeswap-libs/uikit';
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core';
import { useWeb3React } from '@web3-react/core';
import { allLanguages } from 'constants/localisation/languageCodes';
import { LanguageContext } from 'hooks/LanguageContext';
import useAuth from 'hooks/useAuth';
import useGetLocalProfile from 'hooks/useGetLocalProfile';
import useGetPriceData from 'hooks/useGetPriceData';
import useTheme from 'hooks/useTheme';
import React, { useContext } from 'react';

import { isBaobab, KSP, LUAN } from '../../constants';
import links from './config';

const Menu: React.FC = (props) => {
  const web3 = useWeb3React();
  const caver = useCaverJsReact();
  const { login, logout } = useAuth();
  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext)
  const { isDark, toggleTheme } = useTheme()
  const priceData = useGetPriceData()
  const cakePriceUsd = priceData ? Number(priceData.data[(isBaobab ? LUAN : KSP).address].price) : undefined
  const profile = useGetLocalProfile();

  return (
    <>
    <UikitMenu
      links={links}
      account={(web3.account ?? caver.account) as string}
      login={login}
      logout={logout}
      isDark={isDark}
      toggleTheme={toggleTheme}
      currentLang={selectedLanguage?.code || ''}
      langs={allLanguages}
      setLang={setSelectedLanguage}
      cakePriceUsd={cakePriceUsd}
      profile={profile}
      {...props}
    />
    </>
  )
}

export default Menu
