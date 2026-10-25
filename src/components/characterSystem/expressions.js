/**
 * Configurable Expression System for ZFIT 3D Blob Mascot System.
 * Named expressions and phonemes ready for lip-sync and emotional animation.
 */

export const EXPRESSIONS = {
  neutral: {
    name: 'Neutral',
    leftEye: { open: 1.0, shape: 'round', pupilX: 0, pupilY: 0 },
    rightEye: { open: 1.0, shape: 'round', pupilX: 0, pupilY: 0 },
    leftEyebrow: { y: 0, rot: 0 },
    rightEyebrow: { y: 0, rot: 0 },
    mouth: { shape: 'gentle_smile', open: 0.2, width: 0.8 },
    blush: 0.0,
    headTilt: { x: 0, y: 0, z: 0 },
    squash: { x: 1.0, y: 1.0, z: 1.0 },
  },

  happy: {
    name: 'Happy',
    leftEye: { open: 1.0, shape: 'round', pupilX: 0, pupilY: 0 },
    rightEye: { open: 1.0, shape: 'round', pupilX: 0, pupilY: 0 },
    leftEyebrow: { y: 0.08, rot: 0.05 },
    rightEyebrow: { y: 0.08, rot: -0.05 },
    mouth: { shape: 'wide_smile', open: 0.85, width: 1.1 },
    blush: 0.25,
    headTilt: { x: -0.05, y: 0, z: 0.02 },
    squash: { x: 1.02, y: 0.98, z: 1.0 },
  },

  shy: {
    name: 'Shy',
    leftEye: { open: 0.75, shape: 'round', pupilX: 0.1, pupilY: -0.2 },
    rightEye: { open: 0.75, shape: 'round', pupilX: 0.1, pupilY: -0.2 },
    leftEyebrow: { y: -0.04, rot: 0.12 },
    rightEyebrow: { y: -0.04, rot: -0.12 },
    mouth: { shape: 'small_smile', open: 0.25, width: 0.7 },
    blush: 0.85,
    headTilt: { x: 0.1, y: 0.08, z: -0.04 },
    squash: { x: 0.98, y: 1.02, z: 0.98 },
  },

  blush: {
    name: 'Blush',
    leftEye: { open: 0.65, shape: 'happy_arc', pupilX: 0, pupilY: 0 },
    rightEye: { open: 0.65, shape: 'happy_arc', pupilX: 0, pupilY: 0 },
    leftEyebrow: { y: 0.02, rot: 0.08 },
    rightEyebrow: { y: 0.02, rot: -0.08 },
    mouth: { shape: 'cat_smile', open: 0.35, width: 0.85 },
    blush: 1.0,
    headTilt: { x: 0.08, y: 0, z: 0.03 },
    squash: { x: 1.04, y: 0.96, z: 1.0 },
  },

  surprised: {
    name: 'Surprised',
    leftEye: { open: 1.3, shape: 'round', pupilX: 0, pupilY: 0 },
    rightEye: { open: 1.3, shape: 'round', pupilX: 0, pupilY: 0 },
    leftEyebrow: { y: 0.22, rot: 0.05 },
    rightEyebrow: { y: 0.22, rot: -0.05 },
    mouth: { shape: 'round_o', open: 1.2, width: 0.8 },
    blush: 0.0,
    headTilt: { x: -0.08, y: 0, z: 0 },
    squash: { x: 0.94, y: 1.08, z: 0.94 },
  },

  confused: {
    name: 'Confused',
    leftEye: { open: 1.1, shape: 'round', pupilX: 0.15, pupilY: 0.1 },
    rightEye: { open: 0.75, shape: 'round', pupilX: 0.15, pupilY: 0.1 },
    leftEyebrow: { y: 0.2, rot: -0.15 }, // Raised eyebrow (like Green avatar!)
    rightEyebrow: { y: -0.08, rot: 0.18 },
    mouth: { shape: 'crooked', open: 0.4, width: 0.85 },
    blush: 0.1,
    headTilt: { x: 0, y: 0.05, z: 0.12 },
    squash: { x: 1.0, y: 1.0, z: 1.0 },
  },

  laughing: {
    name: 'Laughing',
    leftEye: { open: 0.0, shape: 'squint', pupilX: 0, pupilY: 0 }, // Closed laughing eyes
    rightEye: { open: 0.0, shape: 'squint', pupilX: 0, pupilY: 0 },
    leftEyebrow: { y: 0.1, rot: 0.1 },
    rightEyebrow: { y: 0.1, rot: -0.1 },
    mouth: { shape: 'laughing_open', open: 1.1, width: 1.25 },
    blush: 0.45,
    headTilt: { x: -0.12, y: 0, z: 0 },
    squash: { x: 1.06, y: 0.92, z: 1.0 },
  },

  talking: {
    name: 'Talking',
    leftEye: { open: 1.0, shape: 'round', pupilX: 0, pupilY: 0 },
    rightEye: { open: 1.0, shape: 'round', pupilX: 0, pupilY: 0 },
    leftEyebrow: { y: 0.06, rot: 0.02 },
    rightEyebrow: { y: 0.06, rot: -0.02 },
    mouth: { shape: 'talk_phoneme_A', open: 0.7, width: 0.95 },
    blush: 0.15,
    headTilt: { x: 0.02, y: 0, z: 0.01 },
    squash: { x: 1.01, y: 0.99, z: 1.0 },
  },

  excited: {
    name: 'Excited',
    leftEye: { open: 1.15, shape: 'round', pupilX: 0, pupilY: 0.05 },
    rightEye: { open: 0.0, shape: 'wink', pupilX: 0, pupilY: 0 }, // Playful wink!
    leftEyebrow: { y: 0.15, rot: 0.08 },
    rightEyebrow: { y: 0.12, rot: -0.08 },
    mouth: { shape: 'wide_smile', open: 1.0, width: 1.2 },
    blush: 0.6,
    headTilt: { x: -0.06, y: 0.05, z: -0.05 },
    squash: { x: 1.05, y: 0.95, z: 1.0 },
  },
};

/**
 * Phonemes for audio-driven speech lip-sync
 */
export const PHONEMES = {
  A: { shape: 'talk_phoneme_A', open: 0.8, width: 1.05 },
  O: { shape: 'round_o', open: 0.9, width: 0.75 },
  E: { shape: 'wide_smile', open: 0.45, width: 1.15 },
  U: { shape: 'round_o', open: 0.5, width: 0.6 },
  M: { shape: 'gentle_smile', open: 0.05, width: 0.8 },
  REST: { shape: 'gentle_smile', open: 0.2, width: 0.85 },
};

/**
 * Mascot base identities and colors
 */
export const MASCOTS = {
  yellow: {
    id: 'yellow',
    name: 'Yellow Blob',
    role: 'Stylist Host',
    color: 0xffc83b,
    sheenColor: 0xffe680,
    defaultExpression: 'happy',
    accessory: 'sneakers', // White sneakers
    hairStyle: 'curl',
  },
  blue: {
    id: 'blue',
    name: 'Blue Blob',
    role: 'Cool Trendsetter',
    color: 0x54b5ff,
    sheenColor: 0x99d6ff,
    defaultExpression: 'excited',
    accessory: 'sunglasses', // Sunglasses + cap
    hairStyle: 'antenna',
  },
  green: {
    id: 'green',
    name: 'Green Blob',
    role: 'Fashion Critic',
    color: 0x8ce65b,
    sheenColor: 0xc4ff9e,
    defaultExpression: 'confused', // Signature inquisitive raised eyebrow!
    accessory: 'sweatshirt', // Cream sweatshirt on hanger
    hairStyle: 'flick',
  },
  pink: {
    id: 'pink',
    name: 'Pink Blob',
    role: 'Hype Enthusiast',
    color: 0xff7da1,
    sheenColor: 0xffbcd0,
    defaultExpression: 'laughing', // Closed happy eyes '> <'
    accessory: 'trousers', // Black wide-leg trousers
    hairStyle: 'headband',
  },
};
