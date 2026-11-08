import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { HangingTag } from './HangingTag';
import { TagString } from './TagString';

/**
 * ResponsiveCamera
 * Declarative camera control that adapts distance and FOV on narrow viewports
 * without mutating hook return values directly.
 */
function ResponsiveCamera() {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const isNarrow = size.width / size.height < 0.7;

  const camZ = isNarrow ? 8.8 : isMobile ? 8.0 : 7.2;
  const camFov = isNarrow ? 48 : isMobile ? 45 : 42;

  return <PerspectiveCamera makeDefault position={[0, 0, camZ]} fov={camFov} />;
}

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
      <ResponsiveCamera />

      {/* Luxury Studio Three-Point Lighting */}
      <ambientLight intensity={0.75} color="#ffffff" />

      {/* Key Light: Casts crisp directional light highlighting beveled chamfers */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-bias={-0.0001}
      />

      {/* Rim / Back Light: Accentuates silhouetted edges and cardstock bevels */}
      <directionalLight
        position={[-4, 3, -3]}
        intensity={1.2}
        color="#e6ecff"
      />

      {/* Subtle Bottom Bounce Light */}
      <directionalLight
        position={[0, -4, 2]}
        intensity={0.3}
        color="#ffffff"
      />

      {/* Master GSAP Transition Group: Decoupled from physics spring group */}
      <group ref={masterGroupRef} position={[0, 0, 0]}>
        {/* Dynamic Zero-Allocation Braided Hanging String */}
        <TagString eyeletRef={eyeletAnchorRef} ceilingY={4.2} />

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
        position={[0, -3.2, 0]}
        opacity={0.55}
        scale={8.5}
        blur={2.4}
        far={5}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

/**
 * TagScene
 * R3F Canvas container with optimized WebGL settings and responsive sizing.
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
