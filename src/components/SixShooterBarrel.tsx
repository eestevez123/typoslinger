import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Import assets
import sixShooterBarrel from '../assets/images/six_shooter_barrel.png';
import successShell from '../assets/images/success_shell.png';
import missShell from '../assets/images/miss_shell.png';
import barrelSpinSound from '../assets/audio/barrel_spin.mp3';
import gunGettingReadySound from '../assets/audio/gun_getting_ready.wav';

interface SixShooterBarrelProps {
  roundResults: Array<{ hit: boolean, usedHint: boolean }>;
  isAudioOn: boolean;
}

const SixShooterBarrel: React.FC<SixShooterBarrelProps> = ({ roundResults, isAudioOn }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [hasPlayedInitialSpin, setHasPlayedInitialSpin] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Play barrel spin sound on game load if audio is on
    if (isAudioOn && !hasPlayedInitialSpin) {
      setIsSpinning(true);
      const audio = new Audio(barrelSpinSound);
      audio.play();

      // After spin animation completes, play gun getting ready sound
      setTimeout(() => {
        setIsSpinning(false);
        const readyAudio = new Audio(gunGettingReadySound);
        readyAudio.play();
        setHasPlayedInitialSpin(true);
      }, 800); // Match the spin animation duration
    }

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [isAudioOn, hasPlayedInitialSpin]);

  const handleSpin = () => {
    if (!canSpin) return;
    
    setIsSpinning(true);
    setCanSpin(false);

    // Play barrel spin sound if audio is on
    if (isAudioOn) {
      const audio = new Audio(barrelSpinSound);
      audio.play();
    }

    // Reset spinning state after animation
    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);

    // Reset cooldown after 5 seconds
    setTimeout(() => {
      setCanSpin(true);
    }, 5000);
  };

  // Shell positions in pixels for desktop
  const desktopPositions = [
    { left: 87, top: 12 },   // top-right
    { left: 115, top: 53 },  // right
    { left: 90, top: 96 },   // bottom-right
    { left: 51, top: 98 },   // bottom
    { left: 19, top: 62 },   // bottom-left
    { left: 44, top: 21 }    // top-left
  ];

  // Shell positions in pixels for mobile
  const mobilePositions = [
    { left: 66, top: 13 },   // top-right
    { left: 86, top: 40 },   // right
    { left: 68, top: 73 },   // bottom-right
    { left: 38, top: 73 },   // bottom
    { left: 16, top: 47 },   // bottom-left
    { left: 33, top: 17 }    // top-left
  ];

  const shellPositions = isMobile ? mobilePositions : desktopPositions;
  const shellSize = isMobile ? 25 : 35;

  return (
    <div 
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onClick={handleSpin}
    >
      {/* Base barrel image */}
      <motion.img
        src={sixShooterBarrel}
        alt="Six Shooter Barrel"
        animate={{ 
          rotate: isSpinning ? [0, 1440] : 1440
        }}
        transition={{ 
          duration: 0.7,
          ease: "linear"
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          cursor: canSpin ? 'pointer' : 'default',
          transformOrigin: 'center center',
          userSelect: 'none'
        }}
      />

      {/* Shell container */}
      <motion.div
        animate={{ 
          rotate: isSpinning ? [0, 1440] : 1440
        }}
        transition={{ 
          duration: 0.7,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transformOrigin: 'center center'
        }}
      >
        {/* Shell indicators */}
        {Array(6).fill(null).map((_, index) => {
          const result = roundResults[index];
          const position = shellPositions[index];
          
          // Show empty slot for current round and future rounds
          if (!result) {
            return (
              <motion.div
                key={index}
                style={{
                  position: 'absolute',
                  width: `${shellSize}px`,
                  height: `${shellSize}px`,
                  left: position.left,
                  top: position.top
                }}
              />
            );
          }

          // Show success or miss shell for completed rounds
          return (
            <motion.img
              key={index}
              src={result.hit ? successShell : missShell}
              alt={result.hit ? "Success" : "Miss"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                width: `${shellSize}px`,
                height: `${shellSize}px`,
                left: position.left,
                top: position.top
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default SixShooterBarrel; 