import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createTagGeometry, createTagFrontTexture, createTagBackTexture, TAG_DIMENSIONS } from './TagGeometry';

/**
 * HangingTag
 * Fully black ultra-thin luxury fashion hang tag suspended in 3D:
 * - Simple rectangular shape with 4 sharp 90-degree square corners
 * - Ultra-thin physical paper construction (~0.35 - 0.45 mm thickness)
 * - Fully black luxury cardstock (#0D0D0F) with fine paper grain
 * - New reference logo: Tailored dress shirt collar & tie inside the letter Z
 * - Delicate black braided cotton cord loop through the punched hole
 * - Fully coupled to the 12-particle Verlet rope (Node 11 = suspension eyelet)
 * - 360° unconstrained rotation with lightweight paperboard inertia
 * - Symmetrical front and back faces with matching right-side-up ZFITs branding
 */
export function HangingTag({ physics, onPullTrigger }) {
  const tagGroupRef = useRef(null);
  const localHitVector = useRef(new THREE.Vector3());

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Construct ultra-thin extruded rectangular geometry with authentic punched hole cutout
  const { geometry: tagGeometry, holeY } = useMemo(() => createTagGeometry(), []);

  // Textures: High-contrast pure white logo on fully black paper
  const frontTexture = useMemo(() => createTagFrontTexture(), []);
  const backTexture = useMemo(() => createTagBackTexture(), []);

  // Multi-material setup:
  // Material 0 (Faces): Fully black paper (#0D0D0F) with crisp white Z-suit logo
  // Material 1 (Sidewalls): Ultra-thin black paper core (#101012), no bulky plastic appearance
  const materials = useMemo(() => {
    const faceMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      color: '#ffffff',
      roughness: 0.58,
      metalness: 0.04,
      clearcoat: 0.16,
      clearcoatRoughness: 0.32,
      reflectivity: 0.48,
    });

    const sidewallMaterial = new THREE.MeshPhysicalMaterial({
      color: '#101012',
      roughness: 0.85,
      metalness: 0.01,
      clearcoat: 0.0,
    });

    return [faceMaterial, sidewallMaterial];
  }, [frontTexture]);

  // Delicate black braided cotton cord material
  const cordMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#141416',
      roughness: 0.92,
      metalness: 0.04,
    });
  }, []);

  // 3D Cord Loop threading through the punched hole
  const cordLoopGeometry = useMemo(() => {
    return new THREE.TorusGeometry(TAG_DIMENSIONS.holeRadius * 0.94, 0.0035, 10, 24);
  }, []);

  // Small delicate knot collar sitting right above the hole where suspension rope attaches
  const knotGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.0055, 0.0065, 0.012, 12);
  }, []);

  // Pointer Interaction Handling with global window listeners
  const handlePointerDown = (e) => {
    if (physics.isLocked) return;
    e.stopPropagation();
    setIsDragging(true);

    // Calculate local hit point relative to suspension eyelet
    if (tagGroupRef.current && e.point) {
      localHitVector.current.copy(e.point);
      tagGroupRef.current.worldToLocal(localHitVector.current);
    } else {
      localHitVector.current.set(0, -0.65, 0);
    }

    const startX = e.clientX;
    const startY = e.clientY;
    physics.startCardDrag(e.clientX, e.clientY, localHitVector.current);

    const onWindowPointerMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const worldScale = 0.0035;

      const deltaWorldX = dx * worldScale;
      const deltaWorldY = -dy * worldScale;

      physics.updateDrag(ev.clientX, ev.clientY, deltaWorldX, deltaWorldY);
    };

    const onWindowPointerUp = () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);

      setIsDragging(false);

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

  // Synchronize tag mesh position and rotation with the coupled physics simulation
  useFrame(() => {
    if (!tagGroupRef.current) return;

    const bottomNode = physics.nodes[physics.numNodes - 1];
    tagGroupRef.current.position.set(bottomNode.x, bottomNode.y, bottomNode.z);

    tagGroupRef.current.rotation.x = physics.rotation.x;
    tagGroupRef.current.rotation.y = physics.rotation.y;
    tagGroupRef.current.rotation.z = physics.rotation.z;
  });

  const halfThickness = TAG_DIMENSIONS.depth / 2 + TAG_DIMENSIONS.bevelThickness;

  return (
    // Tag Group centered at suspension eyelet (Node 11)
    <group ref={tagGroupRef}>
      {/* Black cotton cord loop through the punched hole */}
      <mesh
        geometry={cordLoopGeometry}
        material={cordMaterial}
        position={[0, 0, 0]}
        castShadow
      />

      {/* Tie knot collar directly above the punched hole */}
      <mesh
        geometry={knotGeometry}
        material={cordMaterial}
        position={[0, 0.015, 0]}
        castShadow
      />

      {/* Tag Mesh translated so the hole sits exactly at (0, 0, 0) local pivot */}
      <group position={[0, -holeY, 0]}>
        <mesh
          geometry={tagGeometry}
          material={materials}
          castShadow
          receiveShadow
          onPointerDown={handlePointerDown}
          onPointerOver={() => setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
        />

        {/* Clean Rear Face Plate: Un-mirrored identical artwork on the back */}
        <mesh
          position={[0, 0, -halfThickness - 0.0002]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[TAG_DIMENSIONS.width * 0.99, TAG_DIMENSIONS.height * 0.99]} />
          <meshBasicMaterial
            map={backTexture}
            transparent
            opacity={0.98}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
