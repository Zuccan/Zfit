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
 * Legendary Studio Lighting with Lighter, Illuminated Environments:
 * - Clean radiant ambient lighting in the center separating background from garment
 * - Higher contrast, unmistakable oversized garment silhouettes
 * - Soft volumetric bloom & drop shadow framing the avatar
 * 1. Pink: Rose Blush Glow (Look 01)
 * 2. Burgundy: Luminous Ruby/Wine Velvet (Look 02)
 * 3. Orange: Sunlit Golden Amber (Look 03)
 * 4. Forest Green: Radiant Emerald Sage (Look 04)
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
      center: '#FFBCD0',
      mid: '#FB94B4',
      edge: '#DE688D',
      vignette: 'rgba(0, 0, 0, 0.22)',
    },
    floorSpotlight: 'radial-gradient(ellipse 65% 45% at 50% 100%, rgba(255, 235, 245, 0.35) 0%, transparent 75%)',
    garmentRecognizableScale: 1.52,
    garmentRecognizableBlur: 14,
    garmentRecognizableOpacity: 0.65,
    garmentAtmosphericScale: 1.72,
    garmentAtmosphericBlur: 34,
    garmentAtmosphericOpacity: 0.38,
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
      center: '#B8384E',
      mid: '#942638',
      edge: '#661826',
      vignette: 'rgba(0, 0, 0, 0.30)',
    },
    floorSpotlight: 'radial-gradient(ellipse 65% 45% at 50% 100%, rgba(255, 215, 230, 0.35) 0%, transparent 75%)',
    garmentRecognizableScale: 1.52,
    garmentRecognizableBlur: 14,
    garmentRecognizableOpacity: 0.75,
    garmentAtmosphericScale: 1.72,
    garmentAtmosphericBlur: 34,
    garmentAtmosphericOpacity: 0.45,
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
      center: '#FFAE6A',
      mid: '#F47B22',
      edge: '#C95208',
      vignette: 'rgba(0, 0, 0, 0.24)',
    },
    floorSpotlight: 'radial-gradient(ellipse 65% 45% at 50% 100%, rgba(255, 235, 215, 0.35) 0%, transparent 75%)',
    garmentRecognizableScale: 1.52,
    garmentRecognizableBlur: 14,
    garmentRecognizableOpacity: 0.65,
    garmentAtmosphericScale: 1.72,
    garmentAtmosphericBlur: 34,
    garmentAtmosphericOpacity: 0.38,
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
      center: '#4B9B80',
      mid: '#337C64',
      edge: '#205342',
      vignette: 'rgba(0, 0, 0, 0.30)',
    },
    floorSpotlight: 'radial-gradient(ellipse 65% 45% at 50% 100%, rgba(200, 245, 225, 0.35) 0%, transparent 75%)',
    garmentRecognizableScale: 1.52,
    garmentRecognizableBlur: 14,
    garmentRecognizableOpacity: 0.72,
    garmentAtmosphericScale: 1.72,
    garmentAtmosphericBlur: 34,
    garmentAtmosphericOpacity: 0.42,
  },
];

export const MOTION_CONFIG = {
  totalDurationSeconds: 8.4,
  crossfadeDurationSeconds: 0.9,
  finalHoldSeconds: 0.4,
  exitFadeSeconds: 0.75,
};
