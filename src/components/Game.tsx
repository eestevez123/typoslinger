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

interface GameProps {
  onEndGame: (score: number, hits: number, misses: number, time: number) => void;
  isAudioOn: boolean;
  onAudioToggle: () => void;
}

const Game: React.FC<GameProps> = ({ onEndGame, isAudioOn, onAudioToggle }) => {
  const { t } = useTranslation();
  const [currentRound, setCurrentRound] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  // const [hintsUsed, setHintsUsed] = useState(0);
  const [roundResults, setRoundResults] = useState<Array<{ hit: boolean, usedHint: boolean }>>([]);

  // Example sentences with typos
  const sentences = [
    { text: "The cowboy rode his hores into the sunset.", misspelledWord: "hores", correctedWord: "horse" },
    { text: "The sheriff was looking for the theif.", misspelledWord: "theif", correctedWord: "thief" },
    { text: "The tumbleweed rolled accross the desert.", misspelledWord: "accross", correctedWord: "across" },
    { text: "The saloon was full of cowbois.", misspelledWord: "cowbois", correctedWord: "cowboys" },
    { text: "The gold was burried in the ground.", misspelledWord: "burried", correctedWord: "buried" },
    { text: "The bandit was hiding in the shaddows.", misspelledWord: "shaddows", correctedWord: "shadows" }
  ];

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    let interval: number;
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
    const isCorrect = cleanWord === sentences[currentRound].misspelledWord;
                     
    if (isCorrect) {
      setHits(prev => prev + 1);
      console.log('🎯 Hit! You found the misspelled word:', cleanWord, '(correct spelling:', sentences[currentRound].correctedWord + ')');
    } else {
      setMisses(prev => prev + 1);
      console.log('💥 Miss! The misspelled word was:', sentences[currentRound].misspelledWord);
    }

    // Update round results first
    const newRoundResults = [...roundResults, { hit: isCorrect, usedHint: false }];
    setRoundResults(newRoundResults);

    if (currentRound < sentences.length - 1) {
      setCurrentRound(prev => prev + 1);
    } else {
      // Calculate final results
      const finalHits = isCorrect ? hits + 1 : hits;
      const finalMisses = isCorrect ? misses : misses + 1;
      const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;
      const score = (finalHits * 100) - (finalMisses * 50) - timeTaken;
      
      // Then set game over and call onEndGame
      setIsGameOver(true);
      onEndGame(score, finalHits, finalMisses, Math.round(timeTaken));
    }
  };

  // const handleHint = () => {
  //   setHintsUsed(prev => prev + 1);
  //   // Update the current round's result to include hint usage
  //   setRoundResults(prev => {
  //     const newResults = [...prev];
  //     if (newResults[currentRound]) {
  //       newResults[currentRound].usedHint = true;
  //     }
  //     return newResults;
  //   });
  // };

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
        hintsUsed={0}
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
          fontFamily: "'Western', serif",
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
          height: 'calc(100vh - 200px)',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            width: { xs: '90%', md: '50%' },
            maxWidth: '1600px',
            height: { xs: '60vh', md: '90vh' }
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
                top: { xs: '-5%', md: '-8%' }
              }}
            >
              {sentences[currentRound].text.split(' ').map((word, index) => (
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
          <Typography variant="h5" sx={{ mb: 2 }}>
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