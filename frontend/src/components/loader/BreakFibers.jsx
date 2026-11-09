import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FIBER_COUNT = 18;

class FiberSimulation {
  constructor() {
    this.positions = new Float32Array(FIBER_COUNT * 3);
    this.velocities = new Float32Array(FIBER_COUNT * 3);
    this.opacities = new Float32Array(FIBER_COUNT);
    this.isActive = false;

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
  }

  burst(origin) {
    const ox = origin ? origin.x : 0;
    const oy = origin ? origin.y : 1.85;
    const oz = origin ? origin.z : 0;

    for (let i = 0; i < FIBER_COUNT; i++) {
      const idx = i * 3;
      this.positions[idx] = ox + (Math.random() - 0.5) * 0.03;
      this.positions[idx + 1] = oy - 0.02 + (Math.random() - 0.5) * 0.02;
      this.positions[idx + 2] = oz + (Math.random() - 0.5) * 0.03;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.35 + Math.random() * 0.85;
      this.velocities[idx] = Math.cos(angle) * speed * 0.45;
      this.velocities[idx + 1] = -0.4 - Math.random() * 1.2; // Primary downward recoil
      this.velocities[idx + 2] = Math.sin(angle) * speed * 0.45;

      this.opacities[i] = 1.0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.isActive = true;
  }

  step(delta) {
    if (!this.isActive) return;

    const dt = Math.min(0.025, Math.max(0.005, delta));
    let hasAlive = false;

    for (let i = 0; i < FIBER_COUNT; i++) {
      if (this.opacities[i] <= 0.01) continue;
      hasAlive = true;

      const idx = i * 3;
      this.velocities[idx] *= 0.95;
      this.velocities[idx + 1] += -3.5 * dt;
      this.velocities[idx + 1] *= 0.96;
      this.velocities[idx + 2] *= 0.95;

      this.positions[idx] += this.velocities[idx] * dt;
      this.positions[idx + 1] += this.velocities[idx + 1] * dt;
      this.positions[idx + 2] += this.velocities[idx + 2] * dt;

      this.opacities[i] -= dt * 0.85;
    }

    this.geometry.attributes.position.needsUpdate = true;

    if (!hasAlive) {
      this.isActive = false;
    }
  }
}

/**
 * BreakFibers (V12)
 * Subtle thread-fraying particles spawned at the exact upper suspension anchor
 * when the cotton cord breaks free under excessive tension.
 */
export function BreakFibers({ breakEvent }) {
  const pointsRef = useRef(null);
  const sim = useMemo(() => new FiberSimulation(), []);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color('#1A1A1D'),
      size: 0.018,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    if (breakEvent) {
      sim.burst(breakEvent.anchorPos);
    }
  }, [breakEvent, sim]);

  useFrame((state, delta) => {
    sim.step(delta);
    if (pointsRef.current) {
      pointsRef.current.visible = sim.isActive;
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={sim.geometry}
      material={material}
      visible={false}
    />
  );
}
