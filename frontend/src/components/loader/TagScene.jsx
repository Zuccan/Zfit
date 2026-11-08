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
      <ambientLight intensity={0.85} color="#ffffff" />

      {/* Key Light: Casts crisp directional light highlighting beveled chamfers */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-bias={-0.0001}
      />

      {/* Rim / Back Light: Accentuates silhouetted edges and cardstock bevels */}
      <directionalLight
        position={[-3, 2, -3]}
        intensity={1.2}
        color="#e6ecff"
      />

      {/* Secondary Soft Bounce Light */}
      <directionalLight
        position={[0, -3, 2]}
        intensity={0.4}
        color="#ffffff"
      />

      {/* Master GSAP Transition Group: Decoupled from physics spring group */}
      <group ref={masterGroupRef} position={[0, 0, 0]}>
        {/* Dynamic Zero-Allocation Braided Hanging String */}
        <TagString eyeletRef={eyeletAnchorRef} ceilingY={3.6} />

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
        position={[0, -2.05, 0]}
        opacity={0.45}
        scale={7}
        blur={2.0}
        far={4}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

/**
 * TagScene
 * R3F Canvas container with optimized WebGL settings and centered framing.
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
      camera={{ position: [0, -0.2, 5.8], fov: 42 }}
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
