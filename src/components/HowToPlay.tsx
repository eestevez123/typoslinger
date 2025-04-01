import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface HowToPlayProps {
  onClose: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '90vw',
            maxWidth: '800px',
            maxHeight: '90dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            padding: '2rem',
            overflowY: 'auto'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              color: '#2c3e50',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 10.59 17.59 19 19 17.59 12 10.59z"
                fill="currentColor"
              />
            </svg>
          </button>
          
          <h2
            style={{
              color: '#2c3e50',
              marginBottom: '2rem',
              textAlign: 'center',
              fontSize: 'clamp(2rem, 5vw, 2.5rem)'
            }}
          >
            {t('howToPlayTitle')}
          </h2>

          <p
            style={{
              color: '#2c3e50',
              lineHeight: 1.8,
              textAlign: 'center',
              marginBottom: '2rem',
              fontSize: 'clamp(1.1rem, 2vw, 1.3rem)'
            }}
          >
            {t('welcomeText')}
          </p>

          <div
            style={{
              marginTop: '1rem',
              textAlign: 'left',
              width: '100%',
              maxWidth: '600px'
            }}
          >
            <p
              style={{
                marginBottom: '1rem',
                fontSize: 'clamp(1.1rem, 2vw, 1.2rem)',
                
                color: '#2c3e50'
              }}
            >
              1. {t('instruction1')}
            </p>
            <p
              style={{
                marginBottom: '1rem',
                fontSize: 'clamp(1.1rem, 2vw, 1.2rem)',
                
                color: '#2c3e50'
              }}
            >
              2. {t('instruction2')}
            </p>
            <p
              style={{
                marginBottom: '1rem',
                fontSize: 'clamp(1.1rem, 2vw, 1.2rem)',
                
                color: '#2c3e50'
              }}
            >
              3. {t('instruction3')}
            </p>
            <p
              style={{
                marginBottom: '1rem',
                fontSize: 'clamp(1.1rem, 2vw, 1.2rem)',
                
                color: '#2c3e50'
              }}
            >
              4. {t('instruction4')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HowToPlay; 