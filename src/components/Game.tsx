import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Modal, Snackbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
  onEndGame: (hits: number, misses: number, hintsUsed: number, time: number) => void;
  isAudioOn: boolean;
  onAudioToggle: () => void;
}

const Game: React.FC<GameProps> = ({
  onEndGame,
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
  const [showHintModal, setShowHintModal] = useState(false);
  const [showHintActiveToast, setShowHintActiveToast] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isHintActive, setIsHintActive] = useState(false);
  const [roundResults, setRoundResults] = useState<Array<{ hit: boolean, usedHint: boolean }>>([]);
  const [clickableIndices, setClickableIndices] = useState<number[] | null>(null);
  const [animatingWordIndex, setAnimatingWordIndex] = useState<number | null>(null);
  const [showSquiggly, setShowSquiggly] = useState(false);
  const [isSignSpinning, setIsSignSpinning] = useState(false);

  // Get current language's sentences
  const currentSentences = sentences[i18n.language.split('-')[0]] || sentences.en;

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

  const handleHintConfirm = () => {
    const words = currentSentences[currentRound].text.split(' ');
    const misspelledIndex = words.findIndex(w => w.replace(/\./g, '') === currentSentences[currentRound].misspelledWord);
    const newClickableIndices = getRandomIndices(words.length, Math.min(3, words.length), misspelledIndex);
    
    setHintsUsed(hintsUsed + 1);
    setIsHintActive(true);
    setClickableIndices(newClickableIndices);
    setShowHintModal(false);
  };

  const getRandomIndices = (total: number, keep: number, misspelledIndex: number): number[] => {
    const indices = new Set<number>([misspelledIndex]);
    while (indices.size < keep) {
      const randomIndex = Math.floor(Math.random() * total);
      if (randomIndex !== misspelledIndex) {
        indices.add(randomIndex);
      }
    }
    return Array.from(indices);
  };

  const handleHintClick = () => {
    if (isHintActive) {
      setShowHintActiveToast(true);
    } else {
      setShowHintModal(true);
    }
  };

  const handleWordClick = (word: string) => {
    // Play gunshot sound if audio is enabled
    if (isAudioOn) {
      playGunShot();
    }

    // Remove period from the clicked word before comparison
    const cleanWord = word.replace(/\./g, '');
    const isCorrect = cleanWord === currentSentences[currentRound].misspelledWord;
    
    // Find the index of the misspelled word
    const misspelledIndex = currentSentences[currentRound].text.split(' ').findIndex(w => 
      w.replace(/\./g, '') === currentSentences[currentRound].misspelledWord
    );
    
    setAnimatingWordIndex(misspelledIndex);
    setIsSignSpinning(true);

    // Start animation sequence
    setTimeout(() => {
      setIsSignSpinning(false);
      setShowSquiggly(true);
    }, 300); // Sign spins for 300ms

    // Hide squiggly after 1 second
    setTimeout(() => {
      setShowSquiggly(false);
    }, 1300); // 300ms spin + 1000ms squiggly display

    setTimeout(() => {
      if (isCorrect) {
        setHits(prev => prev + 1);
      } else {
        setMisses(prev => prev + 1);
      }

      // Update round results with hint usage
      const newRoundResults = [...roundResults, { hit: isCorrect, usedHint: isHintActive }];
      setRoundResults(newRoundResults);

      // Reset hint state for next round
      setIsHintActive(false);
      setClickableIndices(null);

      if (currentRound < currentSentences.length - 1) {
        setCurrentRound(prev => prev + 1);
      } else {
        // Calculate final results
        const finalHits = isCorrect ? hits + 1 : hits;
        const finalMisses = isCorrect ? misses : misses + 1;
        const timeTaken = (Date.now() - (startTime || Date.now())) / 1000;

        setIsGameOver(true);
        onEndGame(finalHits, finalMisses, hintsUsed,  Math.round(timeTaken));
      }
      setAnimatingWordIndex(null);
    }, 2300); // Total animation duration
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
            onClick={handleHintClick}
            sx={{
              width: '50px',
              height: '50px',
              padding: 1
            }}
          >
            <img
              src={hintsIcon}
              alt="Use Hint"
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
          height: { xs: 'calc(100vh - 400px)', md: 'calc(100vh - 200px)' },
          position: 'relative',
          mt: { xs: 2, md: 0 },
          mb: { xs: 4, md: 0 }
        }}
      >
        <Box
          sx={{
            width: { xs: '90%', md: '50%' },
            maxWidth: '1600px',
            height: { xs: '40vh', md: '90vh' }
          }}
        >
          <motion.div
            animate={{ 
              rotateY: isPaused ? 90 : isSignSpinning ? 180 : 0
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
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
              perspective: '1000px'
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
              {currentSentences[currentRound].text.split(' ').map((word, index) => {
                const shouldShowBackground = !isHintActive || (clickableIndices && clickableIndices.includes(index));
                const isAnimating = index === animatingWordIndex;
                const cleanWord = word.replace(/\./g, '');
                const isMisspelledWord = cleanWord === currentSentences[currentRound].misspelledWord;
                const correctedWord = isMisspelledWord ? currentSentences[currentRound].correctedWord : word;

                return (
                  <motion.div
                    key={index}
                    onClick={() => shouldShowBackground ? handleWordClick(word) : null}
                    style={{
                      backgroundImage: shouldShowBackground ? `url(${wordBackgroundIcon})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      padding: '0.5rem 1rem',
                      cursor: shouldShowBackground ? 'pointer' : 'default',
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '25px',
                      transition: 'box-shadow 0.1s ease'
                    }}
                    whileHover={shouldShowBackground ? {
                      boxShadow: '0 0 8px 3px #e67e22'
                    } : {}}
                    whileTap={shouldShowBackground ? { scale: 0.95 } : {}}
                  >
                    <AnimatePresence mode="wait">
                      {isAnimating ? (
                        <motion.div
                          key="animating"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          style={{ position: 'relative' }}
                        >
                          <motion.h2
                            initial={{ opacity: 1 }}
                            animate={{ opacity: showSquiggly ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              fontFamily: '"Just Another Hand", cursive',
                              color: 'white',
                              fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.3), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                              margin: 0,
                              position: 'relative'
                            }}
                          >
                            {word}
                          </motion.h2>
                          {showSquiggly && isMisspelledWord && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                position: 'absolute',
                                bottom: '-5px',
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: `url("data:image/svg+xml,%3Csvg width='20' height='4' viewBox='0 0 20 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 2 Q 2.5 0, 5 2 T 10 2 T 15 2 T 20 2' stroke='%23e74c3c' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'repeat-x',
                                backgroundSize: '20px 4px'
                              }}
                            />
                          )}
                          {!showSquiggly && isMisspelledWord && (
                            <motion.h2
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                fontFamily: '"Just Another Hand", cursive',
                                color: 'white',
                                fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                                margin: 0,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0
                              }}
                            >
                              {correctedWord}
                            </motion.h2>
                          )}
                        </motion.div>
                      ) : (
                        <motion.h2
                          key="static"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            fontFamily: '"Just Another Hand", cursive',
                            color: 'white',
                            fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                            margin: 0
                          }}
                        >
                          {word}
                        </motion.h2>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* Timer */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: { xs: '5rem', md: '1rem' },
          right: '1rem',
          fontSize: '2rem',
          fontFamily: 'monospace',
          color: '#2c3e50'
        }}
      >
        {formatTime(time)}
      </Typography>

      {/* Six Shooter Barrel Progress */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: '1rem', md: '1rem' },
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '90%', md: 'auto' },
          maxWidth: '600px'
        }}
      >
        <SixShooterBarrel
          roundResults={roundResults}
        />
      </Box>

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

      {/* Hint Modal */}
      <Modal
        open={showHintModal}
        onClose={() => setShowHintModal(false)}
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
            mb: 3,
            fontFamily: "'Rye', serif",
            color: '#2c3e50'
          }}>
            {t('useHint')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <IconButton
              onClick={handleHintConfirm}
              sx={{
                bgcolor: '#27ae60',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontFamily: "'Rye', serif",
                fontSize: '1.2rem',
                '&:hover': {
                  bgcolor: '#219a52'
                }
              }}
            >
              {t('yes')}
            </IconButton>
            <IconButton
              onClick={() => setShowHintModal(false)}
              sx={{
                bgcolor: '#c0392b',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontFamily: "'Rye', serif",
                fontSize: '1.2rem',
                '&:hover': {
                  bgcolor: '#a93226'
                }
              }}
            >
              {t('no')}
            </IconButton>
          </Box>
        </Box>
      </Modal>

      {/* Hint Active Toast */}
      <Snackbar
        open={showHintActiveToast}
        autoHideDuration={2000}
        onClose={() => setShowHintActiveToast(false)}
        message={t('hintAlreadyActive')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: '#c0392b',
            color: 'white',
            fontFamily: "'Rye', serif",
            fontSize: '1rem'
          }
        }}
      />

      {/* How to Play Modal */}
      {showHowToPlay && (
        <HowToPlay onClose={() => setShowHowToPlay(false)} />
      )}
    </Box>
  );
};

export default Game; 