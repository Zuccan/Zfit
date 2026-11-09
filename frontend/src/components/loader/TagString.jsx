import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SEGMENTS = 36;
const RADIAL_SEGMENTS = 8;
const TUBE_RADIUS = 0.007; // Thin, delicate black braided cotton cord
const TOTAL_VERTICES = (SEGMENTS + 1) * RADIAL_SEGMENTS;

// Module-level static vectors to prevent any per-frame garbage collection
const SCRATCH = {
  tangent: new THREE.Vector3(),
  normal: new THREE.Vector3(),
  binormal: new THREE.Vector3(),
  curvePoint: new THREE.Vector3(),
  vertex: new THREE.Vector3(),
  worldPos: new THREE.Vector3(),
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
 * Dynamic braided cotton suspension cord rendered directly from the unified Verlet rope.
 * Supports direct clicking and grabbing of the rope to pluck and swing it!
 */
export function TagString({ physics, onPullTrigger }) {
  const meshRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isStringDragging, setIsStringDragging] = useState(false);

  const bufferState = useMemo(() => createCordBufferState(), []);

  const stringMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#ffffffff',
      roughness: 0.92,
      metalness: 0.04,
    });
  }, []);

  // Catmull-Rom spline instantiated in ref for per-frame point updates
  const splineRef = useRef(
    new THREE.CatmullRomCurve3(physics.splinePoints, false, 'centripetal', 0.2)
  );

  // Handle direct grabbing of the rope
  const handlePointerDown = (e) => {
    if (physics.isLocked) return;
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
    if (isStringDragging) {
      document.body.style.cursor = 'grabbing';
    } else if (isHovered) {
      document.body.style.cursor = 'grab';
    }
  }, [isStringDragging, isHovered]);

  // Update dynamic tube geometry each frame
  useFrame(() => {
    if (!splineRef.current) return;
    splineRef.current.points = physics.splinePoints;
    updateTubeGeometry(splineRef.current, bufferState);
  });

  return (
    <group>
      {/* 3D Dynamic Cotton Cord Tube */}
      <mesh
        ref={meshRef}
        geometry={bufferState.geometry}
        material={stringMaterial}
        castShadow
      />

      {/* Invisible Interactive Raycast Collider around the cord */}
      <mesh
        position={[0, (physics.ceilingY + 0.6) / 2, 0]}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <cylinderGeometry args={[0.075, 0.075, physics.ceilingY - 0.6, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
