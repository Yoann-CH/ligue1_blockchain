import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Club, VoteResult } from '../types';
import { CONTRACT_ADDRESS } from '../config/network';

const LIGUE1_CONTRACT_ABI = [
  "function getAllClubs() external view returns (tuple(uint256 id, string name, string logo, uint256 votes, bool exists)[] memory)",
  "function getResults() external view returns (tuple(uint256 id, string name, string logo, uint256 votes, bool exists)[] memory)",
  "function getTotalVotes() external view returns (uint256)"
];

export const useDirectBlockchainData = (refreshInterval: number = 5000) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [results, setResults] = useState<VoteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Utiliser un provider public pour Sepolia
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia.publicnode.com");
      
      // Créer une instance du contrat
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        LIGUE1_CONTRACT_ABI,
        provider
      );

      // Récupérer les données
      const [clubsData, totalVotes] = await Promise.all([
        contract.getAllClubs(),
        contract.getTotalVotes()
      ]);

      // Formater les clubs
      const formattedClubs = clubsData.map((club: any) => ({
        id: Number(club.id),
        name: club.name,
        logo: club.logo,
        votes: Number(club.votes),
        exists: club.exists
      }));

      // Trier les clubs par votes pour les résultats
      const sortedResults = [...formattedClubs]
        .sort((a, b) => b.votes - a.votes)
        .map(club => ({
          ...club,
          percentage: Number(totalVotes) > 0 ? 
            parseFloat(((Number(club.votes) / Number(totalVotes)) * 100).toFixed(2)) : 0
        }));

      setClubs(formattedClubs);
      setResults({
        success: true,
        results: sortedResults,
        totalVotes: Number(totalVotes),
        timestamp: new Date().toISOString()
      });
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des données blockchain:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    clubs,
    results,
    loading,
    error,
    refresh: refreshData
  };
}; 