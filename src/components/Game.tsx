import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Import assets
import audioOnIcon from '../assets/images/audio_on.png';
import audioOffIcon from '../assets/images/audio_off.png';
import signIcon from '../assets/images/sign.png';
import pauseIcon from '../assets/images/pause_btn.png';
import playIcon from '../assets/images/pause_btn_play.png';
import hintsIcon from '../assets/images/lightbulb.png';

// Import components
import GameOver from './GameOver';
import SixShooterBarrel from './SixShooterBarrel';
import { playGunShot, playGunReady } from '../utils/sound';
import HowToPlay from './HowToPlay';
import { sentences } from '../config/sentences';

import "../styles/Game.css";

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
  const [showSquiggly, setShowSquiggly] = useState(false);
  const [isSignSpinning, setIsSignSpinning] = useState(false);
  const [isWordClicked, setIsWordClicked] = useState(false);
  const [showCorrectWord, setShowCorrectWord] = useState(false);

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
    if (isAudioOn && currentRound > 0) {
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
    if (isWordClicked) return; // Prevent clicking if a word has already been clicked
    setIsWordClicked(true); // Set the clicked state

    // Play gunshot sound if audio is enabled
    if (isAudioOn) {
      playGunShot();
    }

    // Remove period from the clicked word before comparison
    const cleanWord = word.replace(/\./g, '');
    const isCorrect = cleanWord === currentSentences[currentRound].misspelledWord;
    
    // Start sign flip animation
    setIsSignSpinning(true);

    // After sign flip completes (300ms), start word animation sequence
    setTimeout(() => {
      setIsSignSpinning(false); // Sign is back to original position
      setShowSquiggly(true); // Show squiggly line
    }, 300);

    // After 1 second, show correct word and fade out misspelled word
    setTimeout(() => {
      setShowCorrectWord(true);
    }, 1300);

    // After 1.8 seconds, fade out the squiggly line
    setTimeout(() => {
      setShowSquiggly(false);
    }, 1800);

    // After 2 seconds, proceed to next round
    setTimeout(() => {
      setShowCorrectWord(false);
      setIsWordClicked(false);
      
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
        onEndGame(finalHits, finalMisses, hintsUsed, Math.round(timeTaken));
      }
    }, 2300); // Total animation duration: 300ms sign flip + 2000ms word animation
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
    <div className="gameContainer">
      {/* Banner */}
      <h3 className="gameBanner">
        TypoSlinger
      </h3>

      {/* Top Bar */}
      <div className="game-controls">
        {/* Pause Button */}
        <button className="game-button" onClick={togglePause}>
          <img
            src={isPaused ? playIcon : pauseIcon}
            alt={isPaused ? "Resume" : "Pause"}
          />
        </button>

        {/* Right side - Hints and Audio */}
        <div className="d-flex" style={{ gap: '1rem' }}>
          <button className="game-button" onClick={handleHintClick}>
            <img src={hintsIcon} alt="Use Hint" />
          </button>
          <button className="game-button" onClick={onAudioToggle}>
            <img
              src={isAudioOn ? audioOnIcon : audioOffIcon}
              alt={isAudioOn ? "Audio On" : "Audio Off"}
            />
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          position: 'relative'
        }}
      >
        <div className="signGameContainer">
          <motion.div
          className="signGameContainerMotionDiv"
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
            <div
              className="wordsContainer"
            >
              {currentSentences[currentRound].text.split(' ').map((word, index) => {
                const shouldShowBackground = (!isHintActive || (clickableIndices && clickableIndices.includes(index))) && !isWordClicked;
                const cleanWord = word.replace(/\./g, '');
                const isMisspelledWord = cleanWord === currentSentences[currentRound].misspelledWord;

                return (
                  <div
                    key={index}
                    className={`word-container ${!shouldShowBackground ? 'inactive' : ''}`}
                    onClick={() => shouldShowBackground && handleWordClick(word)}
                  >
                    <motion.span
                      className="word-text"
                      initial={{ opacity: 1 }}
                      animate={{
                        opacity: showSquiggly && isMisspelledWord && !showCorrectWord ? 1 : 
                                showCorrectWord && isMisspelledWord ? 1 : 1
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ transition: 'opacity 0.3s ease-in-out' }}
                    >
                      {showCorrectWord && isMisspelledWord ? 
                        currentSentences[currentRound].correctedWord + (word.match(/[.,!?]$/)?.[0] || '') : 
                        word}
                    </motion.span>
                    {showSquiggly && isMisspelledWord && (
                      <motion.div
                        className="squiggly-line"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ transition: 'opacity 0.3s ease-in-out' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Timer */}
      <div className="game-timer">
        {formatTime(time)}
      </div>

      {/* Six Shooter Barrel Progress */}
      <div className="six-shooter-container">
        <SixShooterBarrel roundResults={roundResults} isAudioOn={isAudioOn} />
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
              {t('gamePaused')}
            </h2>
            <button className="game-button" onClick={togglePause}>
              <img src={playIcon} alt="Resume" />
            </button>
          </div>
        </div>
      )}

      {/* Hint Modal */}
      {showHintModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
              {t('useHint')}
            </h2>
            <div className="d-flex justify-content-center" style={{ gap: '1rem' }}>
              <button
                onClick={handleHintConfirm}
                style={{
                  backgroundColor: '#e67e22',
                  color: 'white',
                  fontSize: '1.2rem',
                  padding: '0.5rem 2rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d35400'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e67e22'}
              >
                {t('yes')}
              </button>
              <button
                onClick={() => setShowHintModal(false)}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  fontSize: '1.2rem',
                  padding: '0.5rem 2rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7f8c8d'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#95a5a6'}
              >
                {t('no')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hint Active Toast */}
      {showHintActiveToast && (
        <div className="toast">
          {t('hintAlreadyActive')}
        </div>
      )}

      {/* How to Play Modal */}
      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
};

export default Game; 