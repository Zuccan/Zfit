import * as THREE from 'three';

/**
 * Tag Dimensions and Geometry Specification (V5):
 * - Slim, narrow portrait aspect ratio: width ~50% of height (0.70 : 1.38)
 * - Desktop presence: 38-44vh
 * - Realistic pressed paperboard thickness: ~1.5-2mm (depth 0.024, bevel 0.006)
 * - Top-left and bottom-right diagonal chamfers
 * - Top-right and bottom-left rounded corners
 * - Tiny genuine circular punched hole through the cardstock (holeRadius: 0.024)
 */
export const TAG_DIMENSIONS = {
  width: 0.70,
  height: 1.38,
  depth: 0.024,
  cornerRadius: 0.05,
  chamfer: 0.16,
  holeRadius: 0.024,
  holeOffsetY: 0.11, // Distance from top edge to hole center
  bevelThickness: 0.006,
  bevelSize: 0.006,
  bevelSegments: 3,
};

// Exact original ZFITs SVG logo mark path from assets/logo-mark.svg
const Z_LOGO_SVG_PATH =
  'M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z';

/**
 * Creates the outer shape with signature chamfers, rounded corners,
 * and a tiny circular punched hole cutout.
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
  // Clockwise winding for genuine geometric cutout in Three.js ExtrudeGeometry
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
 * Helper to render the authentic ZFITs branding on a high-res canvas
 */
function renderBrandCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const cw = canvas.width;
  const ch = canvas.height;

  // 1. Warm Ivory White Luxury Paper Base (#F5F3EC)
  ctx.fillStyle = '#F5F3EC';
  ctx.fillRect(0, 0, cw, ch);

  // 2. Subtle luxury paper tactile grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.024)';
  for (let i = 0; i < 5000; i++) {
    const gx = Math.random() * cw;
    const gy = Math.random() * ch;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 3. Subtle debossed frame border matching tag proportions
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, cw - 96, ch - 96);

  // 4. Render the authentic original ZFITs SVG Logo in DARK CHARCOAL (#111114)
  ctx.save();

  try {
    const path = new Path2D(Z_LOGO_SVG_PATH);
    const scale = 5.6;
    ctx.translate(cw / 2 - (48 * scale) / 2, ch * 0.44 - (46 * scale) / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#111114';
    ctx.fill(path);
  } catch {
    // Canvas fallback if Path2D is unsupported
  }
  ctx.restore();

  // 5. Draw the original ZFITs bold wordmark beneath the emblem
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#111114';
  ctx.font = '800 114px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Haas Regular", sans-serif';
  ctx.letterSpacing = '-2px';
  ctx.fillText('ZFITS.', cw / 2, ch * 0.62);

  // Subtle luxury subtext
  ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(17, 17, 20, 0.55)';
  ctx.letterSpacing = '8px';
  ctx.fillText('STUDIO', cw / 2, ch * 0.70);
  ctx.restore();
}

/**
 * Generates the high-resolution front texture
 */
export function createTagFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  renderBrandCanvas(canvas);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates the high-resolution back texture with MATCHING VISUAL QUALITY:
 * - Identical ivory paper material
 * - Identical authentic ZFITs branding (readable and NOT mirrored)
 * - Matching debossed border and surface grain
 */
export function createTagBackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  renderBrandCanvas(canvas);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
