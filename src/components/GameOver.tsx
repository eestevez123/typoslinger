import React, { useState } from 'react';
import { Box, Button, Typography, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
    <Box
      sx={{
        height: '100dvh',
        width: '100dvw',
        bgcolor: '#FFF8E7',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 2
      }}
    >
      {/* Banner */}
      <Typography
        variant="h3"
        sx={{
          fontFamily: 'Rye',
          color: '#2c3e50',
          textAlign: 'center',
          mb: 4
        }}
      >
        TypoSlinger
      </Typography>

      {/* Score Display */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          mb: 4
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Rye',
            color: '#2c3e50'
          }}
        >
          {hits}/6
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Rye',
            color: '#2c3e50'
          }}
        >
          💡 {hintsUsed}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'monospace',
            color: '#2c3e50'
          }}
        >
          {time}s
        </Typography>
      </Box>

      {/* Share Button */}
      <Button
        variant="contained"
        onClick={generateShareText}
        sx={{
          bgcolor: '#e67e22',
          color: 'white',
          fontSize: '1.2rem',
          padding: '0.5rem 2rem',
          mb: 4,
          fontFamily: 'Rye',
          '&:hover': {
            bgcolor: '#d35400'
          }
        }}
      >
        {t('shareResults')}
      </Button>

      {/* Toast Message */}
      <Snackbar
        open={copySuccess || copyError}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        message={copySuccess ? t('resultsCopied') : copyError ? t('copyError') : ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: '#2c3e50',
            color: 'white',
            fontSize: '1.1rem',
            fontFamily: 'Rye'
          }
        }}
      />

      {/* Come Back Message */}
      <Typography
        variant="h6"
        sx={{
          color: '#2c3e50',
          textAlign: 'center',
          fontFamily: 'Rye'
        }}
      >
        {t('comeBackMessage')}
      </Typography>
    </Box>
  );
};

export default GameOver; 