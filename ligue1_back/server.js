const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Écouter sur toutes les interfaces

// Middleware CORS étendu pour le réseau local
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://10.121.74.159:3000', // Votre IP locale
    /^http:\/\/10\.121\.74\.\d+:3000$/, // Plage IP locale
    /^http:\/\/192\.168\.\d+\.\d+:3000$/, // Réseau privé classique
    /^http:\/\/172\.16\.\d+\.\d+:3000$/ // Autre plage privée
  ],
  credentials: true
}));
app.use(express.json());

// Configuration MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ligue1vote';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Schéma pour les votes
const voteSchema = new mongoose.Schema({
  voter: { type: String, required: true, unique: true },
  clubId: { type: Number, required: true },
  clubName: { type: String, required: true },
  transactionHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  blockNumber: { type: Number }
});

const Vote = mongoose.model('Vote', voteSchema);

// Configuration Ethereum
let provider, contract, contractAddress;

// Initialiser la connexion Ethereum
async function initEthereum() {
  try {
    // Utiliser un provider local ou Infura
    provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'http://localhost:8545'
    );
    
    // Charger les informations du contrat déployé
    const contractInfo = require('./deployed-contract.json');
    contractAddress = contractInfo.address;
    
    // ABI du contrat (extrait du fichier compilé)
    const contractABI = [
      "function getAllClubs() external view returns (tuple(uint256 id, string name, string logo, uint256 votes, bool exists)[] memory)",
      "function getClub(uint256 _clubId) external view returns (tuple(uint256 id, string name, string logo, uint256 votes, bool exists) memory)",
      "function getResults() external view returns (tuple(uint256 id, string name, string logo, uint256 votes, bool exists)[] memory)",
      "function getTotalVotes() external view returns (uint256)",
      "function checkHasVoted(address _voter) external view returns (bool)",
      "function getVoterChoice(address _voter) external view returns (uint256)",
      "function clubCount() external view returns (uint256)",
      "event VoteCast(address indexed voter, uint256 indexed clubId, string clubName)"
    ];
    
    contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    console.log('✅ Connexion Ethereum établie');
    console.log('📍 Adresse du contrat:', contractAddress);
    
    // Écouter les événements de vote
    setupEventListener();
    
  } catch (error) {
    console.error('❌ Erreur initialisation Ethereum:', error);
  }
}

// Écouter les événements de vote pour synchroniser avec la base
function setupEventListener() {
  if (!contract) return;
  
  contract.on('VoteCast', async (voter, clubId, clubName, event) => {
    try {
      console.log(`🗳️ Nouveau vote détecté: ${voter} a voté pour ${clubName}`);
      
      // Sauvegarder le vote dans la base
      const vote = new Vote({
        voter: voter.toLowerCase(),
        clubId: Number(clubId),
        clubName,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
      
      await vote.save();
      console.log('💾 Vote sauvegardé en base de données');
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du vote:', error);
    }
  });
}

// Routes API

// Récupérer tous les clubs
app.get('/api/clubs', async (req, res) => {
  try {
    if (!contract) {
      return res.status(500).json({ error: 'Contrat non initialisé' });
    }
    
    const clubs = await contract.getAllClubs();
    const formattedClubs = clubs.map(club => ({
      id: Number(club.id),
      name: club.name,
      logo: club.logo,
      votes: Number(club.votes),
      exists: club.exists
    }));
    
    res.json({
      success: true,
      clubs: formattedClubs,
      total: formattedClubs.length
    });
    
  } catch (error) {
    console.error('Erreur récupération clubs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clubs' });
  }
});

// Récupérer les résultats triés
app.get('/api/results', async (req, res) => {
  try {
    if (!contract) {
      return res.status(500).json({ error: 'Contrat non initialisé' });
    }
    
    const results = await contract.getResults();
    const totalVotes = await contract.getTotalVotes();
    
    const formattedResults = results.map(club => ({
      id: Number(club.id),
      name: club.name,
      logo: club.logo,
      votes: Number(club.votes),
      percentage: Number(totalVotes) > 0 ? (Number(club.votes) / Number(totalVotes) * 100).toFixed(2) : 0
    }));
    
    res.json({
      success: true,
      results: formattedResults,
      totalVotes: Number(totalVotes),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur récupération résultats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des résultats' });
  }
});

// Vérifier si une adresse a voté
app.get('/api/has-voted/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Adresse invalide' });
    }
    
    if (!contract) {
      return res.status(500).json({ error: 'Contrat non initialisé' });
    }
    
    const hasVoted = await contract.checkHasVoted(address);
    let voterChoice = null;
    
    if (hasVoted) {
      voterChoice = await contract.getVoterChoice(address);
    }
    
    res.json({
      success: true,
      hasVoted,
      voterChoice: voterChoice ? Number(voterChoice) : null
    });
    
  } catch (error) {
    console.error('Erreur vérification vote:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// Statistiques depuis la base de données
app.get('/api/stats', async (req, res) => {
  try {
    const totalVotesDB = await Vote.countDocuments();
    const votesByClub = await Vote.aggregate([
      {
        $group: {
          _id: { clubId: '$clubId', clubName: '$clubName' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const recentVotes = await Vote.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select('clubName timestamp voter');
    
    res.json({
      success: true,
      stats: {
        totalVotes: totalVotesDB,
        votesByClub,
        recentVotes
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Route pour les informations du contrat
app.get('/api/contract-info', (req, res) => {
  try {
    const contractInfo = require('./deployed-contract.json');
    res.json({
      success: true,
      contract: {
        address: contractAddress,
        network: contractInfo.network,
        deployedAt: contractInfo.deployedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Informations du contrat non disponibles' });
  }
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Ligue1Vote opérationnelle',
    timestamp: new Date().toISOString(),
    contract: !!contract,
    database: mongoose.connection.readyState === 1
  });
});

// Démarrer le serveur
app.listen(PORT, HOST, async () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  await initEthereum();
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  mongoose.connection.close();
  process.exit(0);
}); 