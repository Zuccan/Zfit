import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TAG_DIMENSIONS } from './TagGeometry';

/**
 * TagEyelet
 * Authentic brushed silver metallic grommet lining the tag's genuine hole cutout:
 * - Front and rear Torus rings creating raised metallic lips
 * - Inner sleeve cylinder seamlessly lining the punched hole
 */
export function TagEyelet({ holeY }) {
  const { holeRadius, depth, bevelThickness } = TAG_DIMENSIONS;
  const totalThickness = depth + bevelThickness * 2;
  const halfZ = totalThickness / 2;

  // Reusable brushed metallic material
  const eyeletMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#d6d8db',
      metalness: 0.95,
      roughness: 0.22,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
  }, []);

  // Geometries for front/back rings and inner lining cylinder
  const ringRadius = holeRadius + 0.016;
  const tubeRadius = 0.022;

  const torusGeom = useMemo(() => {
    return new THREE.TorusGeometry(ringRadius, tubeRadius, 16, 32);
  }, [ringRadius, tubeRadius]);

  const sleeveGeom = useMemo(() => {
    const geom = new THREE.CylinderGeometry(holeRadius, holeRadius, totalThickness + 0.01, 32, 1, true);
    geom.rotateX(Math.PI / 2);
    return geom;
  }, [holeRadius, totalThickness]);

  return (
    <group position={[0, holeY, 0]}>
      {/* Front metallic lip */}
      <mesh
        geometry={torusGeom}
        material={eyeletMaterial}
        position={[0, 0, halfZ]}
        castShadow
        receiveShadow
      />

      {/* Rear metallic lip */}
      <mesh
        geometry={torusGeom}
        material={eyeletMaterial}
        position={[0, 0, -halfZ]}
        castShadow
        receiveShadow
      />

      {/* Inner cylindrical sleeve lining the punched hole */}
      <mesh
        geometry={sleeveGeom}
        material={eyeletMaterial}
      />
    </group>
  );
}

