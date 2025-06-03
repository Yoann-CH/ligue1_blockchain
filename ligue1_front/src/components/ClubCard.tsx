import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Club } from '../types';
import { useWallet } from '../hooks/useWallet';
import { toast } from 'react-toastify';

interface ClubCardProps {
  club: Club;
  onVoteSuccess?: () => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onVoteSuccess }) => {
  const { wallet, vote } = useWallet();
  const [isVoting, setIsVoting] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleVote = async () => {
    if (!wallet.isConnected) {
      toast.error('Veuillez connecter votre wallet Metamask');
      return;
    }

    if (wallet.hasVoted) {
      toast.warning('Vous avez déjà voté !');
      return;
    }

    setIsVoting(true);
    try {
      const txHash = await vote(club.id);
      toast.success(`Vote enregistré ! Transaction: ${txHash.slice(0, 10)}...`);
      onVoteSuccess?.();
    } catch (error) {
      console.error('Erreur vote:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const isUserChoice = wallet.hasVoted && wallet.voterChoice === club.id;
  const canVote = wallet.isConnected && !wallet.hasVoted;

  return (
    <Card className="club-card group relative overflow-hidden animate-fade-in bg-gray-900 border-gray-800 text-white">
      {/* Badge pour le choix de l'utilisateur */}
      {isUserChoice && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium animate-bounce-in">
            ✓ Votre choix
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Logo du club */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden bg-white">
            {club.logo && !logoError ? (
              <img
                src={club.logo}
                alt={`Logo ${club.name}`}
                className="w-full h-full object-contain p-2"
                onError={handleLogoError}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center text-3xl font-bold text-gray-200">
                {club.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Nom du club */}
        <h3 className="text-xl font-bold text-center mb-2 group-hover:text-gray-300 transition-colors">
          {club.name}
        </h3>

        {/* Statistiques des votes */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl font-bold text-white">{club.votes}</span>
            <span className="text-sm text-gray-400">votes</span>
          </div>
          
          {club.percentage !== undefined && (
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${club.percentage}%` }}
              ></div>
            </div>
          )}
          
          {club.percentage !== undefined && (
            <p className="text-sm text-gray-400">{club.percentage}% des votes</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          variant={isUserChoice ? "secondary" : "primary"}
          onClick={handleVote}
          disabled={!canVote || isVoting}
          className={`
            w-full vote-button transition-all duration-300
            ${isUserChoice ? 'bg-gray-700 hover:bg-gray-600' : ''}
            ${!canVote && !isUserChoice ? 'opacity-50' : ''}
          `}
        >
          {isVoting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
              <span>Vote en cours...</span>
            </div>
          ) : isUserChoice ? (
            '✓ Voté !'
          ) : wallet.hasVoted ? (
            'Déjà voté'
          ) : !wallet.isConnected ? (
            'Connectez-vous pour voter'
          ) : (
            `Voter pour ${club.name.split(' ')[0]}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClubCard; 