import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createTagGeometry,
  createTagFrontTexture,
  createTagBackTexture,
  createTagBumpTexture,
  TAG_DIMENSIONS,
} from './TagGeometry';
import { TAG_CONFIG } from './TagConfig';

/**
 * HangingTag
 * Luxury Black Fashion Tag with PURE #FFFFFF Content & Cream Cord:
 * - 100% Fully opaque deep rich black cardstock (#0B0B0D)
 * - PURE CRISP WHITE (#FFFFFF) Z-suit logo, wordmark, and border boosted by emissiveMap
 * - Solid black paper core sidewalls (#0A0A0C)
 * - Delicate matching cream cotton knot collar at punched hole
 * - Reduced elegant card proportions (TAG_CONFIG.cardWidth x TAG_CONFIG.cardHeight)
 * - Dynamic, soft, realistic cast shadow
 */
export function HangingTag({ physics }) {
  const tagGroupRef = useRef(null);
  const localHitVector = useRef(new THREE.Vector3());

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Construct extruded rectangular geometry with clean punched hole cutout
  const { geometry: tagGeometry, holeY } = useMemo(() => createTagGeometry(), []);

  // Textures: High-resolution diffuse and bump maps
  const frontTexture = useMemo(() => createTagFrontTexture(), []);
  const backTexture = useMemo(() => createTagBackTexture(), []);
  const bumpTexture = useMemo(() => createTagBumpTexture(), []);

  // Multi-material setup:
  // Material 0 (Faces): Deep black paper with PURE BRILLIANT #FFFFFF logo & typography
  // Material 1 (Sidewalls): Deep black paper core edge (TAG_CONFIG.cardCoreColor)
  const materials = useMemo(() => {
    const faceMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      emissiveMap: frontTexture,
      emissive: new THREE.Color(TAG_CONFIG.contentColor),
      emissiveIntensity: TAG_CONFIG.emissiveIntensity, // Ensures pure radiant #FFFFFF
      bumpMap: bumpTexture,
      bumpScale: 0.0016,
      color: '#FFFFFF',
      roughness: 0.72,
      metalness: 0.0,
      transparent: false,
      depthWrite: true,
    });

    const sidewallMaterial = new THREE.MeshStandardMaterial({
      color: TAG_CONFIG.cardCoreColor,
      roughness: 0.88,
      metalness: 0.0,
      transparent: false,
      depthWrite: true,
    });

    return [faceMaterial, sidewallMaterial];
  }, [frontTexture, bumpTexture]);

  // Delicate cream braided cotton cord collar material
  const cordMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: TAG_CONFIG.stringColor, // Matching cream cord color (#F5EFE6)
      roughness: TAG_CONFIG.stringRoughness,
      metalness: TAG_CONFIG.stringMetalness,
    });
  }, []);

  // Small delicate knot collar sitting right at the punched hole eyelet
  const knotGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.0042, 0.0050, 0.010, 12);
  }, []);

  // Pointer Interaction Handling with global window listeners
  const handlePointerDown = (e) => {
    if (physics.isLocked || physics.isSnapped) return;
    e.stopPropagation();
    setIsDragging(true);

    // Calculate local hit point relative to suspension eyelet
    if (tagGroupRef.current && e.point) {
      localHitVector.current.copy(e.point);
      tagGroupRef.current.worldToLocal(localHitVector.current);
    } else {
      localHitVector.current.set(0, -TAG_DIMENSIONS.height / 2, 0);
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
      physics.release();
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
  };

  // Cursor styling synchronization
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else if (isHovered && !physics.isSnapped) {
      document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isDragging, isHovered, physics.isSnapped]);

  // Synchronize tag mesh position and rotation with the coupled physics simulation
  useFrame(() => {
    if (!tagGroupRef.current) return;

    tagGroupRef.current.position.set(
      physics.tagPosition.x,
      physics.tagPosition.y,
      physics.tagPosition.z
    );

    tagGroupRef.current.rotation.x = physics.rotation.x;
    tagGroupRef.current.rotation.y = physics.rotation.y;
    tagGroupRef.current.rotation.z = physics.rotation.z;
  });

  const halfThickness = TAG_DIMENSIONS.depth / 2 + TAG_DIMENSIONS.bevelThickness;

  return (
    // Tag Group centered at suspension eyelet (local [0, 0, 0] = center of punched hole)
    <group ref={tagGroupRef}>
      {/* Cream tie knot collar directly at the rear punched hole connection */}
      <mesh
        geometry={knotGeometry}
        material={cordMaterial}
        position={[0, 0.005, -0.020]}
        castShadow
      />

      {/* Subtle severed cream cotton micro-fibers at the collar upon snap */}
      {physics.isSnapped && (
        <group position={[0, 0.012, -0.020]}>
          <mesh position={[-0.0015, 0.004, 0.001]} rotation={[0, 0, 0.28]}>
            <cylinderGeometry args={[0.0004, 0.0004, 0.010, 6]} />
            <meshBasicMaterial color={TAG_CONFIG.stringColor} />
          </mesh>
          <mesh position={[0.0015, 0.005, -0.001]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.0004, 0.0004, 0.011, 6]} />
            <meshBasicMaterial color={TAG_CONFIG.stringColor} />
          </mesh>
        </group>
      )}

      {/* Tag Mesh translated so the punched hole sits exactly at (0, 0, 0) local pivot */}
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
          position={[0, 0, -halfThickness - 0.0001]}
          rotation={[0, Math.PI, 0]}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[TAG_DIMENSIONS.width * 0.995, TAG_DIMENSIONS.height * 0.995]} />
          <meshStandardMaterial
            map={backTexture}
            emissiveMap={backTexture}
            emissive={new THREE.Color(TAG_CONFIG.contentColor)}
            emissiveIntensity={TAG_CONFIG.emissiveIntensity}
            bumpMap={bumpTexture}
            bumpScale={0.0016}
            color="#FFFFFF"
            roughness={0.72}
            metalness={0.0}
            transparent={false}
            depthWrite={true}
          />
        </mesh>
      </group>
    </group>
  );
}
