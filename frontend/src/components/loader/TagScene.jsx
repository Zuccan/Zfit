import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { HangingTag } from './HangingTag';
import { TagString } from './TagString';

/**
 * TagSceneContent
 * Houses the 3D scene elements, studio lighting, and dynamic hanging tag.
 */
function TagSceneContent({
  onPullTrigger,
  onTensionChange,
  masterGroupRef,
  onSceneReady,
}) {
  const eyeletAnchorRef = useRef(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady();
    }
  }, [onSceneReady]);

  return (
    <>
      {/* Luxury Studio Lighting Setup */}
      <ambientLight intensity={0.95} color="#ffffff" />

      {/* Key Light: High-angle directional light casting crisp shadows and highlights */}
      <directionalLight
        position={[3.5, 4.5, 3.5]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-bias={-0.0001}
      />

      {/* Back / Rim Light: Grazing beveled chamfers and paperboard sidewall thickness */}
      <directionalLight
        position={[-3.5, 2.0, -2.5]}
        intensity={1.6}
        color="#edf2ff"
      />

      {/* Secondary Soft Bounce Fill Light */}
      <directionalLight
        position={[0, -3.0, 2.0]}
        intensity={0.4}
        color="#ffffff"
      />

      {/* Master GSAP Transition Group: Decoupled from physics spring group */}
      <group ref={masterGroupRef} position={[0, 0, 0]}>
        {/* Dynamic Zero-Allocation Braided Hanging String */}
        <TagString eyeletRef={eyeletAnchorRef} ceilingY={3.2} />

        {/* 3D Suspended Fashion Tag */}
        <HangingTag
          onPullTrigger={onPullTrigger}
          onTensionChange={onTensionChange}
          eyeletAnchorRef={eyeletAnchorRef}
          isInteractingRef={isInteractingRef}
        />
      </group>

      {/* Soft Contact Floor Shadow beneath the hanging tag */}
      <ContactShadows
        position={[0, -1.65, 0]}
        opacity={0.5}
        scale={6.0}
        blur={2.0}
        far={3.0}
        resolution={512}
        color="#1a1815"
      />
    </>
  );
}

/**
 * TagScene
 * R3F Canvas container calibrated for 55-65vh desktop card presence,
 * balanced aspect ratio, and studio illumination.
 */
export function TagScene({
  onPullTrigger,
  onTensionChange,
  masterGroupRef,
  onSceneReady,
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, -0.05, 5.2], fov: 36 }}
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
        onTensionChange={onTensionChange}
        masterGroupRef={masterGroupRef}
        onSceneReady={onSceneReady}
      />
    </Canvas>
  );
}
