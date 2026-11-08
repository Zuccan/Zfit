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
      {/* Luxury Studio Three-Point Lighting */}
      <ambientLight intensity={0.9} color="#ffffff" />

      {/* Key Light: High-angle directional light casting crisp shadows and highlights */}
      <directionalLight
        position={[3.5, 4.5, 3.5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-bias={-0.0001}
      />

      {/* Back / Rim Light: Cool tone grazing beveled chamfers and physical thickness */}
      <directionalLight
        position={[-3.5, 2.0, -2.5]}
        intensity={1.8}
        color="#edf2ff"
      />

      {/* Secondary Soft Bounce Fill Light */}
      <directionalLight
        position={[0, -3.0, 2.0]}
        intensity={0.35}
        color="#ffffff"
      />

      {/* Master GSAP Transition Group: Decoupled from physics spring group */}
      <group ref={masterGroupRef} position={[0, 0, 0]}>
        {/* Dynamic Zero-Allocation Braided Hanging String */}
        <TagString eyeletRef={eyeletAnchorRef} ceilingY={3.5} />

        {/* 3D Suspended Fashion Tag */}
        <HangingTag
          onPullTrigger={onPullTrigger}
          onTensionChange={onTensionChange}
          eyeletAnchorRef={eyeletAnchorRef}
          isInteractingRef={isInteractingRef}
        />
      </group>

      {/* Soft Contact Floor Shadow */}
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.55}
        scale={6.5}
        blur={2.2}
        far={3.5}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

/**
 * TagScene
 * R3F Canvas container with optimized WebGL settings, camera composition,
 * framing the fashion tag at dominant 70vh desktop screen presence.
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
      camera={{ position: [0, -0.05, 5.0], fov: 38 }}
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
