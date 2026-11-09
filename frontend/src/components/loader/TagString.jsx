import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VerletRope } from './VerletRope';

const SEGMENTS = 40;
const RADIAL_SEGMENTS = 8;
const TUBE_RADIUS = 0.0075; // Delicate, thin black braided cotton cord
const TOTAL_VERTICES = (SEGMENTS + 1) * RADIAL_SEGMENTS;

// Module-level static scratch instances to guarantee 0 bytes GC per frame
const SCRATCH = {
  knotPos: new THREE.Vector3(),
  tangent: new THREE.Vector3(),
  normal: new THREE.Vector3(),
  binormal: new THREE.Vector3(),
  curvePoint: new THREE.Vector3(),
  vertex: new THREE.Vector3(),
  targetPos: new THREE.Vector3(),
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
 * External helper function updating the Verlet rope simulation and tube buffer geometry in-place.
 */
function updateCordGeometry(rope, spline, bufferState, eyeletMesh, delta) {
  // 1. Get current world coordinates of the knot on the tag
  eyeletMesh.getWorldPosition(SCRATCH.knotPos);

  // 2. Step the physical Verlet rope simulation
  const points = rope.step(delta, SCRATCH.knotPos);

  // 3. Update Catmull-Rom curve points in-place
  spline.points = points;

  // 4. Update vertex buffers
  const { geometry, positions, normals } = bufferState;
  const { tangent, normal, binormal, curvePoint, vertex } = SCRATCH;

  let vertexIndex = 0;
  normal.set(1, 0, 0);

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
 * Dynamic Verlet rope simulation with direct user interaction:
 * - Direct grab & pluck on the string itself
 * - Real-time deformation propagating through neighboring nodes
 * - Smooth in-place Catmull-Rom tube rendering with zero GC
 */
export function TagString({ eyeletRef, ceilingY = 2.4, onStringGrabChange }) {
  const meshRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isStringDragging, setIsStringDragging] = useState(false);

  // Initialize physical Verlet rope simulation
  const rope = useMemo(() => new VerletRope({ ceilingY, numNodes: 14 }), [ceilingY]);

  const bufferState = useMemo(() => createCordBufferState(), []);

  const stringMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#121215',
      roughness: 0.92,
      metalness: 0.05,
    });
  }, []);

  // Reusable CatmullRomCurve instance
  const spline = useMemo(() => {
    return new THREE.CatmullRomCurve3(rope.splinePoints, false, 'centripetal', 0.2);
  }, [rope]);

  // Handle direct string grab
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsStringDragging(true);
    if (onStringGrabChange) onStringGrabChange(true);

    const hitPoint = e.point.clone();
    rope.grabAtPoint(hitPoint);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialHit = hitPoint.clone();

    const onWindowPointerMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const worldScale = 0.0035;

      SCRATCH.targetPos.set(
        initialHit.x + dx * worldScale,
        initialHit.y - dy * worldScale,
        initialHit.z
      );

      rope.updateGrab(SCRATCH.targetPos);
    };

    const onWindowPointerUp = () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);

      rope.releaseGrab();
      setIsStringDragging(false);
      if (onStringGrabChange) onStringGrabChange(false);
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
  };

  // Cursor styling
  useEffect(() => {
    if (isStringDragging) {
      document.body.style.cursor = 'grabbing';
    } else if (isHovered) {
      document.body.style.cursor = 'grab';
    }
  }, [isStringDragging, isHovered]);

  // Frame update
  useFrame((state, delta) => {
    if (!eyeletRef.current || !meshRef.current) return;
    updateCordGeometry(rope, spline, bufferState, eyeletRef.current, delta);
  });

  return (
    <group>
      {/* Visual Rendered String */}
      <mesh
        ref={meshRef}
        geometry={bufferState.geometry}
        material={stringMaterial}
        castShadow
      />

      {/* Invisible Interactive Raycast Collider around the cord for direct grabbing */}
      <mesh
        position={[0, (ceilingY + 0.58) / 2, 0]}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <cylinderGeometry args={[0.08, 0.08, ceilingY - 0.58, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
