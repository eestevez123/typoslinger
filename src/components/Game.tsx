import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Modal } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Import assets
import audioOnIcon from '../assets/images/audio_on.png';
import audioOffIcon from '../assets/images/audio_off.png';
import signIcon from '../assets/images/sign.png';
import wordBackgroundIcon from '../assets/images/word_background.png';
import pauseIcon from '../assets/images/pause_btn.png';
import playIcon from '../assets/images/pause_btn_play.png';
import hintsIcon from '../assets/images/lightbulb.png';

// Import components
import GameOver from './GameOver';
import SixShooterBarrel from './SixShooterBarrel';
import { playGunShot, playGunReady } from '../utils/sound';
import HowToPlay from './HowToPlay';
import { sentences } from '../config/sentences';

interface GameProps {
  onEndGame: (score: number, hits: number, misses: number, time: number) => void;
  onClose: () => void;
  isAudioOn: boolean;
  onAudioToggle: () => void;
}

const Game: React.FC<GameProps> = ({
  onEndGame,
  onClose,
  isAudioOn,
  onAudioToggle
}) => {
  const { t, i18n } = useTranslation();
  const [currentRound, setCurrentRound] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [roundResults, setRoundResults] = useState<Array<{ hit: boolean, usedHint: boolean }>>([]);

  // Get current language's sentences
  const currentSentences = sentences[i18n.language.split('-')[0]] || sentences.en;

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (isAudioOn) {
      playGunReady();
    }
  }, [currentRound, isAudioOn]);

  const handleWordClick = (word: string) => {
    // Play gunshot sound if audio is enabled
    if (isAudioOn) {
      playGunShot();
    }

    // Remove period from the clicked word before comparison
    const cleanWord = word.replace(/\./g, '');
    const isCorrect = cleanWord === currentSentences[currentRound].misspelledWord;
                     
    if (isCorrect) {
      setHits(prev => prev + 1);
      console.log('🎯 Hit! You found the misspelled word:', cleanWord, '(correct spelling:', currentSentences[currentRound].correctedWord + ')');
    } else {
      setMisses(prev => prev + 1);
      console.log('💥 Miss! The misspelled word was:', currentSentences[currentRound].misspelledWord);
    }

    // Update round results first
    const newRoundResults = [...roundResults, { hit: isCorrect, usedHint: false }];
    setRoundResults(newRoundResults);

    if (currentRound < currentSentences.length - 1) {
      setCurrentRound(prev => prev + 1);
    } else {
      // Calculate final results
      const finalHits = isCorrect ? hits + 1 : hits;
      const finalMisses = isCorrect ? misses : misses + 1;
      const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;
      const score = (finalHits * 100) - (finalMisses * 50) - timeTaken;
      
      // Set game over and call onEndGame
      setIsGameOver(true);
      onEndGame(score, finalHits, finalMisses, Math.round(timeTaken));
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    setShowPauseModal(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGameOver) {
    return (
      <GameOver
        hits={hits}
        misses={misses}
        time={time}
        hintsUsed={hintsUsed}
        roundResults={roundResults}
        isAudioOn={isAudioOn}
        onAudioToggle={onAudioToggle}
      />
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        bgcolor: '#FFF8E7',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Banner */}
      <Typography
        variant="h3"
        sx={{
          fontFamily: "'Rye', serif",
          color: '#2c3e50',
          textAlign: 'center',
          mt: 2,
          mb: 4
        }}
      >
        TypoSlinger
      </Typography>

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
        {/* Pause Button */}
        <IconButton
          onClick={togglePause}
          sx={{
            width: '50px',
            height: '50px',
            padding: 1
          }}
        >
          <img
            src={isPaused ? playIcon : pauseIcon}
            alt={isPaused ? "Resume" : "Pause"}
            style={{ width: '100%', height: '100%' }}
          />
        </IconButton>

        {/* Right side - Hints and Audio */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton
            onClick={() => setShowHowToPlay(true)}
            sx={{
              width: '50px',
              height: '50px',
              padding: 1
            }}
          >
            <img
              src={hintsIcon}
              alt="How to Play"
              style={{ width: '100%', height: '100%' }}
            />
          </IconButton>
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
      </Box>

      {/* Main Game Area */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: { xs: 'calc(100vh - 300px)', md: 'calc(100vh - 200px)' },
          position: 'relative',
          mt: { xs: 2, md: 0 }
        }}
      >
        <Box
          sx={{
            width: { xs: '90%', md: '50%' },
            maxWidth: '1600px',
            height: { xs: '50vh', md: '90vh' }
          }}
        >
          <motion.div
            animate={{ rotateY: isPaused ? 90 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${signIcon})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              transform: 'none'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                width: { xs: '70%', md: '50%' },
                height: '40%',
                position: 'relative',
                top: { xs: '-10%', md: '-8%' }
              }}
            >
              {currentSentences[currentRound].text.split(' ').map((word, index) => (
                <motion.div
                  key={index}
                  onClick={() => handleWordClick(word)}
                  style={{
                    backgroundImage: `url(${wordBackgroundIcon})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '25px',
                    transition: 'box-shadow 0.1s ease'
                  }}
                  whileHover={{
                    boxShadow: '0 0 8px 3px #e67e22'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Typography
                    sx={{
                      color: 'white',
                      fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
                      fontFamily: "'Western', serif",
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      zIndex: 1
                    }}
                  >
                    {word}
                  </Typography>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* Timer */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          fontSize: '2rem',
          fontFamily: 'monospace',
          color: '#2c3e50'
        }}
      >
        {formatTime(time)}
      </Typography>

      {/* Six Shooter Barrel Progress */}
      <SixShooterBarrel
        roundResults={roundResults}
      />

      {/* Pause Modal */}
      <Modal
        open={showPauseModal}
        onClose={togglePause}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            bgcolor: 'white',
            p: 4,
            borderRadius: 2,
            maxWidth: '80%',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" sx={{ 
            mb: 2,
            fontFamily: "'Rye', serif",
            color: '#2c3e50'
          }}>
            {t('gamePaused')}
          </Typography>
          <IconButton
            onClick={togglePause}
            sx={{
              width: '60px',
              height: '60px',
              padding: 1
            }}
          >
            <img
              src={playIcon}
              alt="Resume"
              style={{ width: '100%', height: '100%' }}
            />
          </IconButton>
        </Box>
      </Modal>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <HowToPlay onClose={() => setShowHowToPlay(false)} />
      )}
    </Box>
  );
};

export default Game; 