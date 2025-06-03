import React from 'react';
import { Button } from './ui/Button';
import { useDirectWallet } from '../hooks/useDirectWallet';

const Header: React.FC = () => {
  const { wallet, loading, error, isMetamaskInstalled, connectWallet, disconnectWallet, refreshWalletStatus } = useDirectWallet();

  const handleWalletAction = async () => {
    if (wallet.isConnected) {
      disconnectWallet();
    } else {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Erreur connexion:', error);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Fonction pour rafraîchir manuellement le statut du wallet
  const handleRefreshStatus = async () => {
    if (wallet.isConnected) {
      await refreshWalletStatus();
    }
  };

  return (
    <header className="bg-black text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <img 
              src="/images/Logo_Ligue_1_McDonalds.svg" 
              alt="Logo Ligue 1 McDonald's" 
              className="h-12"
            />
            <div>
              <h1 className="text-xl font-bold">Ligue 1 Vote</h1>
              <p className="text-xs text-gray-400">Vote pour ton club préféré sur la blockchain</p>
            </div>
          </div>

          {/* Informations de vote et wallet */}
          <div className="flex items-center space-x-4">
            {wallet.hasVoted && (
              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                <p className="text-sm font-medium">✅ Vous avez voté !</p>
                <p className="text-xs text-gray-400">Merci pour votre participation</p>
              </div>
            )}

            {/* Afficher l'erreur si présente */}
            {error && (
              <div className="bg-red-900 rounded-lg px-4 py-2 border border-red-800">
                <p className="text-xs text-white">⚠️ {error.includes(':') ? error.split(':')[0] : error}</p>
              </div>
            )}

            {/* État du wallet */}
            <div className="flex items-center space-x-3">
              {wallet.isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {formatAddress(wallet.address!)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshStatus}
                    disabled={loading}
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 px-2 py-1"
                    title="Rafraîchir le statut"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>🔄</span>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-sm">Non connecté</span>
                </div>
              )}

              {/* Bouton de connexion */}
              {!isMetamaskInstalled() ? (
                <Button
                  variant="outline"
                  onClick={() => window.open('https://metamask.io/', '_blank')}
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  Installer Metamask
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleWalletAction}
                  disabled={loading}
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                      <span>Connexion...</span>
                    </div>
                  ) : wallet.isConnected ? (
                    'Déconnecter'
                  ) : (
                    'Connecter Metamask'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 