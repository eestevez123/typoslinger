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
    <div
      style={{
        height: '100dvh',
        width: '100dvw',
        backgroundColor: '#FFF8E7',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100dvh'
      }}
    >
      {/* Banner */}
      <h3
      className="gameBanner"
      >
        TypoSlinger
      </h3>

      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          width: '100%'
        }}
      >
        {/* Pause Button */}
        <button
          onClick={togglePause}
          style={{
            width: '50px',
            height: '50px',
            padding: '0.25rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer'
          }}
        >
          <img
            src={isPaused ? playIcon : pauseIcon}
            alt={isPaused ? "Resume" : "Pause"}
            style={{ width: '100%', height: '100%' }}
          />
        </button>

        {/* Right side - Hints and Audio */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleHintClick}
            style={{
              width: '50px',
              height: '50px',
              padding: '0.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            <img
              src={hintsIcon}
              alt="Use Hint"
              style={{ width: '100%', height: '100%' }}
            />
          </button>
          <button
            onClick={onAudioToggle}
            style={{
              width: '50px',
              height: '50px',
              padding: '0.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            <img
              src={isAudioOn ? audioOnIcon : audioOffIcon}
              alt={isAudioOn ? "Audio On" : "Audio Off"}
              style={{ width: '100%', height: '100%' }}
            />
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100dvh - 200px)',
          position: 'relative',
          marginTop: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div
          style={{
            width: '90%',
            maxWidth: '1600px',
            height: '90dvh'
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
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                width: '50%',
                height: '40%',
                position: 'relative',
                top: '-8%'
              }}
            >
              {currentSentences[currentRound].text.split(' ').map((word, index) => {
                const shouldShowBackground = !isHintActive || (clickableIndices && clickableIndices.includes(index));
                const cleanWord = word.replace(/\./g, '');
                const isMisspelledWord = cleanWord === currentSentences[currentRound].misspelledWord;

                return (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      cursor: shouldShowBackground ? 'pointer' : 'default',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      backgroundColor: shouldShowBackground ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => shouldShowBackground && handleWordClick(word)}
                  >
                    <span
                      style={{
                        fontSize: '1.5rem',
                        color: '#2c3e50',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      {word}
                    </span>

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
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Timer */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          fontSize: '2rem',
          fontFamily: 'monospace',
          color: '#2c3e50'
        }}
      >
        {formatTime(time)}
      </div>

      {/* Six Shooter Barrel Progress */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          width: '160px',
          height: '160px'
        }}
      >
        <SixShooterBarrel
          roundResults={roundResults}
        />
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '80%',
              textAlign: 'center'
            }}
          >
            <h2
              style={{
                marginBottom: '1rem',
                color: '#2c3e50'
              }}
            >
              {t('gamePaused')}
            </h2>
            <button
              onClick={togglePause}
              style={{
                width: '60px',
                height: '60px',
                padding: '0.25rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <img
                src={playIcon}
                alt="Resume"
                style={{ width: '100%', height: '100%' }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Hint Modal */}
      {showHintModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '80%',
              textAlign: 'center'
            }}
          >
            <h2
              style={{
                marginBottom: '1rem',
                color: '#2c3e50'
              }}
            >
              {t('useHint')}
            </h2>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#c0392b',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '4px',
            fontSize: '1rem',
            zIndex: 1000
          }}
        >
          {t('hintAlreadyActive')}
        </div>
      )}

      {/* How to Play Modal */}
      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
};

export default Game; 