import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types';
import { getServerUrl } from '../config/network';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    hasVoted: false,
    voterChoice: null
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = `${getServerUrl()}/api`;

  // Vérifier si Metamask est installé
  const isMetamaskInstalled = () => {
    return typeof window !== 'undefined' && Boolean(window.ethereum);
  };

  // Vérifier le statut de vote (avec useCallback pour éviter les dépendances circulaires)
  const checkVotingStatus = useCallback(async (address: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/has-voted/${address}`);
      const data = await response.json();
      
      if (data.success) {
        setWallet(prev => ({
          ...prev,
          hasVoted: data.hasVoted,
          voterChoice: data.voterChoice
        }));
      }
    } catch (error) {
      console.error('Erreur vérification vote:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Gestionnaire de changement de compte (avec useCallback)
  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    console.log('Metamask accounts changed:', accounts);
    
    if (accounts.length === 0) {
      // Déconnexion
      setWallet({
        address: null,
        isConnected: false,
        hasVoted: false,
        voterChoice: null
      });
    } else {
      const newAddress = accounts[0];
      console.log('Nouveau compte détecté:', newAddress);
      
      // Réinitialiser l'état avant de vérifier le nouveau statut
      setWallet(prev => ({
        ...prev,
        address: newAddress,
        isConnected: true,
        hasVoted: false,
        voterChoice: null
      }));
      
      // Vérifier le statut de vote pour le nouveau compte
      await checkVotingStatus(newAddress);
    }
  }, [checkVotingStatus]);

  // Connecter le wallet
  const connectWallet = async () => {
    if (!isMetamaskInstalled()) {
      throw new Error('Metamask n\'est pas installé');
    }

    setLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
      }
    } catch (error) {
      console.error('Erreur connexion wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Déconnecter le wallet
  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      hasVoted: false,
      voterChoice: null
    });
  };

  // Voter pour un club
  const vote = async (clubId: number): Promise<string> => {
    if (!wallet.isConnected || !wallet.address) {
      throw new Error('Wallet non connecté');
    }

    if (wallet.hasVoted) {
      throw new Error('Vous avez déjà voté');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // ABI simplifié pour la fonction vote
    const contractABI = [
      "function vote(uint256 _clubId) external"
    ];

    // Adresse du contrat (à récupérer depuis l'API)
    const contractResponse = await fetch(`${API_BASE_URL}/contract-info`);
    const contractData = await contractResponse.json();
    
    if (!contractData.success) {
      throw new Error('Impossible de récupérer l\'adresse du contrat');
    }

    const contract = new ethers.Contract(
      contractData.contract.address,
      contractABI,
      signer
    );

    const tx = await contract.vote(clubId);
    await tx.wait();

    // Mettre à jour l'état local
    setWallet(prev => ({
      ...prev,
      hasVoted: true,
      voterChoice: clubId
    }));

    return tx.hash;
  };

  // Écouter les changements de compte
  useEffect(() => {
    // Fonction pour vérifier le compte actuel
    const checkCurrentAccount = async () => {
      if (isMetamaskInstalled()) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await handleAccountsChanged(accounts);
        }
      }
    };

    // Vérifier le compte au chargement initial
    checkCurrentAccount();

    // Configurer les écouteurs d'événements
    if (isMetamaskInstalled()) {
      // Supprimer les écouteurs précédents pour éviter les doublons
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      
      // Ajouter les nouveaux écouteurs
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [handleAccountsChanged]);

  // Fonction de rafraîchissement manuel forcé pour mettre à jour le statut depuis l'API
  const refreshWalletStatus = async () => {
    if (wallet.address) {
      await checkVotingStatus(wallet.address);
    } else if (isMetamaskInstalled()) {
      // Si pas d'adresse mais Metamask installé, vérifier le compte actuel
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
      }
    }
  };

  return {
    wallet,
    loading,
    isMetamaskInstalled,
    connectWallet,
    disconnectWallet,
    vote,
    checkVotingStatus: refreshWalletStatus,
    refreshWalletStatus
  };
}; 