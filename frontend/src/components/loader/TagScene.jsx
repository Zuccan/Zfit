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
      {/* Bright Luxury Apple-Style Studio Lighting */}
      <ambientLight intensity={1.1} color="#ffffff" />

      {/* Large Soft Key Light: Directional light casting crisp yet soft highlights and shadows */}
      <directionalLight
        position={[2.5, 4.0, 3.0]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
        shadow-bias={-0.0001}
      />

      {/* Narrow Back / Rim Light: Grazing beveled chamfers and physical sidewall depth */}
      <directionalLight
        position={[-3.0, 1.8, -2.0]}
        intensity={1.5}
        color="#edf2ff"
      />

      {/* Secondary Soft Bounce Fill Light */}
      <directionalLight
        position={[0, -2.5, 1.8]}
        intensity={0.35}
        color="#ffffff"
      />

      {/* Master GSAP Transition Group: Decoupled from physics spring group */}
      <group ref={masterGroupRef} position={[0, 0, 0]}>
        {/* Dynamic Thin Braided Cotton Hanging String */}
        <TagString eyeletRef={eyeletAnchorRef} ceilingY={2.4} />

        {/* 3D Suspended Fashion Tag */}
        <HangingTag
          onPullTrigger={onPullTrigger}
          onTensionChange={onTensionChange}
          eyeletAnchorRef={eyeletAnchorRef}
          isInteractingRef={isInteractingRef}
        />
      </group>

      {/* Delicate Contact Floor Shadow beneath the hanging object */}
      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.24}
        scale={4.2}
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
 * R3F Canvas container calibrated for 42-48vh desktop card presence,
 * balanced portrait aspect ratio, and bright luxury studio photography.
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
      camera={{ position: [0, -0.02, 5.2], fov: 36 }}
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
