import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Creates high-resolution canvas texture for the full-width ivory header panel
 */
function createHeaderTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cw = canvas.width;
  const ch = canvas.height;

  // 1. Warm ivory luxury paperboard base
  ctx.fillStyle = '#FAF9F5';
  ctx.fillRect(0, 0, cw, ch);

  // 2. Fine tactile paper grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
  for (let i = 0; i < 4000; i++) {
    const gx = Math.random() * cw;
    const gy = Math.random() * ch;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 3. Subtle bottom edge shadow seam
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, ch - 2);
  ctx.lineTo(cw, ch - 2);
  ctx.stroke();

  // 4. Brand Typography on Left Side
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // "ZFITS" Title
  ctx.font = '700 68px "Cinzel", "Playfair Display", serif';
  ctx.fillStyle = '#121214';
  ctx.letterSpacing = '14px';
  ctx.fillText('ZFITS', 160, ch * 0.52);

  // Measure ZFITS width for subtext offset
  const titleMetrics = ctx.measureText('ZFITS');
  const subX = 160 + titleMetrics.width + 36;

  // "/ AI PERSONAL STYLIST" Subtext
  ctx.font = '500 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#78756E';
  ctx.letterSpacing = '6px';
  ctx.fillText('/  AI PERSONAL STYLIST', subX, ch * 0.52);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * HeaderPanel (V8)
 * Rigid, full-width physical ivory header panel suspended in the 3D scene.
 * The suspension string originates directly from the attachment bracket on its underside.
 * Releases and falls under true gravity upon breakaway pull.
 */
export function HeaderPanel({ physics }) {
  const panelRef = useRef(null);

  const headerTexture = useMemo(() => createHeaderTexture(), []);

  // Panel physical material
  const panelMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: headerTexture,
      roughness: 0.62,
      metalness: 0.02,
      clearcoat: 0.12,
      clearcoatRoughness: 0.28,
      reflectivity: 0.45,
    });
  }, [headerTexture]);

  // Dark gunmetal underside anchor bracket material
  const bracketMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1A1A1E',
      roughness: 0.45,
      metalness: 0.85,
    });
  }, []);

  // Update transform each frame from physics simulation
  useFrame(() => {
    if (!panelRef.current) return;

    panelRef.current.position.set(
      physics.headerPos.x,
      physics.headerPos.y,
      physics.headerPos.z
    );

    panelRef.current.rotation.set(
      physics.headerRot.x,
      physics.headerRot.y,
      physics.headerRot.z
    );
  });

  return (
    <group ref={panelRef} position={[0, physics.initialHeaderY, 0]}>
      {/* Main Full-Width Solid Ivory Header Panel */}
      <mesh
        castShadow
        receiveShadow
        material={panelMaterial}
      >
        <boxGeometry args={[7.0, physics.headerHeight, physics.headerDepth]} />
      </mesh>

      {/* Underside Attachment Bracket where the rope originates */}
      <mesh
        position={[0, -physics.headerHeight / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        material={bracketMaterial}
        castShadow
      >
        <torusGeometry args={[0.016, 0.005, 8, 20]} />
      </mesh>
    </group>
  );
}
