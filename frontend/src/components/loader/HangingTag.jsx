import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createTagGeometry, createTagFrontTexture, createTagBackTexture, TAG_DIMENSIONS } from './TagGeometry';
import { TagPhysics } from './TagPhysics';

const BASE_SUSPENSION_Y = 0.85;

/**
 * HangingTag
 * Authentic off-white luxury fashion hang tag suspended in 3D:
 * - Premium ivory paper (#F3F0E9) with visible darker paperboard sidewall thickness
 * - Clean circular punched hole (no metallic eyelet) with black cord looping through
 * - Exact dark charcoal ZFITs SVG logo
 * - Bulletproof window-bound pointer interaction with correct screen-to-world torque dynamics
 */
export function HangingTag({ onPullTrigger, onTensionChange, eyeletAnchorRef, isInteractingRef }) {
  const physicsGroupRef = useRef(null);
  const tagMeshRef = useRef(null);
  const localHitVector = useRef(new THREE.Vector3());

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize the torque-based 3-DOF rigid-body pendulum
  const physics = useMemo(() => new TagPhysics({ pullThreshold: 0.42 }), []);

  // Construct geometry with genuine circular punched hole
  const { geometry: tagGeometry, holeY } = useMemo(() => createTagGeometry(), []);

  // Textures: High-contrast dark charcoal logo on warm ivory paper
  const frontTexture = useMemo(() => createTagFrontTexture(), []);
  const backTexture = useMemo(() => createTagBackTexture(), []);

  // Multi-material setup:
  // Material 0 (Front/Back faces): Warm ivory paper with satin sheen
  // Material 1 (Sidewalls & Bevels): Authentic slightly deeper paperboard core for visible 3D thickness
  const materials = useMemo(() => {
    const faceMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      color: '#F3F0E9',
      roughness: 0.62,
      metalness: 0.02,
      clearcoat: 0.14,
      clearcoatRoughness: 0.35,
      reflectivity: 0.5,
    });

    const sidewallMaterial = new THREE.MeshPhysicalMaterial({
      color: '#D8D3C8', // Deeper paperboard core highlighting physical depth
      roughness: 0.78,
      metalness: 0.01,
      clearcoat: 0.0,
    });

    return [faceMaterial, sidewallMaterial];
  }, [frontTexture]);

  // Black braided cord knot/loop material that secures the tag through the punched hole
  const cordLoopMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#121215',
      roughness: 0.88,
      metalness: 0.08,
    });
  }, []);

  // Torus geometry simulating the cord loop wrapping through the punched hole
  const cordLoopGeometry = useMemo(() => {
    return new THREE.TorusGeometry(TAG_DIMENSIONS.holeRadius * 0.95, 0.016, 12, 28);
  }, []);

  // Bulletproof Pointer Interaction Handling
  const handlePointerDown = (e) => {
    e.stopPropagation();

    setIsDragging(true);
    if (isInteractingRef) isInteractingRef.current = true;

    // Calculate local hit point relative to suspension eyelet
    if (physicsGroupRef.current && e.point) {
      localHitVector.current.copy(e.point);
      physicsGroupRef.current.worldToLocal(localHitVector.current);
    } else {
      localHitVector.current.set(0, -1.0, 0);
    }

    const startX = e.clientX;
    const startY = e.clientY;
    physics.startDrag(e.clientX, e.clientY, localHitVector.current);

    // Global window listeners guarantee every drag motion & release is captured
    const onWindowPointerMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const worldScale = 0.0035;

      // Screen X increases to right -> World +X
      // Screen Y increases downwards -> World -Y (inverted!)
      const deltaWorldX = dx * worldScale;
      const deltaWorldY = -dy * worldScale;

      physics.updateDrag(ev.clientX, ev.clientY, deltaWorldX, deltaWorldY);
    };

    const onWindowPointerUp = () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);

      setIsDragging(false);
      if (isInteractingRef) isInteractingRef.current = false;

      const wasDeliberatePull = physics.release();
      if (wasDeliberatePull && onPullTrigger) {
        onPullTrigger();
      }
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
  };

  // Cursor styling synchronization
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else if (isHovered) {
      document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isDragging, isHovered]);

  // Real-time physics stepping in useFrame
  useFrame((state, delta) => {
    if (!physicsGroupRef.current) return;

    const { rotation, pullY, isTensionHigh } = physics.step(delta, state.clock.getElapsedTime());

    // Apply the 3 independent rotational degrees of freedom
    physicsGroupRef.current.rotation.x = rotation.x; // Pitch
    physicsGroupRef.current.rotation.y = rotation.y; // Yaw (twist around cord)
    physicsGroupRef.current.rotation.z = rotation.z; // Roll (pendulum sway)

    // Apply vertical displacement from base suspension anchor
    physicsGroupRef.current.position.y = BASE_SUSPENSION_Y - pullY;

    if (onTensionChange) {
      onTensionChange(isTensionHigh);
    }
  });

  return (
    // PIVOT: Punched hole suspension pivot at BASE_SUSPENSION_Y
    <group ref={physicsGroupRef} position={[0, BASE_SUSPENSION_Y, 0]}>
      {/* Dynamic String Tracking Anchor right at the center of the punched hole */}
      <group ref={eyeletAnchorRef} position={[0, 0, 0]} />

      {/* Realistic black cord loop passing directly through the punched hole (NO metal grommet) */}
      <mesh
        geometry={cordLoopGeometry}
        material={cordLoopMaterial}
        position={[0, 0, 0]}
        castShadow
      />

      {/* Tag Mesh offset so the punched hole sits precisely at (0, 0, 0) local pivot */}
      <group position={[0, -holeY, 0]}>
        <mesh
          ref={tagMeshRef}
          geometry={tagGeometry}
          material={materials}
          castShadow
          receiveShadow
          onPointerDown={handlePointerDown}
          onPointerOver={() => setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
        />

        {/* Clean Rear Face Plate ensuring crisp typography from behind */}
        <mesh position={[0, 0, -TAG_DIMENSIONS.depth * 0.5 - 0.002]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[TAG_DIMENSIONS.width * 0.92, TAG_DIMENSIONS.height * 0.9]} />
          <meshBasicMaterial map={backTexture} transparent opacity={0.96} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
