# ⚽ Ligue 1 Vote - Application de Vote Blockchain

Une application fullstack décentralisée permettant de voter pour le meilleur club de Ligue 1, utilisant la blockchain Ethereum pour garantir la transparence et l'intégrité des votes.

## 🌟 Fonctionnalités

### ⛓️ Blockchain & Smart Contract
- **Smart contract Ethereum** avec protection anti-double vote (1 vote par wallet)
- **Événements blockchain** pour traçabilité complète
- **Tests unitaires** complets avec Hardhat
- **Déploiement automatisé** sur réseau local ou testnet

### 🔗 Backend API (Node.js/Express)
- **API REST** complète pour interactions avec le smart contract
- **Base de données MongoDB** pour agrégation et statistiques
- **Listener d'événements** blockchain pour synchronisation automatique
- **Endpoints** pour clubs, résultats, stats et vérifications

### 🎨 Frontend React
- **Interface moderne** avec Tailwind CSS et animations
- **Intégration Metamask** pour connexion wallet
- **Graphiques interactifs** avec Recharts (barres, secteurs, podium)
- **Mode temps réel** avec rafraîchissement automatique
- **Notifications** élégantes avec react-toastify
- **Design responsive** adaptatif

## 🏗️ Architecture du Projet

```
ligue1_blockchain/
├── ligue1_back/                 # Backend & Smart Contract
│   ├── contracts/
│   │   └── Ligue1Vote.sol      # Smart contract principal
│   ├── scripts/
│   │   └── deploy.js           # Script de déploiement
│   ├── test/
│   │   └── Ligue1Vote.js       # Tests unitaires
│   ├── server.js               # Serveur Express
│   ├── hardhat.config.js       # Configuration Hardhat
│   └── package.json
│
└── ligue1_front/               # Frontend React
    ├── src/
    │   ├── components/         # Composants React
    │   │   ├── ui/            # Composants UI de base
    │   │   ├── Header.tsx     # Header avec connexion Metamask
    │   │   ├── ClubCard.tsx   # Carte de club pour voter
    │   │   └── ResultsChart.tsx # Graphiques des résultats
    │   ├── hooks/             # Hooks personnalisés
    │   │   ├── useWallet.ts   # Gestion Metamask
    │   │   └── useApi.ts      # Appels API
    │   ├── types/             # Types TypeScript
    │   ├── lib/               # Utilitaires
    │   └── App.tsx            # Application principale
    └── package.json
```

## 🚀 Installation et Configuration

### Prérequis
- **Node.js** (v16 ou supérieur)
- **npm** ou **yarn**
- **Metamask** (extension navigateur)
- **MongoDB** (local ou cloud)
- **Git**

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd ligue1_blockchain
```

### 2. Configuration Backend

```bash
cd ligue1_back

# Installer les dépendances
npm install

# Copier et configurer l'environnement
cp env.example .env
```

Éditer le fichier `.env` :
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ligue1vote
ETHEREUM_RPC_URL=http://localhost:8545
# Pour testnet: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
```

### 3. Configuration Frontend

```bash
cd ../ligue1_front

# Installer les dépendances
npm install
```

## 🎯 Lancement de l'Application

### Option 1: Réseau Local (Développement)

#### Terminal 1 - Blockchain locale
```bash
cd ligue1_back
npm run node:start
```

#### Terminal 2 - Déploiement du contrat
```bash
cd ligue1_back
npm run deploy:local
```

#### Terminal 3 - Backend API
```bash
cd ligue1_back
npm run dev
```

#### Terminal 4 - Frontend React
```bash
cd ligue1_front
npm start
```

### Option 2: Testnet (Production)

#### 1. Configurer Metamask pour le testnet Sepolia
- Ajouter le réseau Sepolia
- Obtenir des ETH de test depuis un faucet

#### 2. Déployer sur testnet
```bash
cd ligue1_back
npm run deploy:sepolia
```

#### 3. Lancer l'application
```bash
# Backend
npm run dev

# Frontend (nouveau terminal)
cd ../ligue1_front
npm start
```

## 🧪 Tests

### Tests du Smart Contract
```bash
cd ligue1_back
npm test
```

Les tests couvrent :
- ✅ Déploiement correct
- ✅ Initialisation des clubs
- ✅ Fonctionnalité de vote
- ✅ Protection anti-double vote
- ✅ Récupération des résultats
- ✅ Sécurité du contrat

## 📊 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/clubs` | Liste tous les clubs |
| GET | `/api/results` | Résultats triés par votes |
| GET | `/api/has-voted/:address` | Vérifier si une adresse a voté |
| GET | `/api/stats` | Statistiques détaillées |
| GET | `/api/contract-info` | Informations du contrat |
| GET | `/api/health` | État de santé de l'API |

## 🎮 Utilisation

### 1. Connexion Wallet
- Cliquer sur "Connecter Metamask"
- Autoriser la connexion dans Metamask
- Votre adresse apparaît dans le header

### 2. Voter
- Onglet "🗳️ Voter"
- Choisir votre club préféré
- Cliquer "Voter pour [Club]"
- Confirmer la transaction dans Metamask
- Attendre la confirmation blockchain

### 3. Voir les Résultats
- Onglet "📊 Résultats"
- Graphiques en temps réel
- Classement détaillé
- Podium des 3 premiers

## 🎨 Fonctionnalités UI/UX

### 🌈 Design
- **Gradient football** (bleu → vert)
- **Animations fluides** (fade-in, slide-up, bounce)
- **Cartes interactives** avec effets hover
- **Mode sombre/clair** (basé sur les préférences système)

### 📱 Responsive
- **Mobile First** design
- **Grille adaptative** pour les clubs
- **Navigation tactile** optimisée

### 🔔 Notifications
- **Succès** : Vote confirmé
- **Erreur** : Problèmes de connexion
- **Warning** : Double vote tenté
- **Info** : État des transactions

## 🔧 Technologies Utilisées

### Backend
- **Hardhat** - Framework Ethereum
- **Solidity** - Langage smart contract
- **Express.js** - Serveur API
- **MongoDB/Mongoose** - Base de données
- **ethers.js** - Interaction blockchain

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Recharts** - Graphiques
- **React-Toastify** - Notifications

## 🔒 Sécurité

### Smart Contract
- ✅ **Anti-double vote** par adresse
- ✅ **Validation des paramètres**
- ✅ **Gestion des erreurs**
- ✅ **Événements tracés**

### Application
- ✅ **Validation côté client et serveur**
- ✅ **Gestion des erreurs réseau**
- ✅ **Vérification des adresses Ethereum**
- ✅ **Variables d'environnement sécurisées**

## 🚢 Déploiement Production

### Backend
```bash
# Build pour production
npm run build

# Variables d'environnement
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://...
export ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/...

# Démarrer
npm start
```

### Frontend
```bash
# Build optimisé
npm run build

# Servir les fichiers statiques
npx serve -s build
```

## 🐛 Dépannage

### Problèmes courants

#### "Metamask non détecté"
- Installer l'extension Metamask
- Actualiser la page
- Vérifier que Metamask est débloqué

#### "Contrat non initialisé"
- Vérifier que le backend est démarré
- Contrôler le fichier `deployed-contract.json`
- Redéployer le contrat si nécessaire

#### "Erreur de connexion MongoDB"
- Démarrer MongoDB localement
- Vérifier l'URI dans `.env`
- Contrôler les permissions

## 📈 Améliorations Futures

### 🎯 Fonctionnalités
- [ ] **Système de saisons** (votes périodiques)
- [ ] **Profils utilisateurs** avec historique
- [ ] **Notifications push** pour nouveaux votes
- [ ] **Mode tournoi** avec éliminations
- [ ] **Integration réseaux sociaux**

### 🔧 Technique
- [ ] **Cache Redis** pour performances
- [ ] **WebSockets** pour temps réel
- [ ] **Progressive Web App**
- [ ] **Tests end-to-end**
- [ ] **CI/CD Pipeline**

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- **Votre Nom** - *Développement initial* - [@votre-github](https://github.com/votre-username)

## 🙏 Remerciements

- **OpenZeppelin** pour les standards de sécurité
- **Hardhat** pour l'excellent framework
- **Tailwind CSS** pour le design system
- **Metamask** pour l'intégration wallet
- **Ligue de Football Professionnel** pour l'inspiration

---

⚽ **Happy Coding & Allez votre équipe !** ⚽ 