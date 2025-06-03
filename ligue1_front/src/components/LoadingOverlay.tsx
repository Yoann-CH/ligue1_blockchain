import React from 'react';

interface LoadingOverlayProps {
  isActive: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isActive, 
  message = "Transaction en cours..."
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 max-w-md text-center border border-gray-800">
        <div className="relative w-40 h-40 mx-auto mb-6">
          {/* Cercle extérieur en rotation */}
          <div className="absolute inset-0 border-4 border-gray-700 border-t-white rounded-full animate-spin-slow"></div>
          
          {/* Logo Ligue 1 au centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 bg-gray-800 rounded-full flex items-center justify-center animate-pulse-scale">
              <img 
                src="/images/Logo_Ligue_1_McDonalds.svg" 
                alt="Logo Ligue 1" 
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-4 animate-bounce-in">
          {message}
        </h3>
        <p className="text-gray-400 text-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Votre transaction est en cours de traitement sur la blockchain Sepolia.
          <br />
          Merci de patienter et de ne pas fermer cette fenêtre.
        </p>
        
        {/* Indicateur de progrès */}
        <div className="mt-6 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div className="bg-white h-2 animate-progress"></div>
        </div>
        
        <p className="mt-4 text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Les transactions peuvent prendre jusqu'à 15 secondes sur Sepolia.
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay; 