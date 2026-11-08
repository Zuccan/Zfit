import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createTagGeometry, createTagFrontTexture, createTagBackTexture, TAG_DIMENSIONS } from './TagGeometry';
import { TagEyelet } from './TagEyelet';
import { TagPhysics } from './TagPhysics';
import logoPng from '../../assets/Logo.png';

const BASE_SUSPENSION_Y = 0.9;

/**
 * HangingTag
 * The physical 3D fashion tag suspended in space:
 * - Suspended at natural center eyelet pivot
 * - Genuine through-hole geometric cutout
 * - Real-time pointer/touch dragging with elastic pull-down threshold detection
 * - Preserves authentic ZFITs branding on front and clean tactile back face
 */
export function HangingTag({ onPullTrigger, onTensionChange, eyeletAnchorRef, isInteractingRef }) {
  const physicsGroupRef = useRef(null);
  const tagMeshRef = useRef(null);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const planeIntersectPoint = useRef(new THREE.Vector3());
  const dragStartPoint = useRef(new THREE.Vector3());

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize the 3-DOF physics simulation instance with a clear, reliable pull threshold
  const physics = useMemo(() => new TagPhysics({ pullThreshold: 0.45 }), []);

  // Construct geometry with genuine through-hole cutout
  const { geometry: tagGeometry, holeY } = useMemo(() => createTagGeometry(), []);

  // Load the authentic original ZFITs logo asset
  const [logoImage, setLogoImage] = useState(null);
  useEffect(() => {
    const img = new Image();
    img.src = logoPng;
    img.onload = () => {
      setLogoImage(img);
    };
    img.onerror = () => {
      setLogoImage(null);
    };
  }, []);

  // Textures and physical materials
  const frontTexture = useMemo(() => {
    return createTagFrontTexture(logoImage);
  }, [logoImage]);

  const backTexture = useMemo(() => {
    return createTagBackTexture();
  }, []);

  // Front & side material for the main extruded card body
  const tagMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      color: '#ff0404ff',
      roughness: 0.55,
      metalness: 0.05,
      clearcoat: 0.15,
      clearcoatRoughness: 0.18,
      reflectivity: 0.6,
    });
  }, [frontTexture]);

  // Pointer drag calculations using 3D raycasting onto a depth plane
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

    const pos = getPointerWorldPos(e);
    dragStartPoint.current.copy(pos);
    physics.startDrag(e.clientX, e.clientY);
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

    // Apply the 3 independent degrees of freedom to the physics group
    physicsGroupRef.current.rotation.x = rotation.x; // Pitch
    physicsGroupRef.current.rotation.y = rotation.y; // Twist
    physicsGroupRef.current.rotation.z = rotation.z; // Sway (Roll)

    // Apply vertical pull displacement from base suspension anchor
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
          <planeGeometry args={[TAG_DIMENSIONS.width * 0.9, TAG_DIMENSIONS.height * 0.85]} />
          <meshBasicMaterial map={backTexture} transparent opacity={0.92} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
