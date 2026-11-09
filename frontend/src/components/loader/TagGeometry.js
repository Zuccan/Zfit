import * as THREE from 'three';

/**
 * Tag Dimensions and Geometry Specification (V3):
 * - Refined clothing hang tag proportions: 42-48vh on desktop
 * - Width: 0.94, Height: 1.55 (Aspect ratio ~0.606)
 * - True extruded 3D cardstock thickness: depth 0.05 + bevels 0.012 -> visible 3D sidewalls
 * - Signature diagonal chamfers at Top-Left and Bottom-Right
 * - Subtly rounded Top-Right and Bottom-Left corners
 * - Tiny genuine circular punched hole (holeRadius: 0.032)
 */
export const TAG_DIMENSIONS = {
  width: 0.94,
  height: 1.55,
  depth: 0.05,
  cornerRadius: 0.08,
  chamfer: 0.22,
  holeRadius: 0.032,
  holeOffsetY: 0.16, // Distance from top edge to hole center
  bevelThickness: 0.012,
  bevelSize: 0.012,
  bevelSegments: 4,
};

// Exact original ZFITs SVG logo mark path from assets/logo-mark.svg
const Z_LOGO_SVG_PATH =
  'M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z';

/**
 * Creates the outer shape with signature chamfers, rounded corners,
 * and a tiny circular punched hole.
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

  // Tiny circular punched hole through the cardstock
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
 * Generates the high-resolution front texture:
 * - Premium warm ivory white paper base (#F3F1EB)
 * - Tactile luxury paper grain
 * - Exact original ZFITs SVG logo mark in bold dark charcoal (#111114)
 * - Original bold typographic wordmark ZFITS.
 * - No unapproved extra text
 */
export function createTagFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1688;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  // 1. Warm Ivory White Luxury Paper Base
  ctx.fillStyle = '#F3F1EB';
  ctx.fillRect(0, 0, 1024, 1688);

  // 2. Subtle luxury paper grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.022)';
  for (let i = 0; i < 4000; i++) {
    const gx = Math.random() * 1024;
    const gy = Math.random() * 1688;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 3. Subtle debossed frame border matching chamfered silhouette
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.055)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(52, 52, 920, 1584);

  // 4. Render the authentic original ZFITs SVG Logo in DARK CHARCOAL (#111114)
  ctx.save();

  try {
    const path = new Path2D(Z_LOGO_SVG_PATH);
    ctx.save();
    // Center at 512, Y: 720
    const scale = 4.8;
    ctx.translate(512 - (48 * scale) / 2, 700 - (46 * scale) / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#111114';
    ctx.fill(path);
    ctx.restore();
  } catch {
    // Fallback if Path2D is unavailable
  }

  // Draw the original ZFITs bold wordmark beneath the emblem
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#111114';
  ctx.font = '800 120px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Haas Regular", sans-serif';
  ctx.letterSpacing = '-2px';
  ctx.fillText('ZFITS.', 512, 1000);

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
  canvas.height = 1688;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#F3F1EB';
  ctx.fillRect(0, 0, 1024, 1688);

  // Subtle paper grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
  for (let i = 0; i < 3000; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 1688, 1.5, 1.5);
  }

  // Subtle rear typography
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  ctx.font = '700 80px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('ZFITS.', 512, 920);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
