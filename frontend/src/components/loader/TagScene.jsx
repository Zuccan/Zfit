import React, { useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { HeaderPanel } from './HeaderPanel';
import { HangingTag } from './HangingTag';
import { TagString } from './TagString';
import { UnifiedTagPhysics } from './UnifiedTagPhysics';

/**
 * TagSceneContent (V8)
 * Houses the physically connected installation:
 * - 3D Full-Width Ivory Header Panel at the top
 * - Black braided cotton rope originating from the underside bracket
 * - Ultra-thin black ZFITs fashion tag hanging from the rope
 * - Real directional shadow casting from all physical bodies onto backdrop
 */
function TagSceneContent({
  onAssemblyExit,
  onPullProgress,
  onTensionChange,
  onSceneReady,
}) {
  // Single unified physics engine coordinating header rigid-body, rope particles, and tag
  const physics = useMemo(() => {
    return new UnifiedTagPhysics({
      pullThreshold: 0.40,
      onAssemblyExit,
    });
  }, [onAssemblyExit]);

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
      {/* Balanced Softbox Studio Lighting */}
      <ambientLight intensity={0.72} color="#ffffff" />

      {/* Primary Key Directional Light: Casts soft realistic directional shadows onto backdrop */}
      <directionalLight
        position={[2.4, 4.0, 3.2]}
        intensity={1.85}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-bias={-0.00015}
      />

      {/* Edge & Rim Light: Grazes beveled paper edges and cotton cord */}
      <directionalLight
        position={[-3.0, 2.2, -2.2]}
        intensity={1.25}
        color="#edf2ff"
      />

      {/* Gentle Upward Warm Fill Bounce */}
      <directionalLight
        position={[-1.0, -1.8, 1.8]}
        intensity={0.35}
        color="#fff8f2"
      />

      {/* --- THE CONNECTED 3D PHYSICAL INSTALLATION --- */}
      <group position={[0, 0, 0]}>
        {/* 1. Full-Width Solid Ivory Header Panel */}
        <HeaderPanel physics={physics} />

        {/* 2. Dynamic Braided Cotton Rope (Originates directly from header's underside bracket) */}
        <TagString physics={physics} onPullTrigger={() => physics.triggerBreakaway()} />

        {/* 3. Ultra-Thin Fashion Tag (Hangs physically from lower end of rope) */}
        <HangingTag physics={physics} onPullTrigger={() => physics.triggerBreakaway()} />
      </group>

      {/* Studio Backdrop Wall receiving moving directional shadows from header, rope & tag */}
      <mesh position={[0, 0.45, -0.65]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <shadowMaterial opacity={0.16} />
      </mesh>

      {/* Subtle floor contact shadow beneath the installation */}
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
  onAssemblyExit,
  onPullProgress,
  onTensionChange,
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
        onAssemblyExit={onAssemblyExit}
        onPullProgress={onPullProgress}
        onTensionChange={onTensionChange}
        onSceneReady={onSceneReady}
      />
    </Canvas>
  );
}
