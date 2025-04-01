import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../styles/HowToPlay.css';

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
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
          
          <h2 className="modal-title">
            {t('howToPlayTitle')}
          </h2>

          <p className="welcome-text">
            {t('welcomeText')}
          </p>

          <div className="instructions-container">
            <p className="instruction-text">
              1. {t('instruction1')}
            </p>
            <p className="instruction-text">
              2. {t('instruction2')}
            </p>
            <p className="instruction-text">
              3. {t('instruction3')}
            </p>
            <p className="instruction-text">
              4. {t('instruction4')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HowToPlay; 