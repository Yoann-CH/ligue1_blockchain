import { useState, createContext, useContext } from 'react';

interface VotingState {
  isVoting: boolean;
  message: string;
}

interface VotingContextProps {
  votingState: VotingState;
  startVoting: (message?: string) => void;
  endVoting: () => void;
}

// Créer un contexte avec une valeur par défaut
export const VotingContext = createContext<VotingContextProps>({
  votingState: { isVoting: false, message: '' },
  startVoting: () => {},
  endVoting: () => {}
});

// Hook pour utiliser le contexte
export const useVotingContext = () => useContext(VotingContext);

// Hook pour fournir l'état et les méthodes
export const useGlobalVotingState = (): VotingContextProps => {
  const [votingState, setVotingState] = useState<VotingState>({
    isVoting: false,
    message: 'Transaction en cours...'
  });

  const startVoting = (message = 'Transaction en cours...') => {
    setVotingState({
      isVoting: true,
      message
    });
  };

  const endVoting = () => {
    setVotingState({
      isVoting: false,
      message: ''
    });
  };

  return {
    votingState,
    startVoting,
    endVoting
  };
}; 