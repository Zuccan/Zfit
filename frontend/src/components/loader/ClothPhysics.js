const NX = 28; // Horizontal resolution
const NY = 32; // Vertical resolution
const TOTAL_PARTICLES = NX * NY;

const WIDTH = 6.8;
const HEIGHT = 4.2;
const DX = WIDTH / (NX - 1);
const DY = HEIGHT / (NY - 1);

// Initial vertical placement: ENTIRE fabric is suspended ABOVE the visible viewport (view top ~ 1.80)
const Y_BOTTOM = 1.86;
const Y_TOP = Y_BOTTOM + HEIGHT; // 6.06
const Z_PLANE = 0.22;            // Positioned in front of the tag (Z = 0) so it drops cleanly past

/**
 * ClothPhysics (V11.1)
 * High-Performance Particle-Based Verlet Cloth Simulation:
 * - Initially suspended ABOVE the camera viewport at Y in [1.86, 6.06]
 * - Does not obstruct the ZFITs tag or warm white studio background on initial load
 * - When released by tag pull, falls downward under gravity and sweeps through the scene
 * - Aerodynamic drag creates natural flowing silk folds, billows, and edge flutter
 * - Fully preallocated typed arrays for 60 FPS deterministic execution
 */
export class ClothPhysics {
  constructor(options = {}) {
    this.gravity = options.gravity || -14.0;
    this.damping = options.damping || 0.982;
    this.iterations = options.iterations || 4;

    this.isReleased = false;
    this.releaseStartTime = 0;
    this.isFullyExited = false;

    // Preallocated Typed Buffers
    this.positions = new Float32Array(TOTAL_PARTICLES * 3);
    this.oldPositions = new Float32Array(TOTAL_PARTICLES * 3);
    this.normals = new Float32Array(TOTAL_PARTICLES * 3);
    this.pinned = new Uint8Array(TOTAL_PARTICLES);
    this.releaseDelays = new Float32Array(NX);

    // Cascading release delay across the top edge (center releases first, outer edges micro-lag)
    for (let u = 0; u < NX; u++) {
      const centerDist = Math.abs(u - (NX - 1) / 2) / ((NX - 1) / 2);
      this.releaseDelays[u] = centerDist * 0.08; // 0s at center, 0.08s at corners
    }

    // Initialize particle grid positions above the viewport
    for (let v = 0; v < NY; v++) {
      for (let u = 0; u < NX; u++) {
        const idx = (v * NX + u) * 3;
        const x = -WIDTH / 2 + u * DX;
        const y = Y_BOTTOM + v * DY;
        const z = Z_PLANE + Math.sin(u * 0.5) * 0.03 * Math.cos(v * 0.4);

        this.positions[idx] = x;
        this.positions[idx + 1] = y;
        this.positions[idx + 2] = z;

        this.oldPositions[idx] = x;
        this.oldPositions[idx + 1] = y;
        this.oldPositions[idx + 2] = z;

        this.normals[idx] = 0;
        this.normals[idx + 1] = 0;
        this.normals[idx + 2] = 1;

        // Top row (v = NY - 1) is initially pinned above the viewport
        if (v === NY - 1) {
          this.pinned[v * NX + u] = 1;
        } else {
          this.pinned[v * NX + u] = 0;
        }
      }
    }

    // Build distance constraints: [idxA, idxB, restDistance]
    this.constraints = [];

    // 1. Structural Constraints (Horizontal & Vertical)
    for (let v = 0; v < NY; v++) {
      for (let u = 0; u < NX; u++) {
        const p = v * NX + u;
        if (u < NX - 1) {
          this.constraints.push(p, p + 1, DX);
        }
        if (v < NY - 1) {
          this.constraints.push(p, p + NX, DY);
        }
      }
    }

    // 2. Shear Constraints (Diagonals for authentic fabric stiffness)
    const diagDist = Math.sqrt(DX * DX + DY * DY);
    for (let v = 0; v < NY - 1; v++) {
      for (let u = 0; u < NX - 1; u++) {
        const p = v * NX + u;
        this.constraints.push(p, p + NX + 1, diagDist);
        this.constraints.push(p + 1, p + NX, diagDist);
      }
    }

    // 3. Bending Constraints (2-step neighbors for soft folds)
    for (let v = 0; v < NY; v++) {
      for (let u = 0; u < NX - 2; u++) {
        const p = v * NX + u;
        this.constraints.push(p, p + 2, DX * 2);
      }
    }
    for (let v = 0; v < NY - 2; v++) {
      for (let u = 0; u < NX; u++) {
        const p = v * NX + u;
        this.constraints.push(p, p + NX * 2, DY * 2);
      }
    }

    // Index buffer for standard Two-Sided Triangulated Grid
    const indices = [];
    for (let v = 0; v < NY - 1; v++) {
      for (let u = 0; u < NX - 1; u++) {
        const a = v * NX + u;
        const b = v * NX + (u + 1);
        const c = (v + 1) * NX + (u + 1);
        const d = (v + 1) * NX + u;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
    this.indices = new Uint16Array(indices);

    // UV coordinates
    const uvs = new Float32Array(TOTAL_PARTICLES * 2);
    for (let v = 0; v < NY; v++) {
      for (let u = 0; u < NX; u++) {
        const uvIdx = (v * NX + u) * 2;
        uvs[uvIdx] = u / (NX - 1);
        uvs[uvIdx + 1] = v / (NY - 1);
      }
    }
    this.uvs = uvs;
  }

  /**
   * Release top fabric pins to start the gravity drop
   */
  release() {
    if (this.isReleased) return;
    this.isReleased = true;
    this.releaseStartTime = performance.now() * 0.001;
  }

  /**
   * Advances simulation step
   */
  step(deltaTime, totalTime) {
    // If not released yet, fabric stays stationary above the viewport
    if (!this.isReleased) {
      return {
        isReleased: false,
        isFullyExited: false,
        highestY: Y_TOP,
        lowestY: Y_BOTTOM,
        topEdgeNormalized: 1.0,
      };
    }

    const dt = Math.min(0.024, Math.max(0.005, deltaTime));
    const dtSq = dt * dt;

    // Handle cascading release of top edge pins
    const elapsed = totalTime - this.releaseStartTime;
    const topRow = NY - 1;
    for (let u = 0; u < NX; u++) {
      if (this.pinned[topRow * NX + u] === 1 && elapsed >= this.releaseDelays[u]) {
        this.pinned[topRow * NX + u] = 0;
        const idx = (topRow * NX + u) * 3;
        this.positions[idx + 2] += 0.02;
        this.oldPositions[idx + 1] += 0.012;
      }
    }

    // 1. Verlet Integration + Aerodynamic Drag & Billow Forces
    const pos = this.positions;
    const old = this.oldPositions;
    const pinned = this.pinned;

    let highestY = -Infinity;
    let lowestY = Infinity;

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const idx = i * 3;

      if (pinned[i] === 1) {
        if (pos[idx + 1] > highestY) highestY = pos[idx + 1];
        if (pos[idx + 1] < lowestY) lowestY = pos[idx + 1];
        continue;
      }

      const cx = pos[idx];
      const cy = pos[idx + 1];
      const cz = pos[idx + 2];

      const vx = (cx - old[idx]) * this.damping;
      const vy = (cy - old[idx + 1]) * this.damping;
      const vz = (cz - old[idx + 2]) * this.damping;

      old[idx] = cx;
      old[idx + 1] = cy;
      old[idx + 2] = cz;

      // Aerodynamic billow forward as fabric drops through air
      const fallSpeed = Math.max(0, -vy);
      const az = fallSpeed * 1.5 + Math.sin(cy * 2.5 + totalTime * 6.0) * (fallSpeed * 0.7);
      const ax = Math.cos(cy * 2.0 + totalTime * 4.0) * (fallSpeed * 0.3);

      pos[idx] = cx + vx + ax * dtSq;
      pos[idx + 1] = cy + vy + this.gravity * dtSq;
      pos[idx + 2] = cz + vz + az * dtSq;

      if (pos[idx + 1] > highestY) highestY = pos[idx + 1];
      if (pos[idx + 1] < lowestY) lowestY = pos[idx + 1];
    }

    // 2. Relaxation Solver for Distance Constraints
    const constraints = this.constraints;
    const numConstraints = constraints.length / 3;

    for (let iter = 0; iter < this.iterations; iter++) {
      for (let c = 0; c < numConstraints; c++) {
        const cIdx = c * 3;
        const pA = constraints[cIdx];
        const pB = constraints[cIdx + 1];
        const rest = constraints[cIdx + 2];

        const idxA = pA * 3;
        const idxB = pB * 3;

        const dx = pos[idxB] - pos[idxA];
        const dy = pos[idxB + 1] - pos[idxA + 1];
        const dz = pos[idxB + 2] - pos[idxA + 2];

        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
        const diff = (dist - rest) / dist;

        const pinA = pinned[pA];
        const pinB = pinned[pB];

        if (pinA === 1 && pinB === 1) {
          // both pinned
        } else if (pinA === 1) {
          pos[idxB] -= dx * diff;
          pos[idxB + 1] -= dy * diff;
          pos[idxB + 2] -= dz * diff;
        } else if (pinB === 1) {
          pos[idxA] += dx * diff;
          pos[idxA + 1] += dy * diff;
          pos[idxA + 2] += dz * diff;
        } else {
          const half = diff * 0.5;
          pos[idxA] += dx * half;
          pos[idxA + 1] += dy * half;
          pos[idxA + 2] += dz * half;

          pos[idxB] -= dx * half;
          pos[idxB + 1] -= dy * half;
          pos[idxB + 2] -= dz * half;
        }
      }
    }

    // Check if fabric has completely exited past the bottom of the screen (view bottom ~ -0.90)
    if (highestY < -1.80) {
      this.isFullyExited = true;
    }

    // Normalized progress across the visible screen height (1.80 down to -1.80)
    const topEdgeNormalized = Math.max(0, Math.min(1, (highestY - (-1.80)) / (1.80 - (-1.80))));

    return {
      isReleased: this.isReleased,
      isFullyExited: this.isFullyExited,
      highestY,
      lowestY,
      topEdgeNormalized,
    };
  }
}
