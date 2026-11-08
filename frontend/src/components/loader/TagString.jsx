import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SEGMENTS = 40;
const RADIAL_SEGMENTS = 8;
const TUBE_RADIUS = 0.015;
const TOTAL_VERTICES = (SEGMENTS + 1) * RADIAL_SEGMENTS;

// Module-level static scratch instances to guarantee 0 bytes GC per frame
const SCRATCH = {
  eyeletPos: new THREE.Vector3(),
  midPoint: new THREE.Vector3(),
  tangent: new THREE.Vector3(),
  normal: new THREE.Vector3(),
  binormal: new THREE.Vector3(),
  curvePoint: new THREE.Vector3(),
  vertex: new THREE.Vector3(),
  ceilingAnchor: new THREE.Vector3(0, 3.2, 0),
};

/**
 * Creates static tube topology and preallocated Float32Arrays once.
 */
function createCordBufferState() {
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(TOTAL_VERTICES * 3);
  const normals = new Float32Array(TOTAL_VERTICES * 3);
  const indices = [];

  for (let i = 0; i < SEGMENTS; i++) {
    for (let j = 0; j < RADIAL_SEGMENTS; j++) {
      const nextJ = (j + 1) % RADIAL_SEGMENTS;
      const a = i * RADIAL_SEGMENTS + j;
      const b = (i + 1) * RADIAL_SEGMENTS + j;
      const c = (i + 1) * RADIAL_SEGMENTS + nextJ;
      const d = i * RADIAL_SEGMENTS + nextJ;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setIndex(indices);
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

  return { geometry: geom, positions, normals };
}

/**
 * Updates vertex and normal coordinates in-place for the dynamic Catmull-Rom cord.
 */
function updateCordGeometry(spline, bufferState, eyeletMesh, stringMesh, ceilingY) {
  const {
    eyeletPos,
    midPoint,
    tangent,
    normal,
    binormal,
    curvePoint,
    vertex,
    ceilingAnchor,
  } = SCRATCH;

  ceilingAnchor.set(0, ceilingY, 0);

  // 1. World coordinates of the eyelet, transformed into string mesh local space
  eyeletMesh.getWorldPosition(eyeletPos);
  stringMesh.worldToLocal(eyeletPos);

  // 2. Realistic gravitational sag & tension calculation
  const deltaX = eyeletPos.x - ceilingAnchor.x;
  const deltaZ = eyeletPos.z - ceilingAnchor.z;
  midPoint.set(
    (ceilingAnchor.x + eyeletPos.x) * 0.5 - deltaX * 0.06,
    (ceilingAnchor.y + eyeletPos.y) * 0.5,
    (ceilingAnchor.z + eyeletPos.z) * 0.5 - deltaZ * 0.06
  );

  // 3. Update spline control points in-place
  spline.points[0].copy(ceilingAnchor);
  spline.points[1].copy(midPoint);
  spline.points[2].copy(eyeletPos);

  // 4. Update vertex buffers
  let vertexIndex = 0;
  normal.set(1, 0, 0);

  const { geometry, positions, normals } = bufferState;

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    spline.getPoint(t, curvePoint);
    spline.getTangent(t, tangent);

    binormal.crossVectors(tangent, normal).normalize();
    normal.crossVectors(binormal, tangent).normalize();

    for (let j = 0; j < RADIAL_SEGMENTS; j++) {
      const theta = (j / RADIAL_SEGMENTS) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      vertex.x = curvePoint.x + TUBE_RADIUS * (cos * normal.x + sin * binormal.x);
      vertex.y = curvePoint.y + TUBE_RADIUS * (cos * normal.y + sin * binormal.y);
      vertex.z = curvePoint.z + TUBE_RADIUS * (cos * normal.z + sin * binormal.z);

      const idx3 = vertexIndex * 3;
      positions[idx3] = vertex.x;
      positions[idx3 + 1] = vertex.y;
      positions[idx3 + 2] = vertex.z;

      normals[idx3] = cos * normal.x + sin * binormal.x;
      normals[idx3 + 1] = cos * normal.y + sin * binormal.y;
      normals[idx3 + 2] = cos * normal.z + sin * binormal.z;

      vertexIndex++;
    }
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.normal.needsUpdate = true;
}

/**
 * TagString
 * Dynamic braided hanging string that connects the ceiling anchor to the tag's punched hole.
 */
export function TagString({ eyeletRef, ceilingY = 3.2 }) {
  const meshRef = useRef(null);

  const bufferState = useMemo(() => createCordBufferState(), []);

  const stringMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#121215',
      roughness: 0.88,
      metalness: 0.08,
    });
  }, []);

  const spline = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, ceilingY, 0),
        new THREE.Vector3(0, ceilingY * 0.5, 0),
        new THREE.Vector3(0, 0, 0),
      ],
      false,
      'centripetal',
      0.3
    );
  }, [ceilingY]);

  useFrame(() => {
    if (!eyeletRef.current || !meshRef.current) return;
    updateCordGeometry(spline, bufferState, eyeletRef.current, meshRef.current, ceilingY);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={bufferState.geometry}
      material={stringMaterial}
      castShadow
    />
  );
}
