import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types';
import { CONTRACT_ADDRESS } from '../config/network';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// ABI minimal nécessaire pour les fonctions de vote
const WALLET_CONTRACT_ABI = [
  "function vote(uint256 _clubId) external",
  "function checkHasVoted(address _voter) external view returns (bool)",
  "function getVoterChoice(address _voter) external view returns (uint256)"
];

export const useDirectWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    hasVoted: false,
    voterChoice: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si Metamask est installé
  const isMetamaskInstalled = () => {
    return typeof window !== 'undefined' && Boolean(window.ethereum);
  };

  // Vérifier le statut de vote directement sur la blockchain
  const checkVotingStatus = useCallback(async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser un provider public pour interroger la blockchain
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia.publicnode.com");
      
      // Initialiser le contrat avec l'ABI spécifique
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        WALLET_CONTRACT_ABI,
        provider
      );

      // Vérifier si l'adresse a voté
      const hasVoted = await contract.checkHasVoted(address);
      
      let voterChoice = null;
      if (hasVoted) {
        try {
          // Récupérer le choix de l'utilisateur si l'utilisateur a voté
          const choice = await contract.getVoterChoice(address);
          voterChoice = Number(choice);
        } catch (choiceError) {
          console.error("Erreur récupération choix de vote:", choiceError);
        }
      }
      
      setWallet(prev => ({
        ...prev,
        hasVoted,
        voterChoice
      }));
    } catch (error) {
      console.error('Erreur vérification vote blockchain:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  // Gestionnaire de changement de compte
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
        isConnected: true
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
    setError(null);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
      }
    } catch (error) {
      console.error('Erreur connexion wallet:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
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

  // Voter pour un club directement via la blockchain
  const vote = async (clubId: number): Promise<string> => {
    if (!wallet.isConnected || !wallet.address) {
      throw new Error('Wallet non connecté');
    }

    if (wallet.hasVoted) {
      throw new Error('Vous avez déjà voté');
    }

    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        WALLET_CONTRACT_ABI,
        signer
      );

      // Envoyer la transaction
      const tx = await contract.vote(clubId);
      
      // Attendre la confirmation
      const receipt = await tx.wait();

      // Mettre à jour l'état local
      setWallet(prev => ({
        ...prev,
        hasVoted: true,
        voterChoice: clubId
      }));

      return tx.hash;
    } catch (error) {
      console.error('Erreur vote blockchain:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Écouter les changements de compte
  useEffect(() => {
    // Fonction pour vérifier le compte actuel
    const checkCurrentAccount = async () => {
      if (isMetamaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await handleAccountsChanged(accounts);
          }
        } catch (error) {
          console.error("Erreur vérification compte:", error);
          setError(error instanceof Error ? error.message : 'Erreur inconnue');
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

  // Fonction de rafraîchissement manuel
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
    error,
    isMetamaskInstalled,
    connectWallet,
    disconnectWallet,
    vote,
    checkVotingStatus: refreshWalletStatus,
    refreshWalletStatus
  };
}; 