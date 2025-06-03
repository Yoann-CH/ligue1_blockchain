import { useState, useEffect } from 'react';
import { Club, VoteResult, Stats, ApiResponse } from '../types';
import { getServerUrl } from '../config/network';

const API_BASE_URL = `${getServerUrl()}/api`;

export const useApi = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithErrorHandling = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.statusText}`);
    }
    return response.json();
  };

  const getClubs = async (): Promise<Club[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/clubs`);
      return data.clubs || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getResults = async (): Promise<VoteResult> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/results`);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStats = async (): Promise<Stats> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/stats`);
      return data.stats;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/health`);
      return data;
    } catch (err) {
      console.error('API Health check failed:', err);
      return null;
    }
  };

  return {
    loading,
    error,
    getClubs,
    getResults,
    getStats,
    checkHealth
  };
};

// Hook spécialisé pour les données en temps réel
export const useRealTimeData = (refreshInterval: number = 5000) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [results, setResults] = useState<VoteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  const refreshData = async () => {
    try {
      const [clubsData, resultsData] = await Promise.all([
        api.getClubs(),
        api.getResults()
      ]);
      setClubs(clubsData);
      setResults(resultsData);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    clubs,
    results,
    loading,
    refresh: refreshData
  };
}; 