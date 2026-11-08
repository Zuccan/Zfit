import * as THREE from 'three';

/**
 * Tag Dimensions and Geometry Specification:
 * - Width: 2.3
 * - Height: 4.6
 * - Top-Left: Diagonal chamfer
 * - Bottom-Right: Diagonal chamfer
 * - Top-Right & Bottom-Left: Subtly rounded corners
 * - Hanging hole: Genuine geometric cutout using THREE.Shape.holes and THREE.Path
 */
export const TAG_DIMENSIONS = {
  width: 2.3,
  height: 4.6,
  depth: 0.08,
  cornerRadius: 0.18,
  chamfer: 0.48,
  holeRadius: 0.14,
  holeOffsetY: 0.52, // Distance from top edge to hole center
  bevelThickness: 0.02,
  bevelSize: 0.02,
  bevelSegments: 4,
};

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
  // Clockwise winding for hole cutout in Three.js
  hole.absarc(0, holeY, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return { shape, holeY };
}

/**
 * Creates the extruded tag geometry with beveled physical edges.
 */
export function createTagGeometry() {
  const { shape, holeY } = createTagShape();
  const { depth, bevelThickness, bevelSize, bevelSegments } = TAG_DIMENSIONS;

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
  geometry.computeVertexNormals();

  return { geometry, holeY };
}

/**
 * Generates the high-resolution front texture preserving the original ZFITs logo mark
 * and brand geometry without extraneous text.
 */
export function createTagFrontTexture(logoImage = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  // 1. Matte Luxury Obsidian Base
  ctx.fillStyle = '#0c0c0e';
  ctx.fillRect(0, 0, 2048, 2048);

  // 2. Micro-surface texture (luxury paper/cardstock tactile stippling)
  const imgData = ctx.getImageData(0, 0, 2048, 2048);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 8;
    data[i] = Math.max(0, Math.min(255, data[i] + grain));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain + 2));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Subtle debossed frame border matching chamfered silhouette
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 4;
  ctx.strokeRect(120, 120, 1808, 1808);

  // 4. Draw the authentic original ZFITs Logo
  if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
    const logoW = 760;
    const aspect = logoImage.naturalHeight / logoImage.naturalWidth;
    const logoH = logoW * aspect;
    const logoX = (2048 - logoW) / 2;
    const logoY = 1024 - logoH / 2 + 100; // Centered vertically below eyelet zone

    // Draw white logo mark
    ctx.save();
    ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);
    ctx.restore();
  } else {
    // Elegant fallback rendering authentic ZFITs typographic logo
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 160px "Haas Regular", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '-4px';
    ctx.fillText('ZFITS.', 1024, 1060);
    ctx.restore();
  }

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
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#0c0c0e';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle rear watermark
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.font = '700 80px "Haas Regular", system-ui, sans-serif';
  ctx.fillText('ZFITS.', 512, 512);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
