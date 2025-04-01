import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/GameOver.css';

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

  const handleCloseToast = () => {
    setCopySuccess(false);
    setCopyError(false);
  };

  return (
    <div className="game-over-container">
      {/* Banner */}
      <h1 className="game-over-title">
        TypoSlinger
      </h1>

      <div className="game-over-content-container">
        {/* Score Display */}
        <div className="score-display">
          <h2 className="score-text">
            🎯 {hits}/6
          </h2>
          <h2 className="score-text">
            💡 {hintsUsed}
          </h2>
          <h2 className="score-time">
            ⏱️ {time}s
          </h2>
        </div>

        {/* Share Button */}
        <button
          className="share-button"
          onClick={generateShareText}
        >
          {t('shareResults')}
        </button>

        {/* Toast Message */}
        {(copySuccess || copyError) && (
          <div className="toast" onClick={handleCloseToast}>
            {copySuccess ? t('resultsCopied') : copyError ? t('copyError') : ''}
          </div>
        )}

        {/* Come Back Message */}
        <h3 className="come-back-message">
          {t('comeBackMessage')}
        </h3>
      </div>
    </div>
  );
};

export default GameOver; 