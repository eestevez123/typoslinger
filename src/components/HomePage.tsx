import React, { useState, useEffect } from 'react';
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

import "../styles/HomePage.css";

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

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
  };

  const handleAudioToggle = () => {
    const newAudioState = !isAudioOn;
    setIsAudioOn(newAudioState);
    // Only play intro sound if we're on the home page and turning audio on
    toggleAudio(newAudioState, !showGame);
  };

  const handleGameEnd = (hits: number, misses: number, hintsUsed: number, time: number) => {
    // Save game results with current date as key
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(today, JSON.stringify({hits, misses, time }));
    
    setGameResults({
      hits,
      misses,
      time,
      hintsUsed,
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
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFF8E7',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: '"Patrick Hand", serif',
              color: '#2c3e50',
              fontSize: '2.5rem'
            }}
          >
            {t('language')}:
          </span>
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '0.5rem',
              fontFamily: '"Patrick Hand", serif',
              fontSize: '2rem'
            }}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <button
          onClick={handleAudioToggle}
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
            src={isAudioOn ? audioOnIcon : audioOffIcon} 
            alt={isAudioOn ? "Audio On" : "Audio Off"}
            style={{ width: '100%', height: '100%' }}
          />
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem'
        }}
      >
        {/* Title */}
        <h1 className="gameTitle">
          TypoSlinger
        </h1>

        {/* Play Button */}
        <button
          onClick={() => setShowGame(true)}
          style={{
            backgroundColor: '#e67e22',
            color: 'white',
            fontSize: '2rem',
            padding: '0.5rem 5rem',
            marginBottom: '2rem',
            
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d35400'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e67e22'}
        >
          {t('play')}
        </button>

        {/* How to Play Button */}
        <button
          onClick={() => setShowHowToPlay(true)}
          style={{
            color: '#2c3e50',
            border: '2px solid #2c3e50',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            background: 'none',
            cursor: 'pointer',
            padding: '0.5rem 1rem'
          }}
        >
          {t('howToPlay')}
        </button>
      </div>

      {/* Bottom Decorations */}
      <img
        src={cactusIcon}
        alt="Cactus"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '5%',
          height: '24dvh'
        }}
      />

      <motion.img
        src={tumbleweedIcon}
        alt="Tumbleweed"
        style={{
          position: 'absolute',
          bottom: 0,
          height: '15dvh'
        }}
        initial={{ x: "100vw", opacity: 1 }}
        animate={{
          x: "-20dvh",
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
    </div>
  );
};

export default HomePage; 