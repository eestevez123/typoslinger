import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SixShooterBarrel from './SixShooterBarrel';

interface GameOverProps {
  hits: number;
  misses: number;
  time: number;
  hintsUsed: number;
  roundResults: Array<{ hit: boolean; usedHint: boolean }>;
}

const GameOver: React.FC<GameOverProps> = ({
  hits,
  misses,
  time,
  hintsUsed,
  roundResults
}) => {
  const { t, i18n } = useTranslation();
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const generateShareText = () => {
    const gameNumber = 1;
    const timeTaken = Math.round(time);
    const isSpanish = i18n.language.startsWith('es');
    
    // Generate game header
    const gameHeader = t('shareTextGame', { gameNumber });
    
    // Generate stats line with proper pluralization based on language
    const statsLine = t('shareTextStats', {
      hits,
      misses,
      time: timeTaken,
      hints: hintsUsed,
      hitsPlural: hits !== 1 ? 's' : '',
      missPlural: misses != 1 ? (isSpanish ? 's' : 'es') : '',
      hintsPlural: hintsUsed !== 1 ? 's' : ''
    });
    
    // Generate round results
    const roundsText = roundResults.map((result, index) => 
      t('shareTextRound', {
        round: index + 1,
        result: result.hit ? '✅' : '❌',
        hint: result.usedHint ? ' (💡)' : ''
      })
    ).join('\n');
    
    // Generate footer
    const footer = t('shareTextFooter');
    
    // Combine all parts
    const shareText = `${gameHeader}\n${statsLine}\n${roundsText}\n${footer}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(() => {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    });
  };

  return (
    <div
      style={{
        height: '100dvh',
        width: '100dvw',
        backgroundColor: '#FFF8E7',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '1rem'
      }}
    >
      {/* Banner */}
      <h1
        style={{
          color: '#2c3e50',
          textAlign: 'center',
          marginBottom: '2rem'
        }}
      >
        TypoSlinger
      </h1>

      {/* Score Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          marginBottom: '2rem'
        }}
      >
        <h2
          style={{
            
            color: '#2c3e50',
            margin: 0
          }}
        >
          {hits}/6
        </h2>
        <h2
          style={{
            
            color: '#2c3e50',
            margin: 0
          }}
        >
          💡 {hintsUsed}
        </h2>
        <h2
          style={{
            fontFamily: 'monospace',
            color: '#2c3e50',
            margin: 0
          }}
        >
          {time}s
        </h2>
      </div>

      {/* Six Shooter Barrel */}
      <div
        style={{
          width: '160px',
          height: '160px',
          marginBottom: '2rem'
        }}
      >
        <SixShooterBarrel
          roundResults={roundResults}
        />
      </div>

      {/* Share Button */}
      <button
        onClick={generateShareText}
        style={{
          backgroundColor: '#e67e22',
          color: 'white',
          fontSize: '1.2rem',
          padding: '0.5rem 2rem',
          marginBottom: '2rem',
          
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d35400'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e67e22'}
      >
        {t('shareResults')}
      </button>

      {/* Toast Message */}
      {(copySuccess || copyError) && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '4px',
            
            fontSize: '1.1rem',
            zIndex: 1000
          }}
        >
          {copySuccess ? t('resultsCopied') : copyError ? t('copyError') : ''}
        </div>
      )}

      {/* Come Back Message */}
      <h3
        style={{
          color: '#2c3e50',
          textAlign: 'center',
          
          margin: 0
        }}
      >
        {t('comeBackMessage')}
      </h3>
    </div>
  );
};

export default GameOver; 