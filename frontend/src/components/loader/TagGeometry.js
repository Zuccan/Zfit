import * as THREE from 'three';

/**
 * Tag Dimensions and Geometry Specification:
 * - Premium balanced silhouette: Aspect ratio ~0.61 (Width 1.25, Height 2.05)
 * - Desktop screen presence: ~58-62vh
 * - Physical thickness: depth 0.07 + bevels 0.018 -> rich visible 3D sidewalls
 * - Signature diagonal chamfers at Top-Left and Bottom-Right
 * - Smoothly rounded Top-Right and Bottom-Left corners
 * - Genuine circular punched hole (no metallic eyelet)
 */
export const TAG_DIMENSIONS = {
  width: 1.25,
  height: 2.05,
  depth: 0.07,
  cornerRadius: 0.10,
  chamfer: 0.28,
  holeRadius: 0.065,
  holeOffsetY: 0.22, // Distance from top edge to hole center
  bevelThickness: 0.018,
  bevelSize: 0.018,
  bevelSegments: 4,
};

// Exact original ZFITs SVG logo mark path from assets/logo-mark.svg
const Z_LOGO_SVG_PATH =
  'M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z';

/**
 * Creates the outer shape with signature chamfers, rounded corners,
 * and genuine circular punched hole.
 */
export function createTagShape() {
  const { width: w, height: h, cornerRadius: r, chamfer: c, holeRadius, holeOffsetY } = TAG_DIMENSIONS;
  const shape = new THREE.Shape();

  const hw = w / 2;
  const hh = h / 2;

  // Start at left edge just below top-left chamfer
  shape.moveTo(-hw, hh - c);

  // Top-left diagonal chamfer
  shape.lineTo(-hw + c, hh);

  // Top edge to top-right corner
  shape.lineTo(hw - r, hh);

  // Top-right rounded corner
  shape.quadraticCurveTo(hw, hh, hw, hh - r);

  // Right edge down to bottom-right chamfer
  shape.lineTo(hw, -hh + c);

  // Bottom-right diagonal chamfer
  shape.lineTo(hw - c, -hh);

  // Bottom edge to bottom-left corner
  shape.lineTo(-hw + r, -hh);

  // Bottom-left rounded corner
  shape.quadraticCurveTo(-hw, -hh, -hw, -hh + r);

  // Left edge back to start
  shape.lineTo(-hw, hh - c);

  // Genuine circular punched hole through the card
  const hole = new THREE.Path();
  const holeY = hh - holeOffsetY;
  // Clockwise winding for hole cutout in Three.js
  hole.absarc(0, holeY, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return { shape, holeY };
}

/**
 * Creates the extruded tag geometry with beveled physical edges
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

  // Center geometry along Z axis so (x, y) stays clean for local rotation
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
 * Generates the high-resolution front texture:
 * - Premium warm ivory / off-white paper base (#F3F0E9)
 * - Tactile luxury paper grain
 * - Exact original ZFITs SVG logo mark in bold dark charcoal (#111114)
 * - Original bold typographic wordmark ZFITS.
 */
export function createTagFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1680;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  // 1. Premium Warm Ivory Paper Base
  ctx.fillStyle = '#F3F0E9';
  ctx.fillRect(0, 0, 1024, 1680);

  // 2. Tactile luxury paper fibers and grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.024)';
  for (let i = 0; i < 4500; i++) {
    const gx = Math.random() * 1024;
    const gy = Math.random() * 1680;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 3. Subtle debossed perimeter border matching chamfered silhouette
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(50, 50, 924, 1580);

  // 4. Render the authentic original ZFITs SVG Logo in DARK CHARCOAL (#111114)
  ctx.save();

  // Draw the SVG Mark using Path2D
  try {
    const path = new Path2D(Z_LOGO_SVG_PATH);
    ctx.save();
    // Center at 512, Y: 720. Scale from 48x46 to 230x220
    const scale = 4.8;
    ctx.translate(512 - (48 * scale) / 2, 700 - (46 * scale) / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#111114';
    ctx.fill(path);
    ctx.restore();
  } catch {
    // Fallback if Path2D is unavailable
  }

  // Draw the original ZFITs bold wordmark beneath the mark
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#111114';
  ctx.font = '800 120px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Haas Regular", sans-serif';
  ctx.letterSpacing = '-2px';
  ctx.fillText('ZFITS.', 512, 980);

  // Clean luxury subtitle
  ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '10px';
  ctx.fillStyle = '#65635e';
  ctx.fillText('AI PERSONAL STYLIST', 512, 1075);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates the clean rear texture for realistic 360° rotation.
 */
export function createTagBackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1680;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#F3F0E9';
  ctx.fillRect(0, 0, 1024, 1680);

  // Subtle paper grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.022)';
  for (let i = 0; i < 3500; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 1680, 1.5, 1.5);
  }

  // Subtle rear authentication seal
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.font = '700 70px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('ZFITS STUDIO', 512, 880);

  ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '10px';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fillText('EDITION 01 // BESPOKE', 512, 960);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
