import * as THREE from 'three';

/**
 * Tag Dimensions and Geometry Specification:
 * - Dominates screen: Height 2.6, Width 1.25 (Aspect ratio 1:2.08)
 * - Physical thickness: 0.08 units with 0.022 bevels -> clearly visible 3D profile
 * - Signature diagonal chamfers at Top-Left and Bottom-Right
 * - Smoothly rounded Top-Right and Bottom-Left corners
 * - Genuine through-hole geometric cutout
 */
export const TAG_DIMENSIONS = {
  width: 1.25,
  height: 2.6,
  depth: 0.08,
  cornerRadius: 0.12,
  chamfer: 0.32,
  holeRadius: 0.075,
  holeOffsetY: 0.28, // Distance from top edge to hole center
  bevelThickness: 0.022,
  bevelSize: 0.022,
  bevelSegments: 4,
};

// Exact original ZFITs SVG logo mark path from assets/logo-mark.svg
const Z_LOGO_SVG_PATH =
  'M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z';

/**
 * Creates the outer shape with signature chamfers, rounded corners,
 * and genuine through-hole cutout.
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

  // Genuine through-hole geometric cutout
  const hole = new THREE.Path();
  const holeY = hh - holeOffsetY;
  // Clockwise winding for cutout in Three.js
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
 * Generates the high-resolution front texture with PURE WHITE high-contrast ZFITs branding:
 * - Exact vector ZFITs emblem path rendered with Path2D
 * - Crisp bold typographic wordmark ZFITS.
 * - Tactile matte black cardstock surface
 */
export function createTagFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  // 1. Matte Luxury Obsidian Cardstock Base
  ctx.fillStyle = '#0f0f13';
  ctx.fillRect(0, 0, 1024, 2048);

  // 2. Micro-surface texture (tactile paperboard stippling)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.028)';
  for (let i = 0; i < 5000; i++) {
    const gx = Math.random() * 1024;
    const gy = Math.random() * 2048;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 3. Subtle debossed frame border matching chamfered silhouette
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, 904, 1928);

  // 4. Render the authentic original ZFITs SVG Logo in PURE BRILLIANT WHITE
  ctx.save();

  // Draw the SVG Mark using Path2D
  try {
    const path = new Path2D(Z_LOGO_SVG_PATH);
    ctx.save();
    // Center of canvas: 512, Y: 920. Scale from 48x46 viewBox to 240x230
    const scale = 5.2;
    ctx.translate(512 - (48 * scale) / 2, 850 - (46 * scale) / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.25)';
    ctx.shadowBlur = 12;
    ctx.fill(path);
    ctx.restore();
  } catch {
    // Fallback if Path2D not available
  }

  // Draw the original ZFITs bold wordmark beneath the mark
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
  ctx.shadowBlur = 10;
  ctx.font = '800 135px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Haas Regular", sans-serif';
  ctx.letterSpacing = '-2px';
  ctx.fillText('ZFITS.', 512, 1160);

  // Subtle luxury subtitle
  ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '12px';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.shadowBlur = 0;
  ctx.fillText('AI PERSONAL STYLIST', 512, 1270);

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
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#0f0f13';
  ctx.fillRect(0, 0, 1024, 2048);

  // Subtle tactile grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 4000; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 2048, 1.5, 1.5);
  }

  // Subtle rear authentication seal
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.font = '700 90px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('ZFITS STUDIO', 512, 1060);

  ctx.font = '500 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '14px';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.fillText('EDITION 01 // BESPOKE', 512, 1150);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
