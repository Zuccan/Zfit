import * as THREE from 'three';
import logoSrc from '../../assets/zfits-logo-suit.png';

/**
 * Tag Dimensions and Geometry Specification:
 * Ultra-Thin Premium Black Paper Clothing Hang Tag:
 * - Simple rectangular shape with four perfectly sharp 90-degree square corners
 * - Ultra-thin physical paper construction: ~0.35 - 0.45 mm thickness in real scale
 * - Fully black luxury cardstock (#0D0D0F) with fine paper grain
 * - New reference logo: Tailored dress shirt collar & tie inside the letter Z in crisp white
 * - Narrow portrait proportions: 0.68 x 1.36 (~1:2 aspect ratio, 38-44vh desktop presence)
 * - Tiny circular punched hole cutout for suspension cord (holeRadius: 0.020)
 */
export const TAG_DIMENSIONS = {
  width: 0.68,
  height: 1.36,
  depth: 0.0044, // Ultra-thin physical paperboard (~0.35 - 0.45 mm)
  bevelThickness: 0.0006, // Microscopic edge definition (no bulky bevels)
  bevelSize: 0.0006,
  bevelSegments: 1,
  holeRadius: 0.020,
  holeOffsetY: 0.10, // Distance from top edge to hole center
};

/**
 * Creates the pure rectangular paper tag shape with 4 sharp 90-degree square corners
 * and a tiny circular punched hole cutout.
 */
export function createTagShape() {
  const { width: w, height: h, holeRadius, holeOffsetY } = TAG_DIMENSIONS;
  const shape = new THREE.Shape();

  const hw = w / 2;
  const hh = h / 2;

  // 4 perfectly sharp 90-degree square corners (no chamfers, no radius)
  shape.moveTo(-hw, hh); // Top-Left
  shape.lineTo(hw, hh);  // Top-Right
  shape.lineTo(hw, -hh); // Bottom-Right
  shape.lineTo(-hw, -hh);// Bottom-Left
  shape.closePath();

  // Tiny circular punched hole through the paper card
  const hole = new THREE.Path();
  const holeY = hh - holeOffsetY;
  // Clockwise winding for geometric cutout in Three.js ExtrudeGeometry
  hole.absarc(0, holeY, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return { shape, holeY };
}

/**
 * Creates the ultra-thin extruded tag geometry with microscopic paper edge definition
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

  // Center geometry along Z axis so the front and back are symmetrically aligned around z=0
  geometry.computeBoundingBox();
  const zOffset = -(depth + bevelThickness * 2) / 2;
  geometry.translate(0, 0, zOffset);

  // Normalize UV coordinates so texture maps across the face [0, 1]
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
 * Renders the FULLY BLACK luxury paper card artwork with the new suit-tie reference logo
 */
function renderBrandCanvas(canvas, logoImg) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const cw = canvas.width;
  const ch = canvas.height;

  // 1. Fully Deep Rich Matte Black Luxury Paper Base (#0D0D0F)
  ctx.fillStyle = '#0D0D0F';
  ctx.fillRect(0, 0, cw, ch);

  // 2. Subtle fine tactile paper grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.018)';
  for (let i = 0; i < 4800; i++) {
    const gx = Math.random() * cw;
    const gy = Math.random() * ch;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 3. Crisp minimalist rectangular border matching the 90-degree square silhouette
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(44, 44, cw - 88, ch - 88);

  // 4. Render the new reference logo: Dress shirt collar & tie inside the letter Z
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    const targetWidth = 520;
    const targetHeight = targetWidth * (logoImg.naturalHeight / logoImg.naturalWidth);
    const logoX = (cw - targetWidth) / 2;
    const logoY = ch * 0.42 - targetHeight / 2;

    ctx.save();
    ctx.drawImage(logoImg, logoX, logoY, targetWidth, targetHeight);
    ctx.restore();
  }

  // 5. Draw the original ZFITs bold wordmark beneath the emblem in pure crisp white
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 114px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Haas Regular", sans-serif';
  ctx.letterSpacing = '-2px';
  ctx.fillText('ZFITS.', cw / 2, ch * 0.63);

  // Subtle luxury editorial subtext
  ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
  ctx.letterSpacing = '8px';
  ctx.fillText('STUDIO', cw / 2, ch * 0.70);
  ctx.restore();
}

/**
 * Generates the high-resolution front texture for the fully black card
 */
export function createTagFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const img = loadLogoImage(() => {
    renderBrandCanvas(canvas, sharedLogoImage);
    texture.needsUpdate = true;
  });

  renderBrandCanvas(canvas, img);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates the high-resolution back texture for the fully black card with MATCHING VISUAL QUALITY:
 * - Identical fully black paper material
 * - Identical new reference Z-suit branding (readable and NOT mirrored)
 * - Matching debossed border and surface grain
 */
export function createTagBackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const img = loadLogoImage(() => {
    renderBrandCanvas(canvas, sharedLogoImage);
    texture.needsUpdate = true;
  });

  renderBrandCanvas(canvas, img);
  texture.needsUpdate = true;
  return texture;
}
