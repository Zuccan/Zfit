import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HangingTag } from './HangingTag';
import { TagString } from './TagString';
import { UnifiedTagPhysics } from './UnifiedTagPhysics';
import { TAG_CONFIG } from './TagConfig';

/**
 * TagSceneContent
 * Luxury Studio Installation:
 * - Clean, uniform warm-white studio background (#F8F7F4)
 * - Wide-frustum transparent ShadowMaterial receiver (ZERO visible geometric planes or edge cutoff lines)
 * - Directional key light casting soft, realistic shadow
 * - Top ceiling bracket at (0, TAG_CONFIG.ceilingY, -0.020)
 * - Rich luxury black tag with pure crisp white branding
 * - Continuous single-body cream braided cotton cord
 */
function TagSceneContent({ onTriggerSlideDown, onPullProgress, onSceneReady }) {
  const tagGroupRef = useRef(null);

  // Ceiling Anchor Bracket Material (Dark matte architectural hardware)
  const bracketMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1A1A1D'),
      roughness: 0.35,
      metalness: 0.85,
    });
  }, []);

  const physics = useMemo(() => {
    return new UnifiedTagPhysics({
      pullThreshold: 0.18,
      onTriggerSlideDown: () => {
        if (onTriggerSlideDown) {
          onTriggerSlideDown();
        }
      },
    });
  }, [onTriggerSlideDown]);

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady();
    }
  }, [onSceneReady]);

  // Advance simulation on each animation frame
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Step fashion tag and rope physics
    const tagResult = physics.step(delta, time);

    if (onPullProgress) {
      onPullProgress({
        pullPixels: tagResult.pullPixels,
        currentPullY: tagResult.currentPullY,
        maxPullY: tagResult.maxPullY,
        pullProgress: tagResult.pullProgress,
        isTriggerReady: tagResult.isTriggerReady,
        isSnapped: tagResult.isSnapped,
        state: tagResult.state,
      });
    }
  });

  return (
    <>
      {/* Clean warm-white studio background */}
      <color attach="background" args={['#F8F7F4']} />

      {/* Transparent Shadow Receiver: Renders ONLY the tag's soft shadow with ZERO border lines */}
      <mesh position={[0, 0, -0.28]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>

      {/* Balanced Softbox Studio Ambient Light */}
      <ambientLight intensity={0.58} color="#FFFFFF" />

      {/* Primary Key Directional Light with generous shadow bounds to prevent any frustum edge line */}
      <directionalLight
        position={[1.5, 2.8, 2.2]}
        intensity={1.35}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={8.0}
        shadow-camera-left={-3.8}
        shadow-camera-right={3.8}
        shadow-camera-top={3.8}
        shadow-camera-bottom={-3.8}
        shadow-bias={-0.00005}
        shadow-normalBias={0.01}
        shadow-radius={2.5}
      />

      {/* Subtle Edge & Rim Kicker Light for crisp silhouette definition */}
      <directionalLight
        position={[-2.8, 1.8, -1.2]}
        intensity={0.42}
        color="#F2F5FF"
      />

      {/* Gentle Upward Warm Fill Bounce */}
      <directionalLight
        position={[-0.8, -1.8, 1.2]}
        intensity={0.18}
        color="#FFF8F2"
      />

      {/* Top Ceiling Attachment Hardware */}
      <group position={[0, TAG_CONFIG.ceilingY, -0.020]}>
        <mesh castShadow material={bracketMaterial}>
          <boxGeometry args={[0.16, 0.035, 0.12]} />
        </mesh>
        <mesh position={[0, -0.022, 0]} castShadow material={bracketMaterial}>
          <cylinderGeometry args={[0.018, 0.018, 0.025, 16]} />
        </mesh>
      </group>

      {/* Interactive Hanging Fashion Tag Installation */}
      <group ref={tagGroupRef} position={[0, 0, 0]}>
        <TagString physics={physics} />
        <HangingTag physics={physics} />
      </group>
    </>
  );
}

/**
 * TagScene
 * R3F Canvas container calibrated for studio cinematography and physical breakaway.
 */
export function TagScene({ onTriggerSlideDown, onPullProgress, onSceneReady }) {
  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={[1, 2]}
      camera={{ position: [0, 0.28, 4.3], fov: 34 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    >
      <TagSceneContent
        onTriggerSlideDown={onTriggerSlideDown}
        onPullProgress={onPullProgress}
        onSceneReady={onSceneReady}
      />
    </Canvas>
  );
}
