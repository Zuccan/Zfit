import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * FabricMesh (V11.1)
 * High-Fashion Editorial Silk/Satin Fabric:
 * - Dynamically animated Two-Sided BufferGeometry updated by ClothPhysics
 * - Initially suspended above the viewport
 * - Falls through the scene upon tag pull with authentic folds and sheen
 */
export function FabricMesh({ clothPhysics }) {
  const meshRef = useRef(null);

  // Construct BufferGeometry once with precomputed index and UV buffers
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(clothPhysics.positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(clothPhysics.normals, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(clothPhysics.uvs, 2));
    geom.setIndex(new THREE.BufferAttribute(clothPhysics.indices, 1));
    geom.computeVertexNormals();
    return geom;
  }, [clothPhysics]);

  // Luxury Silk Satin Physical Material
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FAF8F5'),
      roughness: 0.40,
      metalness: 0.04,
      clearcoat: 0.25,
      clearcoatRoughness: 0.20,
      sheen: 0.85,
      sheenColor: new THREE.Color('#FFFFFF'),
      sheenRoughness: 0.32,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
  }, []);

  // Update vertex buffer and normals on every frame when released
  useFrame(() => {
    if (!meshRef.current) return;
    // Only recompute normals if simulation is active/released
    if (clothPhysics.isReleased) {
      const geom = meshRef.current.geometry;
      geom.attributes.position.needsUpdate = true;
      geom.computeVertexNormals();
      geom.attributes.normal.needsUpdate = true;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}
