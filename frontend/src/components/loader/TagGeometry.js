import * as THREE from 'three';

/**
 * Tag Dimensions and Geometry Specification:
 * Scaled proportionally to match luxury hanging fashion tag references.
 * Height 2.8, Width 1.4 (Aspect ratio 1:2)
 */
export const TAG_DIMENSIONS = {
  width: 1.4,
  height: 2.8,
  depth: 0.05,
  cornerRadius: 0.10,
  chamfer: 0.28,
  holeRadius: 0.08,
  holeOffsetY: 0.30, // Distance from top edge to hole center
  bevelThickness: 0.015,
  bevelSize: 0.015,
  bevelSegments: 3,
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

  // Center geometry along Z axis
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
 * Generates the high-resolution front texture preserving the original ZFITs logo mark
 * without distortion or extra text.
 */
export function createTagFrontTexture(logoImage = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  // 1. Matte Luxury Obsidian Base
  ctx.fillStyle = '#0f0f12';
  ctx.fillRect(0, 0, 1024, 2048);

  // 2. Subtle luxury cardstock grain (fast noise)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 4000; i++) {
    const gx = Math.random() * 1024;
    const gy = Math.random() * 2048;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 3. Subtle debossed frame border matching chamfered silhouette
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, 904, 1928);

  // 4. Draw the authentic original ZFITs Logo
  if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
    const logoW = 580;
    const aspect = logoImage.naturalHeight / logoImage.naturalWidth;
    const logoH = logoW * aspect;
    const logoX = (1024 - logoW) / 2;
    const logoY = 1024 - logoH / 2 + 120; // Centered vertically below eyelet zone

    ctx.save();
    ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);
    ctx.restore();
  } else {
    // Clean typographic logo fallback
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 130px "Haas Regular", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '-3px';
    ctx.fillText('ZFITS.', 512, 1080);
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
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#0f0f12';
  ctx.fillRect(0, 0, 1024, 2048);

  // Subtle rear watermark
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.font = '700 80px "Haas Regular", system-ui, sans-serif';
  ctx.fillText('ZFITS.', 512, 1080);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
