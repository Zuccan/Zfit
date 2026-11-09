import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createTagGeometry, createTagFrontTexture, createTagBackTexture, TAG_DIMENSIONS } from './TagGeometry';
import { TagPhysics } from './TagPhysics';

const BASE_SUSPENSION_Y = 0.58;

/**
 * HangingTag
 * Authentic luxury fashion hang tag suspended in 3D:
 * - 42-48vh desktop presence with authentic proportions
 * - Warm ivory white cardstock (#F3F1EB) with distinct natural paperboard sidewalls (#D5D0C5)
 * - Tiny genuine punched hole with authentic black braided cotton cord loop/knot
 * - Complete torque-based 3D physics with momentum preservation
 */
export function HangingTag({ onPullTrigger, onTensionChange, eyeletAnchorRef, isInteractingRef }) {
  const physicsGroupRef = useRef(null);
  const tagMeshRef = useRef(null);
  const localHitVector = useRef(new THREE.Vector3());

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize the torque-based 3-DOF rigid-body pendulum
  const physics = useMemo(() => new TagPhysics({ pullThreshold: 0.35 }), []);

  // Construct geometry with genuine tiny circular punched hole
  const { geometry: tagGeometry, holeY } = useMemo(() => createTagGeometry(), []);

  // Textures: High-contrast dark charcoal logo on warm ivory paper
  const frontTexture = useMemo(() => createTagFrontTexture(), []);
  const backTexture = useMemo(() => createTagBackTexture(), []);

  // Multi-material setup:
  // Material 0 (Front/Back faces): Warm ivory white (#F3F1EB) with satin sheen
  // Material 1 (Sidewalls & Bevels): Compressed paperboard core (#D5D0C5) for tangible 3D thickness
  const materials = useMemo(() => {
    const faceMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      color: '#F3F1EB',
      roughness: 0.55,
      metalness: 0.02,
      clearcoat: 0.18,
      clearcoatRoughness: 0.28,
      reflectivity: 0.52,
    });

    const sidewallMaterial = new THREE.MeshPhysicalMaterial({
      color: '#D5D0C5',
      roughness: 0.74,
      metalness: 0.01,
      clearcoat: 0.0,
    });

    return [faceMaterial, sidewallMaterial];
  }, [frontTexture]);

  // Black braided cotton cord material
  const cordMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#121215',
      roughness: 0.9,
      metalness: 0.06,
    });
  }, []);

  // 3D Cord Loop threading through the tiny punched hole
  const cordLoopGeometry = useMemo(() => {
    return new THREE.TorusGeometry(TAG_DIMENSIONS.holeRadius * 0.95, 0.0075, 12, 28);
  }, []);

  // Small knot collar sitting right above the hole where the suspension cord joins
  const knotGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.012, 0.014, 0.022, 14);
  }, []);

  // Bulletproof Pointer Interaction Handling
  const handlePointerDown = (e) => {
    e.stopPropagation();

    setIsDragging(true);
    if (isInteractingRef) isInteractingRef.current = true;

    // Calculate local hit point relative to suspension pivot
    if (physicsGroupRef.current && e.point) {
      localHitVector.current.copy(e.point);
      physicsGroupRef.current.worldToLocal(localHitVector.current);
    } else {
      localHitVector.current.set(0, -0.75, 0);
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
      // Screen Y increases downwards -> World -Y
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
      {/* Anchor for dynamic suspension cord tracking, located at the knot collar */}
      <group ref={eyeletAnchorRef} position={[0, 0.038, 0]} />

      {/* Realistic black cotton cord loop passing through the tiny punched hole */}
      <mesh
        geometry={cordLoopGeometry}
        material={cordMaterial}
        position={[0, 0, 0]}
        castShadow
      />

      {/* Authentic tie knot collar right above the hole where suspension cord attaches */}
      <mesh
        geometry={knotGeometry}
        material={cordMaterial}
        position={[0, 0.026, 0]}
        castShadow
      />

      {/* Tag Mesh offset so the tiny hole sits precisely at (0, 0, 0) local pivot */}
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

        {/* Clean Rear Face Plate */}
        <mesh position={[0, 0, -TAG_DIMENSIONS.depth * 0.5 - 0.002]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[TAG_DIMENSIONS.width * 0.92, TAG_DIMENSIONS.height * 0.9]} />
          <meshBasicMaterial map={backTexture} transparent opacity={0.96} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
