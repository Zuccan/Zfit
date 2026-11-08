import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TAG_DIMENSIONS } from './TagGeometry';

/**
 * TagEyelet
 * Authentic brushed silver metallic grommet lining the tag's genuine hole cutout:
 * - Front and rear Torus rings creating raised metallic lips
 * - Inner sleeve cylinder seamlessly lining the punched hole
 * - Highly reflective MeshPhysicalMaterial catching specular studio highlights
 */
export function TagEyelet({ holeY = 0 }) {
  const { holeRadius, depth, bevelThickness } = TAG_DIMENSIONS;
  const totalThickness = depth + bevelThickness * 2;
  const halfZ = totalThickness / 2;

  // Ultra-realistic brushed chrome/silver metal material
  const eyeletMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#e4e8ec',
      metalness: 0.96,
      roughness: 0.16,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      reflectivity: 0.92,
    });
  }, []);

  const ringRadius = holeRadius + 0.012;
  const tubeRadius = 0.018;

  const torusGeom = useMemo(() => {
    return new THREE.TorusGeometry(ringRadius, tubeRadius, 20, 36);
  }, [ringRadius, tubeRadius]);

  const sleeveGeom = useMemo(() => {
    const geom = new THREE.CylinderGeometry(holeRadius, holeRadius, totalThickness + 0.015, 36, 1, true);
    geom.rotateX(Math.PI / 2);
    return geom;
  }, [holeRadius, totalThickness]);

  return (
    <group position={[0, holeY, 0]}>
      {/* Front metallic raised ring lip */}
      <mesh
        geometry={torusGeom}
        material={eyeletMaterial}
        position={[0, 0, halfZ]}
        castShadow
        receiveShadow
      />

      {/* Rear metallic raised ring lip */}
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
