import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SLAT_COUNT = 38;
const SLAT_WIDTH = 9.4;
const SLAT_HEIGHT = 0.078;
const SLAT_DEPTH = 0.016;
const SLAT_PITCH = 0.082; // Distance between adjacent slat centers
const Y_BOTTOM = -1.35;    // Rest position of lowest slat
const Y_DRUM = 1.74;       // Vertical center of the top roller drum
const Z_SHUTTER = -0.22;   // Flat plane depth of the shutter curtain
const R_DRUM = 0.145;      // Radius of the top cylindrical roller drum
const TOTAL_LIFT = (Y_DRUM - Y_BOTTOM) + 0.38; // Distance needed to roll all slats into housing

/**
 * RollingShutter (V9)
 * Full-viewport-width luxury architectural retail rolling shutter:
 * - 38 horizontal interlocking slats with physical depth and beveled edges
 * - Concealed top roller housing with horizontal cylindrical drum
 * - Left and right vertical guide tracks
 * - Slats travel UPWARD and curl into the top roller drum via exact cylindrical coiling
 * - Controlled highlights and shadows for an authentic retail boutique feel
 */
export function RollingShutter({ rollProgress = 0, onShutterProgress = null }) {
  const instancedMeshRef = useRef(null);
  const drumMeshRef = useRef(null);

  // Scratch objects for zero-allocation per-frame matrix computation
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Architectural Warm Ivory Powder-Coat Material
  const slatMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#EAE5DB'),
      roughness: 0.36,
      metalness: 0.14,
      clearcoat: 0.12,
      clearcoatRoughness: 0.28,
      reflectivity: 0.5,
    });
  }, []);

  // Housing Box Material (Slightly deeper warm architectural grey/ivory)
  const housingMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#E0DBD0'),
      roughness: 0.40,
      metalness: 0.18,
      clearcoat: 0.10,
    });
  }, []);

  // Internal Cylinder Drum Material (Darkened graphite steel)
  const drumMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#222226'),
      roughness: 0.55,
      metalness: 0.65,
    });
  }, []);

  // Brass/Gunmetal Tag Attachment Bracket Material
  const bracketMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F1F22'),
      roughness: 0.35,
      metalness: 0.80,
    });
  }, []);

  // Slat Geometry: Chamfered horizontal slat with authentic cross-section
  const slatGeometry = useMemo(() => {
    return new THREE.BoxGeometry(SLAT_WIDTH, SLAT_HEIGHT, SLAT_DEPTH);
  }, []);

  // Per-frame computation of slat positions along the vertical track and roller drum
  useFrame(() => {
    if (!instancedMeshRef.current) return;

    // Current lift displacement driven by progress parameter (0 fully closed to 1 fully open)
    const liftDistance = rollProgress * TOTAL_LIFT;

    // Rotate internal roller drum in sync with the slats rolling in
    if (drumMeshRef.current) {
      drumMeshRef.current.rotation.x = -(liftDistance / R_DRUM);
    }

    for (let i = 0; i < SLAT_COUNT; i++) {
      // Base resting Y position of slat i (0 is bottom, 37 is top)
      const restY = Y_BOTTOM + i * SLAT_PITCH;
      const targetY = restY + liftDistance;

      if (targetY < Y_DRUM) {
        // --- 1. Slat is sliding vertically upward in the side guide tracks ---
        dummy.position.set(0, targetY, Z_SHUTTER);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
      } else {
        // --- 2. Slat has reached the roller drum: Cylindrical Coiling Trajectory ---
        const arcLength = targetY - Y_DRUM;
        const theta = arcLength / R_DRUM;

        // Inward radial coiling offset as the shutter wraps around itself inside the housing
        const coilShrink = 0.022 * (theta / (Math.PI * 2));
        const effectiveR = Math.max(0.04, R_DRUM - coilShrink);

        // Curvature around the drum:
        // theta = 0 is bottom entrance (tangent to vertical track)
        // theta = PI/2 is back of drum
        // theta = PI is top of drum
        // theta = 3*PI/2 is front of drum
        const coiledZ = Z_SHUTTER - effectiveR * (1 - Math.cos(theta));
        const coiledY = Y_DRUM + effectiveR * Math.sin(theta);

        dummy.position.set(0, coiledY, coiledZ);
        dummy.rotation.set(-theta, 0, 0);

        // As slats wrap deep into the housing, scale down slightly to stay tightly enclosed
        const fadeScale = theta > Math.PI * 2.5 ? Math.max(0.01, 1.0 - (theta - Math.PI * 2.5) * 0.15) : 1.0;
        dummy.scale.set(1, fadeScale, fadeScale);
      }

      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;

    // Report bottom slat Y position for seamless clipping if needed
    if (onShutterProgress) {
      const bottomEdgeY = Y_BOTTOM + liftDistance;
      onShutterProgress({
        rollProgress,
        bottomEdgeY,
        isOpen: rollProgress >= 0.99,
      });
    }
  });

  return (
    <group name="ZfitsRollingShutter">
      {/* 1. Multi-Slat Instanced Mesh (38 horizontal interlocking slats) */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[slatGeometry, slatMaterial, SLAT_COUNT]}
        castShadow
        receiveShadow
      />

      {/* 2. Top Concealed Roller Housing Casing */}
      <group position={[0, 1.92, -0.30]}>
        {/* Main Architectural Fascia Hood */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow material={housingMaterial}>
          <boxGeometry args={[9.6, 0.44, 0.46]} />
        </mesh>

        {/* Lower Trim Bevel / Entrance Throat Lip */}
        <mesh position={[0, -0.22, 0.16]} castShadow material={housingMaterial}>
          <boxGeometry args={[9.62, 0.05, 0.12]} />
        </mesh>

        {/* Shutter Entry Slot (Darkened recess where slats roll in) */}
        <mesh position={[0, -0.22, 0.02]} material={drumMaterial}>
          <boxGeometry args={[9.44, 0.04, 0.10]} />
        </mesh>

        {/* Left End-Plate Cap */}
        <mesh position={[-4.81, 0, 0]} material={housingMaterial}>
          <boxGeometry args={[0.04, 0.45, 0.47]} />
        </mesh>

        {/* Right End-Plate Cap */}
        <mesh position={[4.81, 0, 0]} material={housingMaterial}>
          <boxGeometry args={[0.04, 0.45, 0.47]} />
        </mesh>

        {/* Internal Cylindrical Shaft / Roller Drum */}
        <mesh
          ref={drumMeshRef}
          position={[0, -0.18, -0.02]}
          rotation={[0, 0, Math.PI / 2]}
          material={drumMaterial}
        >
          <cylinderGeometry args={[R_DRUM, R_DRUM, 9.38, 32]} />
        </mesh>
      </group>

      {/* 3. Left & Right Architectural Guide Tracks (Vertical side channels) */}
      <mesh position={[-4.65, 0.15, -0.20]} castShadow receiveShadow material={housingMaterial}>
        <boxGeometry args={[0.12, 3.1, 0.08]} />
      </mesh>
      <mesh position={[4.65, 0.15, -0.20]} castShadow receiveShadow material={housingMaterial}>
        <boxGeometry args={[0.12, 3.1, 0.08]} />
      </mesh>

      {/* 4. Center Tag Suspension Bracket (Machined gunmetal hardware on housing underside) */}
      <group position={[0, 1.66, -0.05]}>
        <mesh castShadow material={bracketMaterial}>
          <boxGeometry args={[0.16, 0.035, 0.12]} />
        </mesh>
        {/* Subtle circular eyelet/stud where Node 0 of the cotton rope attaches */}
        <mesh position={[0, -0.022, 0]} castShadow material={bracketMaterial}>
          <cylinderGeometry args={[0.018, 0.018, 0.025, 16]} />
        </mesh>
      </group>
    </group>
  );
}
