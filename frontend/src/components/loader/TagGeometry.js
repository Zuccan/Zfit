import * as THREE from 'three';
import logoSrc from '../../assets/zfits-logo-suit.png';
import { TAG_CONFIG } from './TagConfig';

export const TAG_DIMENSIONS = {
  width: TAG_CONFIG.cardWidth,
  height: TAG_CONFIG.cardHeight,
  depth: TAG_CONFIG.cardThickness,
  bevelThickness: TAG_CONFIG.bevelThickness,
  bevelSize: TAG_CONFIG.bevelSize,
  bevelSegments: 2,
  holeRadius: TAG_CONFIG.holeRadius,
  holeOffsetY: TAG_CONFIG.holeOffsetY,
};

/**
 * Creates the pure rectangular paper tag shape with 4 sharp 90-degree square corners
 * and a clean circular punched hole cutout.
 */
export function createTagShape() {
  const { width: w, height: h, holeRadius, holeOffsetY } = TAG_DIMENSIONS;
  const shape = new THREE.Shape();

  const hw = w / 2;
  const hh = h / 2;

  // 4 sharp 90-degree square corners
  shape.moveTo(-hw, hh); // Top-Left
  shape.lineTo(hw, hh);  // Top-Right
  shape.lineTo(hw, -hh); // Bottom-Right
  shape.lineTo(-hw, -hh);// Bottom-Left
  shape.closePath();

  // Clean punched circular hole
  const hole = new THREE.Path();
  const holeY = hh - holeOffsetY;
  hole.absarc(0, holeY, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return { shape, holeY };
}

/**
 * Creates the extruded tag geometry with microscopic paper edge definition
 * and normalized UV coordinates for texture mapping.
 */
export function createTagGeometry() {
  const { shape, holeY } = createTagShape();
  const { depth, bevelThickness, bevelSize, bevelSegments, width: w, height: h } = TAG_DIMENSIONS;

  const extrudeSettings = {
    steps: 1,
    depth: depth,
    bevelEnabled: true,
    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelOffset: 0,
    bevelSegments: bevelSegments,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Center geometry along Z axis so front and back are symmetrically aligned around z=0
  geometry.computeBoundingBox();
  const zOffset = -(depth + bevelThickness * 2) / 2;
  geometry.translate(0, 0, zOffset);

  // Normalize UV coordinates across [0, 1]
  const uv = geometry.attributes.uv;
  if (uv) {
    const hw = w / 2;
    const hh = h / 2;
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);
      uv.setXY(i, (u + hw) / w, (v + hh) / h);
    }
    uv.needsUpdate = true;
  }

  geometry.computeVertexNormals();

  return { geometry, holeY };
}

/**
 * Shared preloaded Image instance for the Z-suit reference logo
 */
let sharedLogoImage = null;
let isImageLoading = false;
const pendingUpdateCallbacks = [];

function loadLogoImage(callback) {
  if (sharedLogoImage && sharedLogoImage.complete && sharedLogoImage.naturalWidth > 0) {
    if (callback) callback(sharedLogoImage);
    return sharedLogoImage;
  }

  if (callback) {
    pendingUpdateCallbacks.push(callback);
  }

  if (!isImageLoading) {
    isImageLoading = true;
    const img = new Image();
    img.src = logoSrc;
    img.onload = () => {
      sharedLogoImage = img;
      isImageLoading = false;
      while (pendingUpdateCallbacks.length > 0) {
        const cb = pendingUpdateCallbacks.shift();
        cb(img);
      }
    };
    img.onerror = () => {
      isImageLoading = false;
    };
  }

  return sharedLogoImage;
}

/**
 * Helper to prepare a crisp logo offscreen canvas mask
 */
function createLogoCanvas(logoImg, targetWidth, targetHeight, color = TAG_CONFIG.contentColor) {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx || !logoImg) return canvas;

  ctx.drawImage(logoImg, 0, 0, targetWidth, targetHeight);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  return canvas;
}

/**
 * Renders the deep black luxury paper card artwork with PURE WHITE Z-suit logo & typography
 */
function renderBrandCanvas(canvas, logoImg) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const cw = canvas.width;
  const ch = canvas.height;

  // 1. Deep Rich Luxury Matte Black Cardstock
  ctx.fillStyle = TAG_CONFIG.cardBgColor;
  ctx.fillRect(0, 0, cw, ch);

  // 2. Subtle fine tactile paper grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.018)';
  for (let i = 0; i < 3500; i++) {
    const gx = Math.random() * cw;
    const gy = Math.random() * ch;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 3. Crisp Pure White Haute Couture Framing Border
  ctx.strokeStyle = TAG_CONFIG.contentColor;
  ctx.lineWidth = 2.4;
  ctx.strokeRect(42, 42, cw - 84, ch - 84);

  // Subtle inner accent border for luxury label craftsmanship
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
  ctx.lineWidth = 1.0;
  ctx.strokeRect(54, 54, cw - 108, ch - 108);

  // 4. Render the Z-Suit Reference Logo in PURE CRISP WHITE
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    const targetWidth = 520;
    const targetHeight = targetWidth * (logoImg.naturalHeight / logoImg.naturalWidth);
    const logoX = (cw - targetWidth) / 2;
    const logoY = ch * 0.42 - targetHeight / 2;

    const whiteLogo = createLogoCanvas(logoImg, targetWidth, targetHeight, TAG_CONFIG.contentColor);

    ctx.save();
    ctx.drawImage(whiteLogo, logoX, logoY);
    ctx.restore();
  }

  // 5. Pure White Luxury Haute Couture Typography: ZFITS. Wordmark in Cinzel
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const brandY = ch * 0.63;
  ctx.font = '700 116px "Cinzel", "Italiana", "Playfair Display", "Didot", "Bodoni MT", serif';
  ctx.letterSpacing = '5px';
  ctx.fillStyle = TAG_CONFIG.contentColor;
  ctx.fillText('ZFITS.', cw / 2, brandY);

  // Subtext: STUDIO in refined spaced haute couture typography
  const subY = ch * 0.70;
  ctx.font = '500 28px "Cinzel", "Outfit", sans-serif';
  ctx.letterSpacing = '18px';
  ctx.fillStyle = TAG_CONFIG.contentColor;
  ctx.fillText('STUDIO', cw / 2, subY);

  ctx.restore();
}

/**
 * Renders the High-Definition Bump Map for subtle tactile ink and border depth
 */
function renderBumpCanvas(canvas, logoImg) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const cw = canvas.width;
  const ch = canvas.height;

  // Base neutral height (128)
  ctx.fillStyle = 'rgb(128, 128, 128)';
  ctx.fillRect(0, 0, cw, ch);

  // Subtle raised borders
  ctx.strokeStyle = 'rgb(255, 255, 255)';
  ctx.lineWidth = 2.8;
  ctx.filter = 'blur(1.6px)';
  ctx.strokeRect(42, 42, cw - 84, ch - 84);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(54, 54, cw - 108, ch - 108);
  ctx.filter = 'none';

  // Subtle raised Z-suit logo
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    const targetWidth = 520;
    const targetHeight = targetWidth * (logoImg.naturalHeight / logoImg.naturalWidth);
    const logoX = (cw - targetWidth) / 2;
    const logoY = ch * 0.42 - targetHeight / 2;

    const whiteMask = createLogoCanvas(logoImg, targetWidth, targetHeight, 'rgb(255, 255, 255)');
    ctx.save();
    ctx.filter = 'blur(1.8px)';
    ctx.drawImage(whiteMask, logoX, logoY);
    ctx.restore();
  }

  // Subtle raised typography
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.filter = 'blur(1.6px)';
  ctx.fillStyle = 'rgb(255, 255, 255)';

  ctx.font = '700 116px "Cinzel", "Italiana", "Playfair Display", "Didot", "Bodoni MT", serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('ZFITS.', cw / 2, ch * 0.63);

  ctx.font = '500 28px "Cinzel", "Outfit", sans-serif';
  ctx.letterSpacing = '18px';
  ctx.fillText('STUDIO', cw / 2, ch * 0.70);

  ctx.restore();
}

/**
 * Generates the high-resolution front diffuse texture for the black card with pure white content
 */
export function createTagFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const refreshTexture = () => {
    renderBrandCanvas(canvas, sharedLogoImage);
    texture.needsUpdate = true;
  };

  loadLogoImage(() => refreshTexture());

  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => refreshTexture());
  }

  refreshTexture();
  return texture;
}

/**
 * Generates the high-resolution bump texture
 */
export function createTagBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;

  const texture = new THREE.CanvasTexture(canvas);

  const refreshTexture = () => {
    renderBumpCanvas(canvas, sharedLogoImage);
    texture.needsUpdate = true;
  };

  loadLogoImage(() => refreshTexture());

  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => refreshTexture());
  }

  refreshTexture();
  return texture;
}

/**
 * Generates the high-resolution back texture for the black card with matching un-mirrored artwork
 */
export function createTagBackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const refreshTexture = () => {
    renderBrandCanvas(canvas, sharedLogoImage);
    texture.needsUpdate = true;
  };

  loadLogoImage(() => refreshTexture());

  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => refreshTexture());
  }

  refreshTexture();
  return texture;
}
