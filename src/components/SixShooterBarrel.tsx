import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Import assets
import sixShooterBarrel from '../assets/images/six_shooter_barrel.png';
import successShell from '../assets/images/success_shell.png';
import missShell from '../assets/images/miss_shell.png';

interface SixShooterBarrelProps {
  roundResults: Array<{ hit: boolean, usedHint: boolean }>;
}

const SixShooterBarrel: React.FC<SixShooterBarrelProps> = ({ roundResults }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    { left: 65, top: 10 },   // top-right
    { left: 85, top: 42 },   // right
    { left: 68, top: 75 },   // bottom-right
    { left: 38, top: 77 },   // bottom
    { left: 14, top: 48 },   // bottom-left
    { left: 33, top: 17 }    // top-left
  ];

  const shellPositions = isMobile ? mobilePositions : desktopPositions;
  const shellSize = isMobile ? 25 : 35;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Base barrel image */}
      <img
        src={sixShooterBarrel}
        alt="Six Shooter Barrel"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute'
        }}
      />

      {/* Shell container */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
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
      </div>
    </div>
  );
};

export default SixShooterBarrel; 