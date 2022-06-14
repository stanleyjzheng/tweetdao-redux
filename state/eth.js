import { useEffect, useState } from 'react'

import { ethers } from 'ethers'
import Onboard from 'bnc-onboard'
import { createContainer } from 'unstated-next'

import { CONTRACT_ABI } from '../config'

const networkId = process.env.NEXT_PUBLIC_RPC_NETWORK
  ? Number(process.env.NEXT_PUBLIC_RPC_NETWORK)
  : 4

const wallets = [
  { walletName: 'metamask' },
  {
    walletName: 'walletConnect',
    networkId,
    rpc: {
      [networkId]: process.env.NEXT_PUBLIC_RPC_URL ?? '',
    },
  },
];

function useEth() {
  const [address, setAddress] = useState(null)
  const [onboard, setOnboard] = useState(null)
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)

  const unlock = async () => {
    if (onboard) {
      const walletSelected = await onboard.walletSelect();
      if (walletSelected) {
        await onboard.walletCheck();
      }
      window.location.reload();
    }
  };

  const initializeOnboard = () => {
    const onboard = Onboard({
      networkId,
      hideBranding: true,
      walletSelect: {
        heading: `Connect your wallet.`,
        description: `Please select a wallet to authenticate with.`,
        wallets: wallets,
      },
      subscriptions: {
        address: async (address) => {
          setAddress(address)
          if (!address) {
            setProvider(null)
          }
        },
        wallet: async (wallet) => {
          if (wallet.provider) {
            const provider = new ethers.providers.Web3Provider(wallet.provider)
            setProvider(provider)
            window.localStorage.setItem('selectedWallet', wallet.name ?? '')
          } else {
            setProvider(null)
          }
        },
      },
      walletCheck: [{ checkName: 'connect' }, { checkName: 'network' }],
    });

    setOnboard(onboard);
  };

  useEffect(initializeOnboard, [])
  useEffect(() => {
    const previouslySelectedWallet = window.localStorage.getItem('selectedWallet')
    if (previouslySelectedWallet && onboard) {
      try {
        onboard.walletSelect(previouslySelectedWallet)
      } catch (err) {}
    }
  }, [onboard]);

  useEffect(() => {
    if (!provider) { return }

    const newContract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, CONTRACT_ABI, provider.getSigner())
    setContract(newContract)
  }, [provider])

  return { address, provider, contract, unlock }
}

export const eth = createContainer(useEth)
