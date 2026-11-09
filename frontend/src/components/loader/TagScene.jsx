import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FabricMesh } from './FabricMesh';
import { HangingTag } from './HangingTag';
import { TagString } from './TagString';
import { UnifiedTagPhysics } from './UnifiedTagPhysics';
import { BreakFibers } from './BreakFibers';

/**
 * TagSceneContent (V12)
 * Physical Breakaway Installation + Realistic Fabric Release:
 * - Ultra-thin black ZFITs fashion tag suspended in the optical center
 * - Upper attachment anchor at (0, 1.85, 0)
 * - Downward pull builds tension; excessive tension physically snaps the upper anchor
 * - String detaches, recoils, and plummets with the tag under gravity
 * - Spawns thread-fraying fiber particles at the snap point
 * - Triggers immediate silk fabric release from above the scene
 */
function TagSceneContent({
  clothPhysics,
  onBreakaway,
  onPullProgress,
  onClothProgress,
  onSceneReady,
}) {
  const tagGroupRef = useRef(null);
  const [breakEvent, setBreakEvent] = useState(null);

  // Ceiling Anchor Bracket Material
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
      onBreakaway: (event) => {
        setBreakEvent(event);
        clothPhysics.release();
        if (onBreakaway) {
          onBreakaway(event);
        }
      },
    });
  }, [clothPhysics, onBreakaway]);

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady();
    }
  }, [onSceneReady]);

  // Advance simulation on each animation frame
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Step cloth simulation
    const clothResult = clothPhysics.step(delta, time);
    if (onClothProgress) {
      onClothProgress(clothResult);
    }

    // 2. Step fashion tag physics
    const tagResult = physics.step(delta, time);

    if (onPullProgress) {
      onPullProgress({
        pullPixels: tagResult.pullPixels,
        currentPullY: tagResult.currentPullY,
        maxPullY: tagResult.maxPullY,
        pullProgress: tagResult.pullProgress,
        isTriggerReady: tagResult.isTriggerReady,
        isDetached: tagResult.isDetached,
        state: tagResult.state,
      });
    }
  });

  return (
    <>
      {/* Balanced Softbox Studio Lighting */}
      <ambientLight intensity={0.92} color="#FFFFFF" />

      {/* Primary Key Directional Light */}
      <directionalLight
        position={[2.5, 4.5, 3.5]}
        intensity={1.85}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.00015}
      />

      {/* Edge & Rim Light */}
      <directionalLight
        position={[-3.2, 2.6, -2.0]}
        intensity={1.15}
        color="#F0F4FF"
      />

      {/* Gentle Upward Warm Fill Bounce */}
      <directionalLight
        position={[-1.0, -1.8, 1.8]}
        intensity={0.32}
        color="#FFF8F2"
      />

      {/* 1. Suspended Luxury Silk Fabric (Poised above viewport) */}
      <FabricMesh clothPhysics={clothPhysics} />

      {/* 2. Top Ceiling Attachment Hardware (The exact suspension anchor) */}
      <group position={[0, 1.85, 0]}>
        <mesh castShadow material={bracketMaterial}>
          <boxGeometry args={[0.16, 0.035, 0.12]} />
        </mesh>
        <mesh position={[0, -0.022, 0]} castShadow material={bracketMaterial}>
          <cylinderGeometry args={[0.018, 0.018, 0.025, 16]} />
        </mesh>
      </group>

      {/* 3. Thread-fraying fiber particles spawned at the exact upper connection upon break */}
      <BreakFibers breakEvent={breakEvent} />

      {/* 4. Interactive Hanging Fashion Tag Installation */}
      <group ref={tagGroupRef} position={[0, 0, 0]}>
        <TagString physics={physics} onPullTrigger={() => physics.triggerBreakaway()} />
        <HangingTag physics={physics} onPullTrigger={() => physics.triggerBreakaway()} />
      </group>
    </>
  );
}

/**
 * TagScene
 * R3F Canvas container calibrated for studio cinematography and physical breakaway.
 */
export function TagScene({
  clothPhysics,
  onBreakaway,
  onPullProgress,
  onClothProgress,
  onSceneReady,
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.45, 4.4], fov: 34 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    >
      <TagSceneContent
        clothPhysics={clothPhysics}
        onBreakaway={onBreakaway}
        onPullProgress={onPullProgress}
        onClothProgress={onClothProgress}
        onSceneReady={onSceneReady}
      />
    </Canvas>
  );
}
