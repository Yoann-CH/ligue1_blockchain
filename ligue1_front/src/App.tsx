import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import ClubCard from './components/ClubCard';
import ResultsChart from './components/ResultsChart';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { useDirectBlockchainData } from './hooks/useDirectBlockchainData';

type TabType = 'vote' | 'results';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('vote');
  const { clubs, results, loading, error, refresh } = useDirectBlockchainData(10000); // Refresh toutes les 10 secondes

  const handleVoteSuccess = () => {
    // Rafraîchir les données après un vote réussi
    setTimeout(() => {
      refresh();
    }, 2000);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    refresh(); // Rafraîchir lors du changement d'onglet
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Navigation par onglets */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 rounded-lg p-1 shadow-lg border border-gray-800">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === 'vote' ? 'primary' : 'ghost'}
                onClick={() => handleTabChange('vote')}
                className="px-6 py-2"
              >
                🗳️ Voter
              </Button>
              <Button
                variant={activeTab === 'results' ? 'primary' : 'ghost'}
                onClick={() => handleTabChange('results')}
                className="px-6 py-2"
              >
                📊 Résultats
              </Button>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-900 text-white p-4 rounded-lg mb-8 animate-fade-in">
            <h3 className="font-bold flex items-center">
              <span className="mr-2">⚠️</span> Erreur de connexion à la blockchain
            </h3>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              className="mt-2 bg-red-800 hover:bg-red-700 border-red-700"
              onClick={refresh}
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement des données depuis la blockchain...</p>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        {!loading && !error && (
          <>
            {activeTab === 'vote' && (
              <div className="space-y-8">
                {/* Informations générales */}
                <Card className="animate-fade-in bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>⚽</span>
                      <span>Vote pour le meilleur club de Ligue 1</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-3xl font-bold text-white">
                          {results?.totalVotes || 0}
                        </div>
                        <p className="text-sm text-gray-400">Votes totaux</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-3xl font-bold text-white">
                          {clubs.length}
                        </div>
                        <p className="text-sm text-gray-400">Clubs en compétition</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-3xl font-bold text-white">
                          {clubs.filter(club => club.votes > 0).length}
                        </div>
                        <p className="text-sm text-gray-400">Clubs avec des votes</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <p className="text-gray-300 mb-4">
                        Connectez votre wallet Metamask et votez pour votre club préféré de Ligue 1 !
                        <br />
                        <strong>Un seul vote par wallet autorisé.</strong>
                      </p>
                      <Button
                        variant="outline"
                        onClick={refresh}
                        className="mr-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                      >
                        🔄 Actualiser
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Grille des clubs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {clubs.map((club, index) => (
                    <div
                      key={club.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ClubCard
                        club={club}
                        onVoteSuccess={handleVoteSuccess}
                      />
                    </div>
                  ))}
                </div>

                {/* Message si pas de clubs */}
                {clubs.length === 0 && !error && !loading && (
                  <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardContent className="text-center py-12">
                      <div className="text-6xl mb-4">⚽</div>
                      <h3 className="text-xl font-semibold mb-2">Aucun club disponible</h3>
                      <p className="text-gray-300 mb-4">
                        Les clubs de Ligue 1 ne sont pas encore chargés.
                      </p>
                      <Button onClick={refresh}>
                        Recharger
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-8">
                {/* Header des résultats */}
                <Card className="animate-fade-in bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>📊</span>
                        <span>Résultats en temps réel</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          Dernière mise à jour: {results?.timestamp ? new Date(results.timestamp).toLocaleTimeString('fr-FR') : 'N/A'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refresh}
                          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        >
                          🔄
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">
                      Découvrez les résultats du vote en temps réel. Les données sont directement 
                      récupérées depuis la blockchain Ethereum (réseau Sepolia).
                    </p>
                  </CardContent>
                </Card>

                {/* Graphiques des résultats */}
                <ResultsChart 
                  clubs={results?.results || clubs}
                  totalVotes={results?.totalVotes || 0}
                />

                {/* Tableau détaillé */}
                <Card className="animate-slide-up bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>📋</span>
                      <span>Classement détaillé</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4">Position</th>
                            <th className="text-left py-3 px-4">Club</th>
                            <th className="text-center py-3 px-4">Votes</th>
                            <th className="text-center py-3 px-4">Pourcentage</th>
                            <th className="text-center py-3 px-4">Barre de progression</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(results?.results || clubs)
                            .sort((a, b) => b.votes - a.votes)
                            .map((club, index) => (
                              <tr key={club.id} className="border-b border-gray-800 hover:bg-gray-800">
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-lg">#{index + 1}</span>
                                    {index < 3 && (
                                      <span className="text-lg">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-medium">{club.name}</td>
                                <td className="py-3 px-4 text-center font-bold text-white">
                                  {club.votes}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {club.percentage || 0}%
                                </td>
                                <td className="py-3 px-4">
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-white h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${club.percentage || 0}%` }}
                                    ></div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-16 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <span className="text-2xl">⚽</span>
            <span className="text-xl font-bold">Ligue 1 Vote</span>
          </div>
          <p className="text-gray-300 mb-2">
            Application de vote décentralisée pour les clubs de Ligue 1
          </p>
          <p className="text-sm text-gray-400">
            Propulsé par Ethereum • Développé avec ❤️ pour le football français
          </p>
        </div>
      </footer>

      {/* Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
