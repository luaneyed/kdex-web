import { atom, useRecoilState } from 'recoil';

export enum WalletType {
  MetaMask,
  Kaikas,
  Klip,
}

export const walletType = atom<WalletType | null>({
  key: 'walletType',
  default: null
});

export const useWalletType = () => useRecoilState(walletType);
