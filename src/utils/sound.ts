// Import audio files
import gunShotSound from '../assets/audio/gun_shot.mp3';
import gunReadySound from '../assets/audio/gun_getting_ready.wav';

// Create Audio instances
const gunShotAudio = new Audio(gunShotSound);
const gunReadyAudio = new Audio(gunReadySound);

// Keep track of audio state
let isAudioEnabled = false;

export const toggleAudio = (enabled: boolean, playIntroSound: boolean = false) => {
  isAudioEnabled = enabled;
  if (enabled && playIntroSound) {
    playGunReady();
  }
};

export const playGunShot = () => {
  if (isAudioEnabled) {
    gunShotAudio.currentTime = 0;
    gunShotAudio.play().catch(err => console.log('Audio playback failed:', err));
  }
};

export const playGunReady = () => {
  if (isAudioEnabled) {
    gunReadyAudio.currentTime = 0;
    gunReadyAudio.play().catch(err => console.log('Audio playback failed:', err));
  }
}; 