import char1 from '../../assets/Characters/char1.png';
import char4 from '../../assets/Characters/char4.png';
import char2 from '../../assets/Characters/char2.png';
import char3 from '../../assets/Characters/char3.png';

import shirt1 from '../../assets/Outfits/shirt1.png';
import shirt4 from '../../assets/Outfits/shirt 4.png';
import shirt2 from '../../assets/Outfits/shirt 2.png';
import shirt3 from '../../assets/Outfits/shirt3.png';

/**
 * ZFITS AI STYLING STUDIO SPECIFICATION
 * Updated Background Palettes matching the newly uploaded avatars & outfits:
 * 1. Pink: #FB7EA4 (Look 01 - Rose Overshirt)
 * 2. Burgundy: #450E16 (Look 02 - Heavyweight Hoodie)
 * 3. Orange: #F46208 (Look 03 - Rust Overshirt)
 * 4. Forest Green: #1B3D31 (Look 04 - Forest Utility Shirt)
 */
export const LOADER_SCENES = [
  {
    id: 'scene-pink',
    milestone: 10,
    code: 'LOOK 01 // 04',
    name: 'Rose Overshirt',
    pairing: 'White Relaxed Cargo // Rose Sneakers',
    characterSrc: char1,
    outfitSrc: shirt1,
    palette: {
      center: '#FB7EA4',
      mid: '#CC6785',
      edge: '#8C354E',
      vignette: 'rgba(0, 0, 0, 0.45)',
    },
    floorSpotlight: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255, 220, 235, 0.22) 0%, transparent 75%)',
    garmentRecognizableScale: 1.46,
    garmentRecognizableBlur: 16,
    garmentRecognizableOpacity: 0.38,
    garmentAtmosphericScale: 1.66,
    garmentAtmosphericBlur: 38,
    garmentAtmosphericOpacity: 0.24,
  },
  {
    id: 'scene-burgundy',
    milestone: 30,
    code: 'LOOK 02 // 04',
    name: 'Heavyweight Hoodie',
    pairing: 'Black Relaxed Cargo // Low White Sneakers',
    characterSrc: char4,
    outfitSrc: shirt4,
    palette: {
      center: '#561822',
      mid: '#450E16',
      edge: '#20060A',
      vignette: 'rgba(0, 0, 0, 0.60)',
    },
    floorSpotlight: 'radial-gradient(ellipse 65% 42% at 50% 100%, rgba(255, 215, 225, 0.14) 0%, transparent 75%)',
    garmentRecognizableScale: 1.46,
    garmentRecognizableBlur: 16,
    garmentRecognizableOpacity: 0.36,
    garmentAtmosphericScale: 1.66,
    garmentAtmosphericBlur: 38,
    garmentAtmosphericOpacity: 0.24,
  },
  {
    id: 'scene-orange',
    milestone: 60,
    code: 'LOOK 03 // 04',
    name: 'Rust Overshirt',
    pairing: 'White Cargo Pants // Low Orange Sneakers',
    characterSrc: char2,
    outfitSrc: shirt2,
    palette: {
      center: '#F46208',
      mid: '#C34E06',
      edge: '#7A2E00',
      vignette: 'rgba(0, 0, 0, 0.50)',
    },
    floorSpotlight: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255, 230, 205, 0.20) 0%, transparent 75%)',
    garmentRecognizableScale: 1.46,
    garmentRecognizableBlur: 16,
    garmentRecognizableOpacity: 0.38,
    garmentAtmosphericScale: 1.66,
    garmentAtmosphericBlur: 38,
    garmentAtmosphericOpacity: 0.24,
  },
  {
    id: 'scene-green',
    milestone: 90,
    code: 'LOOK 04 // 04',
    name: 'Forest Utility Shirt',
    pairing: 'White Cargo Pants // Green Low Sneakers',
    characterSrc: char3,
    outfitSrc: shirt3,
    palette: {
      center: '#224D3E',
      mid: '#1B3D31',
      edge: '#0C1E18',
      vignette: 'rgba(0, 0, 0, 0.60)',
    },
    floorSpotlight: 'radial-gradient(ellipse 65% 42% at 50% 100%, rgba(190, 240, 220, 0.14) 0%, transparent 75%)',
    garmentRecognizableScale: 1.46,
    garmentRecognizableBlur: 16,
    garmentRecognizableOpacity: 0.40,
    garmentAtmosphericScale: 1.66,
    garmentAtmosphericBlur: 38,
    garmentAtmosphericOpacity: 0.24,
  },
];

export const MOTION_CONFIG = {
  totalDurationSeconds: 8.4,
  crossfadeDurationSeconds: 0.9,
  finalHoldSeconds: 0.4,
  exitFadeSeconds: 0.75,
};
