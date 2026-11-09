import React, { useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { RollingShutter } from './RollingShutter';
import { HangingTag } from './HangingTag';
import { TagString } from './TagString';
import { UnifiedTagPhysics } from './UnifiedTagPhysics';

/**
 * TagSceneContent (V9)
 * Houses the physical trigger + retail rolling shutter:
 * - Full-viewport-width luxury architectural rolling shutter with 38 horizontal interlocking slats
 * - Concealed top roller housing and cylindrical drum
 * - Ultra-thin black ZFITs fashion tag hanging from braided cotton cord in front of the shutter
 * - Natural 360° unconstrained rotation and Verlet rope physics
 * - Downward pull triggers the shutter mechanism to roll upward into the top housing
 */
function TagSceneContent({
  rollProgress = 0,
  onTriggerShutter,
  onPullProgress,
  onTensionChange,
  onSceneReady,
  tagOpacity = 1,
}) {
  const physics = useMemo(() => {
    return new UnifiedTagPhysics({
      pullThreshold: 0.40,
      onTriggerShutter,
    });
  }, [onTriggerShutter]);

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady();
    }
  }, [onSceneReady]);

  // Pass upward retraction to physics if shutter is opening
  useEffect(() => {
    if (rollProgress > 0) {
      // Retract tag slightly upwards alongside the lifting shutter
      physics.setRetractProgress(rollProgress * 0.45);
    }
  }, [rollProgress, physics]);

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
      <ambientLight intensity={0.78} color="#ffffff" />

      {/* Primary Key Directional Light: Casts crisp realistic directional shadows onto shutter slats */}
      <directionalLight
        position={[2.4, 4.2, 3.2]}
        intensity={1.9}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-bias={-0.00015}
      />

      {/* Edge & Rim Light: Grazes beveled paper edges and cotton cord */}
      <directionalLight
        position={[-3.2, 2.4, -1.8]}
        intensity={1.25}
        color="#edf2ff"
      />

      {/* Gentle Upward Warm Fill Bounce */}
      <directionalLight
        position={[-1.0, -1.8, 1.8]}
        intensity={0.35}
        color="#fff8f2"
      />

      {/* 1. Industrial Architectural Rolling Shutter */}
      <RollingShutter rollProgress={rollProgress} />

      {/* 2. Interactive Hanging Fashion Tag Installation */}
      <group position={[0, 0, 0]} visible={tagOpacity > 0.01}>
        {/* Dynamic Braided Cotton Rope */}
        <TagString physics={physics} onPullTrigger={() => physics.triggerShutter()} />

        {/* Ultra-Thin Fashion Tag */}
        <HangingTag physics={physics} onPullTrigger={() => physics.triggerShutter()} />
      </group>

      {/* Floor contact shadow beneath the installation */}
      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.20}
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
 * R3F Canvas container calibrated for studio cinematography and rolling shutter reveal.
 */
export function TagScene({
  rollProgress = 0,
  onTriggerShutter,
  onPullProgress,
  onTensionChange,
  onSceneReady,
  tagOpacity = 1,
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
        rollProgress={rollProgress}
        onTriggerShutter={onTriggerShutter}
        onPullProgress={onPullProgress}
        onTensionChange={onTensionChange}
        onSceneReady={onSceneReady}
        tagOpacity={tagOpacity}
      />
    </Canvas>
  );
}
