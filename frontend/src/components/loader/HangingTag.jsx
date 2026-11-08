import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createTagGeometry, createTagFrontTexture, createTagBackTexture, TAG_DIMENSIONS } from './TagGeometry';
import { TagEyelet } from './TagEyelet';
import { TagPhysics } from './TagPhysics';

const BASE_SUSPENSION_Y = 1.0;

/**
 * HangingTag
 * The physical 3D fashion tag suspended in space:
 * - Dominant screen presence with true extruded 3D thickness and bevels
 * - Point-of-interaction torque physics: dragging different corners creates natural 3D rotation & twist
 * - High-contrast brilliant pure white ZFITs logo
 * - Realistic metallic eyelet embedded at the suspension pivot
 */
export function HangingTag({ onPullTrigger, onTensionChange, eyeletAnchorRef, isInteractingRef }) {
  const physicsGroupRef = useRef(null);
  const tagMeshRef = useRef(null);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const planeIntersectPoint = useRef(new THREE.Vector3());
  const dragStartPoint = useRef(new THREE.Vector3());
  const localHitVector = useRef(new THREE.Vector3());

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize the torque-based 3-DOF rigid-body pendulum
  const physics = useMemo(() => new TagPhysics({ pullThreshold: 0.48 }), []);

  // Construct geometry with genuine through-hole cutout and beveled edges
  const { geometry: tagGeometry, holeY } = useMemo(() => createTagGeometry(), []);

  // Textures: Brilliant white logo on front, luxury authentication on back
  const frontTexture = useMemo(() => createTagFrontTexture(), []);
  const backTexture = useMemo(() => createTagBackTexture(), []);

  // Luxury cardstock material: MeshPhysicalMaterial with tuned clearcoat for satin sheen
  const tagMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      color: '#141418',
      roughness: 0.52,
      metalness: 0.08,
      clearcoat: 0.42,
      clearcoatRoughness: 0.22,
      reflectivity: 0.72,
    });
  }, [frontTexture]);

  // Pointer drag calculations using 3D raycasting onto depth plane
  const getPointerWorldPos = (e) => {
    const raycaster = e.ray;
    raycaster.ray.intersectPlane(dragPlaneRef.current, planeIntersectPoint.current);
    return planeIntersectPoint.current;
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);

    setIsDragging(true);
    if (isInteractingRef) isInteractingRef.current = true;

    // Calculate local hit point on the card relative to the eyelet pivot
    if (physicsGroupRef.current && e.point) {
      localHitVector.current.copy(e.point);
      physicsGroupRef.current.worldToLocal(localHitVector.current);
    } else {
      localHitVector.current.set(0, -1.3, 0);
    }

    const pos = getPointerWorldPos(e);
    dragStartPoint.current.copy(pos);
    physics.startDrag(e.clientX, e.clientY, localHitVector.current);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();

    const currentPos = getPointerWorldPos(e);
    const deltaX = currentPos.x - dragStartPoint.current.x;
    const deltaY = currentPos.y - dragStartPoint.current.y;

    physics.updateDrag(e.clientX, e.clientY, deltaX, deltaY);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setIsDragging(false);
    if (isInteractingRef) isInteractingRef.current = false;

    // Check if user exceeded the deliberate downward pull threshold
    const wasDeliberatePull = physics.release();
    if (wasDeliberatePull && onPullTrigger) {
      onPullTrigger();
    }
  };

  // Synchronize cursor styling
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
    physicsGroupRef.current.rotation.x = rotation.x; // Pitch (tilt forward/back)
    physicsGroupRef.current.rotation.y = rotation.y; // Yaw (twist around cord)
    physicsGroupRef.current.rotation.z = rotation.z; // Roll (pendulum sway)

    // Apply downward pull displacement
    physicsGroupRef.current.position.y = BASE_SUSPENSION_Y - pullY;

    if (onTensionChange) {
      onTensionChange(isTensionHigh);
    }
  });

  return (
    // PIVOT: Eyelet suspension point at BASE_SUSPENSION_Y
    <group ref={physicsGroupRef} position={[0, BASE_SUSPENSION_Y, 0]}>
      {/* Eyelet Anchor Ref for Dynamic String Connection Tracking */}
      <group ref={eyeletAnchorRef} position={[0, 0, 0]} />

      {/* 3D Metallic Eyelet Lining the Punched Hole */}
      <TagEyelet holeY={0} />

      {/* Tag Mesh offset so eyelet hole is precisely at (0, 0, 0) local pivot */}
      <group position={[0, -holeY, 0]}>
        <mesh
          ref={tagMeshRef}
          geometry={tagGeometry}
          material={tagMaterial}
          castShadow
          receiveShadow
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerOver={() => setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
        />

        {/* Rear Face Texture Plate to ensure proper appearance from the back */}
        <mesh position={[0, 0, -TAG_DIMENSIONS.depth * 0.5 - 0.002]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[TAG_DIMENSIONS.width * 0.92, TAG_DIMENSIONS.height * 0.88]} />
          <meshBasicMaterial map={backTexture} transparent opacity={0.92} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
