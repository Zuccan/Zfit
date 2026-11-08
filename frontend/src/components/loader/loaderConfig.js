import char1 from '../../assets/Characters/char1.png';
import char4 from '../../assets/Characters/char4.png';
import char3 from '../../assets/Characters/char3.png';
import char2 from '../../assets/Characters/char2.png';

import shirt1 from '../../assets/Outfits/shirt1.png';
import shirt4 from '../../assets/Outfits/shirt 4.png';
import shirt3 from '../../assets/Outfits/shirt3.png';
import shirt2 from '../../assets/Outfits/shirt 2.png';

/**
 * ZFITS AI STYLING STUDIO SPECIFICATION
 * Layer 1: Environmental studio background
 * Layer 2: Subtle atmospheric lighting and texture
 * Layer 3: Dual-layer oversized blurred active garment (atmospheric bloom + recognizable silhouette)
 * Layer 4: Sharp foreground character centered at exactly 50% viewport width
 * Layer 5: Studio floor reflection & ground contact shadow
 * Layer 6: Subtle AI studio header, outfit metadata & tabular percentage
 */
export const LOADER_SCENES = [
  {
    id: 'scene-olive',
    milestone: 10,
    code: 'LOOK 01 // 04',
    name: 'Field Overshirt',
    pairing: 'Black Relaxed Cargo // Low White Sneakers',
    characterSrc: char1,
    outfitSrc: shirt1,
    palette: {
      center: '#2A2E1F',
      mid: '#1F2216',
      edge: '#11130C',
      vignette: 'rgba(0, 0, 0, 0.55)',
    },
    floorSpotlight: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(200, 210, 180, 0.10) 0%, transparent 75%)',
    // Layer 3A: Recognizable Garment Silhouette
    garmentRecognizableScale: 1.48,
    garmentRecognizableBlur: 16,
    garmentRecognizableOpacity: 0.35,
    // Layer 3B: Soft Atmospheric Duplicate
    garmentAtmosphericScale: 1.68,
    garmentAtmosphericBlur: 38,
    garmentAtmosphericOpacity: 0.22,
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
      mid: '#44141B',
      edge: '#1E060A',
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
    id: 'scene-white',
    milestone: 60,
    code: 'LOOK 03 // 04',
    name: 'Relaxed Poplin',
    pairing: 'Silver Box Chain // Black Relaxed Cargo',
    characterSrc: char3,
    outfitSrc: shirt3,
    palette: {
      center: '#C8C6CA',
      mid: '#BCBABC',
      edge: '#969498',
      vignette: 'rgba(0, 0, 0, 0.32)',
    },
    floorSpotlight: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255, 255, 255, 0.20) 0%, transparent 75%)',
    garmentRecognizableScale: 1.46,
    garmentRecognizableBlur: 15,
    garmentRecognizableOpacity: 0.30,
    garmentAtmosphericScale: 1.64,
    garmentAtmosphericBlur: 36,
    garmentAtmosphericOpacity: 0.20,
  },
  {
    id: 'scene-black',
    milestone: 90,
    code: 'LOOK 04 // 04',
    name: 'Ribbed Knit',
    pairing: 'Dogtag Pendant // Black Relaxed Cargo',
    characterSrc: char2,
    outfitSrc: shirt2,
    palette: {
      center: '#1C1C1E',
      mid: '#101012',
      edge: '#050506',
      vignette: 'rgba(0, 0, 0, 0.65)',
    },
    floorSpotlight: 'radial-gradient(ellipse 65% 42% at 50% 100%, rgba(255, 255, 255, 0.14) 0%, transparent 75%)',
    garmentRecognizableScale: 1.48,
    garmentRecognizableBlur: 16,
    garmentRecognizableOpacity: 0.42,
    garmentAtmosphericScale: 1.68,
    garmentAtmosphericBlur: 38,
    garmentAtmosphericOpacity: 0.25,
  },
];

export const MOTION_CONFIG = {
  totalDurationSeconds: 8.4,
  crossfadeDurationSeconds: 0.9,
  finalHoldSeconds: 0.4,
  exitFadeSeconds: 0.75,
};
