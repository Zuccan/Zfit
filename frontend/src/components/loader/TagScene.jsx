import React, { useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { HangingTag } from './HangingTag';
import { TagString } from './TagString';
import { UnifiedTagPhysics } from './UnifiedTagPhysics';

/**
 * TagSceneContent
 * Houses the unified coupled 3D physics, studio lighting, and backdrop shadow projection.
 */
function TagSceneContent({
  onPullTrigger,
  onPullProgress,
  onTensionChange,
  masterGroupRef,
  onSceneReady,
}) {
  // Single unified physics engine coordinating both rope particles and tag rigid-body
  const physics = useMemo(() => new UnifiedTagPhysics({ ceilingY: 2.15, pullThreshold: 0.40 }), []);

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady();
    }
  }, [onSceneReady]);

  // Advance simulation on each animation frame
  useFrame((state, delta) => {
    const result = physics.step(delta, state.clock.getElapsedTime());
    if (onTensionChange) {
      onTensionChange(result.isTensionHigh);
    }
    if (onPullProgress) {
      onPullProgress({
        pullPixels: result.pullPixels,
        screenDx: result.screenDx,
        pullProgress: result.pullProgress,
        isTriggerReady: result.isTriggerReady,
        isDraggingCard: physics.dragTarget === 'CARD',
      });
    }
  });

  return (
    <>
      {/* Balanced Studio Lighting calibrated for black cardstock */}
      <ambientLight intensity={0.70} color="#ffffff" />

      {/* Primary Key Directional Light: Casts crisp directional shadow onto backdrop */}
      <directionalLight
        position={[2.4, 3.8, 3.0]}
        intensity={1.85}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.00015}
      />

      {/* Edge & Rim Light: Grazes beveled corners and cord for crisp profile */}
      <directionalLight
        position={[-2.8, 2.0, -2.2]}
        intensity={1.25}
        color="#edf2ff"
      />

      {/* Gentle Upward Warm Fill Bounce */}
      <directionalLight
        position={[-1.0, -1.8, 1.8]}
        intensity={0.35}
        color="#fff8f2"
      />

      {/* Master Group: Decouples GSAP entry/exit transitions from inner physics */}
      <group ref={masterGroupRef} position={[0, 0, 0]}>
        {/* Dynamic Braided Cotton Suspension Rope */}
        <TagString physics={physics} onPullTrigger={onPullTrigger} />

        {/* 3D Hanging Fashion Tag */}
        <HangingTag physics={physics} onPullTrigger={onPullTrigger} />
      </group>

      {/* Directional Backdrop Shadow Wall */}
      <mesh position={[0, 0.45, -0.65]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial opacity={0.16} />
      </mesh>

      {/* Delicate Contact Floor Shadow beneath the hanging object */}
      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.24}
        scale={4.0}
        blur={2.4}
        far={2.2}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

/**
 * TagScene
 * R3F Canvas container calibrated for 38-44vh desktop presence,
 * balanced portrait aspect ratio, and studio cinematography.
 */
export function TagScene({
  onPullTrigger,
  onPullProgress,
  onTensionChange,
  masterGroupRef,
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
        onPullTrigger={onPullTrigger}
        onPullProgress={onPullProgress}
        onTensionChange={onTensionChange}
        masterGroupRef={masterGroupRef}
        onSceneReady={onSceneReady}
      />
    </Canvas>
  );
}
