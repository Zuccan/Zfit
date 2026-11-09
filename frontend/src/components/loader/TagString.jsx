import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TAG_CONFIG } from './TagConfig';

const SEGMENTS = 36;
const RADIAL_SEGMENTS = 8;
const TUBE_RADIUS = TAG_CONFIG.stringThickness; // Delicate cream cord thickness
const TOTAL_VERTICES = (SEGMENTS + 1) * RADIAL_SEGMENTS;

// Module-level static vectors to prevent per-frame garbage collection
const SCRATCH = {
  tangent: new THREE.Vector3(),
  normal: new THREE.Vector3(),
  binormal: new THREE.Vector3(),
  curvePoint: new THREE.Vector3(),
  vertex: new THREE.Vector3(),
};

/**
 * Creates preallocated Float32Array buffers and static index buffer once.
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
 * In-place vertex buffer update along Catmull-Rom curve with zero memory allocations
 */
function updateTubeGeometry(spline, bufferState) {
  const { geometry, positions, normals } = bufferState;
  const { tangent, normal, binormal, curvePoint, vertex } = SCRATCH;

  let vertexIndex = 0;
  normal.set(1, 0, 0);

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    spline.getPoint(t, curvePoint);
    spline.getTangent(t, tangent).normalize();

    // Frenet frame orientation
    binormal.crossVectors(tangent, normal).normalize();
    normal.crossVectors(binormal, tangent).normalize();

    for (let j = 0; j < RADIAL_SEGMENTS; j++) {
      const theta = (j / RADIAL_SEGMENTS) * Math.PI * 2;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      // Normal in circle plane
      const nx = normal.x * cosTheta + binormal.x * sinTheta;
      const ny = normal.y * cosTheta + binormal.y * sinTheta;
      const nz = normal.z * cosTheta + binormal.z * sinTheta;

      // Vertex position
      vertex.x = curvePoint.x + nx * TUBE_RADIUS;
      vertex.y = curvePoint.y + ny * TUBE_RADIUS;
      vertex.z = curvePoint.z + nz * TUBE_RADIUS;

      positions[vertexIndex * 3] = vertex.x;
      positions[vertexIndex * 3 + 1] = vertex.y;
      positions[vertexIndex * 3 + 2] = vertex.z;

      normals[vertexIndex * 3] = nx;
      normals[vertexIndex * 3 + 1] = ny;
      normals[vertexIndex * 3 + 2] = nz;

      vertexIndex++;
    }
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.normal.needsUpdate = true;
  geometry.computeBoundingSphere();
}

/**
 * TagString
 * Continuous Single-Body Cream Braided Cotton Cord:
 * - Originates seamlessly from ceiling bracket at (0, 1.85, 0)
 * - Extends continuously down into the tag's top-center punched hole
 * - Reduced thickness for high-fashion delicacy (TAG_CONFIG.stringThickness: 0.0035)
 * - Warm luxury cream color (TAG_CONFIG.stringColor: #F5EFE6)
 * - Casts realistic physical shadow
 */
export function TagString({ physics }) {
  const meshRef = useRef(null);
  const frayedTipRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isStringDragging, setIsStringDragging] = useState(false);

  const bufferState = useMemo(() => createCordBufferState(), []);

  const stringMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: TAG_CONFIG.stringColor,
      roughness: TAG_CONFIG.stringRoughness,
      metalness: TAG_CONFIG.stringMetalness,
    });
  }, []);

  // Catmull-Rom spline instantiated in ref for per-frame point updates
  const splineRef = useRef(
    new THREE.CatmullRomCurve3(physics.splinePoints, false, 'centripetal', 0.2)
  );

  // Handle direct pointer interaction with the string
  const handlePointerDown = (e) => {
    if (physics.isLocked || physics.isSnapped) return;
    e.stopPropagation();
    setIsStringDragging(true);

    const hitPoint = e.point.clone();
    physics.startStringDrag(hitPoint, e.clientX, e.clientY);

    const startX = e.clientX;
    const startY = e.clientY;

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

      setIsStringDragging(false);
      physics.release();
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
  };

  // Cursor styling synchronization
  useEffect(() => {
    if (isStringDragging) {
      document.body.style.cursor = 'grabbing';
    } else if (isHovered && !physics.isSnapped) {
      document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [isStringDragging, isHovered, physics.isSnapped]);

  // Update dynamic tube geometry each frame
  useFrame(() => {
    if (!splineRef.current) return;
    splineRef.current.points = physics.splinePoints;
    updateTubeGeometry(splineRef.current, bufferState);

    // Update position of frayed string tip at bottom node upon snap
    if (frayedTipRef.current && physics.isSnapped) {
      const bottomNode = physics.nodes[physics.numNodes - 1];
      frayedTipRef.current.position.set(bottomNode.x, bottomNode.y, bottomNode.z);
    }
  });

  return (
    <group>
      {/* 3D Dynamic Cotton Cord Tube: Continuous from ceiling anchor to tag hole */}
      <mesh
        ref={meshRef}
        geometry={bufferState.geometry}
        material={stringMaterial}
        castShadow
        onPointerDown={handlePointerDown}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      />

      {/* Subtle severed cream cotton thread fibers recoiling with the bottom rope end upon snap */}
      {physics.isSnapped && (
        <group ref={frayedTipRef}>
          <mesh position={[-0.0015, -0.005, 0.001]} rotation={[0, 0, 0.28]} castShadow>
            <cylinderGeometry args={[0.0004, 0.0004, 0.012, 6]} />
            <meshBasicMaterial color={TAG_CONFIG.stringColor} />
          </mesh>
          <mesh position={[0.0015, -0.006, -0.001]} rotation={[0, 0, -0.30]} castShadow>
            <cylinderGeometry args={[0.0004, 0.0004, 0.013, 6]} />
            <meshBasicMaterial color={TAG_CONFIG.stringColor} />
          </mesh>
        </group>
      )}
    </group>
  );
}
