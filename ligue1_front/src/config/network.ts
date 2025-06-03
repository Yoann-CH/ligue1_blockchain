// Configuration réseau pour l'application
export const getServerUrl = () => {
  // En développement, détecter si on est sur localhost ou réseau local
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Si on accède via l'IP du réseau local, utiliser la même IP pour l'API
  if (hostname.match(/^10\.121\.74\.\d+$/)) {
    return `http://${hostname.replace(/\d+$/, '159')}:3001`; // Votre IP
  }
  
  // Autres plages d'IP privées
  if (hostname.match(/^192\.168\.\d+\.\d+$/)) {
    return `http://10.121.74.159:3001`; // Remplacer par votre IP
  }
  
  // Par défaut
  return 'http://10.121.74.159:3001';
};

// Configuration Hardhat pour le réseau local
export const getHardhatRpcUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8545';
  }
  
  // Pour les autres appareils du réseau
  return 'http://10.121.74.159:8545';
};

// Configuration Metamask pour le réseau
export const NETWORK_CONFIG = {
  name: 'Hardhat Local Network',
  chainId: '31337',
  symbol: 'ETH',
  rpcUrl: getHardhatRpcUrl(),
  blockExplorer: ''
}; 