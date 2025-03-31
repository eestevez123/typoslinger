import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '90vw',
            maxWidth: '800px',
            maxHeight: '90dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            padding: '2rem',
            overflowY: 'auto'
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#2c3e50'
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Typography
            variant="h3"
            component="h2"
            sx={{
              color: '#2c3e50',
              mb: 4,
              textAlign: 'center',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            {t('howToPlayTitle')}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#2c3e50',
              lineHeight: 1.8,
              textAlign: 'center',
              mb: 4,
              fontSize: { xs: '1.1rem', md: '1.3rem' }
            }}
          >
            {t('welcomeText')}
          </Typography>

          <Box sx={{ 
            mt: 2, 
            textAlign: 'left',
            width: '100%',
            maxWidth: '600px'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
              1. {t('instruction1')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
              2. {t('instruction2')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
              3. {t('instruction3')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
              4. {t('instruction4')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default HowToPlay; 