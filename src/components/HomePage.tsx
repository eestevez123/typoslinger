import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Game from './Game';
import HowToPlay from './HowToPlay';
import GameOver from './GameOver';
import { toggleAudio } from '../utils/sound';

// Import assets
import audioOnIcon from '../assets/images/audio_on.png';
import audioOffIcon from '../assets/images/audio_off.png';
import cactusIcon from '../assets/images/cactus.png';
import tumbleweedIcon from '../assets/images/tumbleweed.png';

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showGame, setShowGame] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [gameResults, setGameResults] = useState<{
    hits: number;
    misses: number;
    time: number;
    hintsUsed: number;
    roundResults: Array<{ hit: boolean, usedHint: boolean }>;
  } | null>(null);

  // Play intro sound when component mounts
  useEffect(() => {
    toggleAudio(true);
  }, []);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  const handleAudioToggle = () => {
    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);
    // Only play intro sound if we're on the home page and turning audio on
    toggleAudio(newAudioState, !showGame);
  };

  const handleGameEnd = (score: number, hits: number, misses: number, time: number) => {
    // Save game results with current date as key
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(today, JSON.stringify({ score, hits, misses, time }));
    
    setGameResults({
      hits,
      misses,
      time,
      hintsUsed: 0, // You'll need to pass this from Game component
      roundResults: [], // You'll need to pass this from Game component
    });
  };

  // Render game over screen if we have results
  if (gameResults) {
    return (
      <GameOver
        hits={gameResults.hits}
        misses={gameResults.misses}
        time={gameResults.time}
        hintsUsed={gameResults.hintsUsed}
        roundResults={gameResults.roundResults}
        isAudioOn={isAudioOn}
        onAudioToggle={handleAudioToggle}
      />
    );
  }

  // Render game if it's started
  if (showGame) {
    return (
      <Game
        onEndGame={handleGameEnd}
        isAudioOn={isAudioOn}
        onAudioToggle={handleAudioToggle}
      />
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFF8E7',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "'Western', serif",
              color: '#2c3e50',
              fontSize: '1.2rem'
            }}
          >
            {t('language')}:
          </Typography>
          <Select
            value={i18n.language}
            onChange={handleLanguageChange}
            sx={{
              bgcolor: 'white',
              width: '120px',
              height: '40px'
            }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Español</MenuItem>
          </Select>
        </Box>

        <IconButton 
          onClick={handleAudioToggle}
          sx={{
            width: '60px',
            height: '60px',
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

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Western', serif",
            color: '#2c3e50',
            textAlign: 'center',
            mt: 2,
            mb: 4
          }}
        >
          TypoSlinger
        </Typography>

        <Button
          variant="contained"
          onClick={() => setShowGame(true)}
          sx={{
            bgcolor: '#e67e22',
            color: 'white',
            fontSize: '1.5rem',
            padding: '0.5rem 3rem',
            '&:hover': {
              bgcolor: '#d35400'
            }
          }}
        >
          {t('play')}
        </Button>

        <Button
          variant="outlined"
          onClick={() => setShowHowToPlay(true)}
          sx={{
            color: '#2c3e50',
            borderColor: '#2c3e50',
            fontSize: '1.2rem',
            padding: '0.5rem 2rem',
            '&:hover': {
              borderColor: '#2c3e50',
              bgcolor: 'rgba(44, 62, 80, 0.1)'
            }
          }}
        >
          {t('howToPlay')}
        </Button>
      </Box>

      {/* Bottom Decorations */}
      <img
        src={cactusIcon}
        alt="Cactus"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '5%',
          height: '24vh'
        }}
      />

      <motion.img
        src={tumbleweedIcon}
        alt="Tumbleweed"
        style={{
          position: 'absolute',
          bottom: 0,
          height: '15vh'
        }}
        initial={{ x: "100vw", opacity: 1 }}
        animate={{
          x: "-20vh",
          y: [0, -20, 0, -15, 0, -10, 0],
          rotate: -360,
          opacity: [1, 1, 1, 1, 0]
        }}
        transition={{
          x: {
            duration: 8,
            repeat: Infinity,
            repeatDelay: 2
          },
          opacity: {
            duration: 8,
            times: [0, 0.7, 0.8, 0.9, 1],
            repeat: Infinity,
            repeatDelay: 2
          },
          y: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          },
          rotate: {
            repeat: Infinity,
            duration: 4,
            ease: "linear"
          }
        }}
      />

      {/* Modals */}
      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
    </Box>
  );
};

export default HomePage; 