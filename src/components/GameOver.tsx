import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Import assets
import audioOnIcon from '../assets/images/audio_on.png';
import audioOffIcon from '../assets/images/audio_off.png';
import sixShooterBarrel from '../assets/images/six_shooter_barrel.png';
import successShell from '../assets/images/success_shell.png';
import missShell from '../assets/images/miss_shell.png';

interface GameOverProps {
  hits: number;
  misses: number;
  time: number;
  hintsUsed: number;
  roundResults: Array<{ hit: boolean, usedHint: boolean }>;
  isAudioOn: boolean;
  onAudioToggle: () => void;
}

const GameOver: React.FC<GameOverProps> = ({
  hits,
  misses,
  time,
  hintsUsed,
  roundResults,
  isAudioOn,
  onAudioToggle
}) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);

  const generateShareText = () => {
    const gameNumber = 1; // This should be dynamic based on the day
    
    // Generate the game header
    const header = t('shareTextGame', { gameNumber });

    // Generate the stats line with proper pluralization
    const stats = t('shareTextStats', {
      time,
      hits,
      misses,
      plural: misses !== 1 ? 'es' : '',
      hints: hintsUsed,
      hintsPlural: hintsUsed !== 1 ? 's' : ''
    });

    // Generate each round result
    const rounds = roundResults.map((result, index) => 
      t('shareTextRound', {
        round: index + 1,
        result: result.hit ? '🎯' : '💥',
        hint: result.usedHint ? ' (💡)' : ''
      })
    ).join('\n');

    // Add the footer
    const footer = t('shareTextFooter');

    // Combine all parts
    const shareText = `${header}\n${stats}\n${rounds}\n\n${footer}`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => setShowToast(true))
      .catch(err => console.error('Failed to copy text:', err));
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
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
          fontFamily: "'Rye', serif",
          color: '#2c3e50',
          textAlign: 'center',
          mb: 4
        }}
      >
        TypoSlinger
      </Typography>

      {/* Audio Toggle */}
      <Box
        sx={{
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}
      >
        <IconButton
          onClick={onAudioToggle}
          sx={{
            width: '50px',
            height: '50px',
            padding: 1
          }}
        >
          <img
            src={isAudioOn ? audioOnIcon : audioOffIcon}
            alt={isAudioOn ? "Audio On" : "Audio Off"}
            style={{ width: '100%', height: '100%' }}
          />
        </IconButton>
      </Box>

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
            fontFamily: "'Rye', serif",
            color: '#2c3e50'
          }}
        >
          {hits}/6
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

      {/* Revolver Barrel */}

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
          '&:hover': {
            bgcolor: '#d35400'
          }
        }}
      >
        {t('shareResults')}
      </Button>

      {/* Toast Message */}
      <Snackbar
        open={showToast}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        message={t('resultsCopied')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: '#2c3e50',
            color: 'white',
            fontSize: '1.1rem',
            fontFamily: "'Rye', serif"
          }
        }}
      />

      {/* Come Back Message */}
      <Typography
        variant="h6"
        sx={{
          color: '#2c3e50',
          textAlign: 'center',
          fontFamily: "'Rye', serif"
        }}
      >
        {t('comeBackMessage')}
      </Typography>
    </Box>
  );
};

export default GameOver; 