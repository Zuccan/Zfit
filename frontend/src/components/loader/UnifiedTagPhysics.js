import * as THREE from 'three';

const CLAMP = (val, min, max) => Math.min(Math.max(val, min), max);

export const INTERACTION_STATES = {
  INITIALIZING: 'INITIALIZING',
  IDLE: 'IDLE',
  CARD_GRABBED: 'CARD_GRABBED',
  STRING_GRABBED: 'STRING_GRABBED',
  DRAGGING: 'DRAGGING',
  FREE_SWING: 'FREE_SWING',
  FREE_SPIN: 'FREE_SPIN',
  SETTLING: 'SETTLING',
  ENTERING_HERO: 'ENTERING_HERO',
  COMPLETED: 'COMPLETED',
};

/**
 * UnifiedTagPhysics
 * Unified coupled Verlet rope and lightweight paperboard hang tag simulation:
 * - 12-particle dynamic Verlet rope with distance relaxation constraints
 * - Fixed ceiling anchor at node 0: (0, 2.15, 0)
 * - Bottom node (Node 11) is the card's punched eyelet
 * - Calibrated for ultra-thin lightweight paperboard (low inertia, crisp agile rotational response)
 * - Full 360° unconstrained rotation on yaw with momentum preservation
 * - True torque: τ = r × F (corner dragging produces distinct rotational responses)
 * - Deliberate downward pull detection (threshold 0.42 world units) to enter hero
 */
export class UnifiedTagPhysics {
  constructor(options = {}) {
    this.pullThreshold = options.pullThreshold || 0.42;
    this.state = INTERACTION_STATES.INITIALIZING;

    // Ceiling Anchor (fixed)
    this.ceilingY = options.ceilingY || 2.15;
    this.ceilingAnchor = new THREE.Vector3(0, this.ceilingY, 0);

    this.numNodes = 12;
    this.totalRopeLength = 1.55;
    this.segmentLength = this.totalRopeLength / (this.numNodes - 1);
    this.ropeDamping = 0.965;
    this.iterations = 12;
    this.gravity = -9.8;

    // Particles: Node 0 = ceiling, Node 11 = card eyelet
    // Lightweight paperboard mass (0.14) gives authentic paper suspension physics
    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      const t = i / (this.numNodes - 1);
      const y = this.ceilingAnchor.y - t * this.totalRopeLength;
      this.nodes.push({
        x: 0,
        y,
        z: 0,
        oldX: 0,
        oldY: y,
        oldZ: 0,
        mass: i === this.numNodes - 1 ? 0.14 : 0.05,
      });
    }

    // Spline points for Catmull-Rom tube geometry
    this.splinePoints = this.nodes.map(n => new THREE.Vector3(n.x, n.y, n.z));

    // Card 3D Angular Orientation
    // Subtle initial 3D pose so razor-thin edge and lighting are visible immediately
    this.rotation = {
      x: 0.04,  // Pitch (tilt forward/back)
      y: 0.24,  // Yaw (full 360° rotational twist around cord)
      z: -0.03, // Roll (pendulum sway)
    };

    // Angular velocities (rad/s)
    this.velocity = {
      x: 0.0,
      y: 0.60,  // Gentle initial physical spin
      z: -0.25, // Gentle initial sway
    };

    // Card moments of inertia calibrated for lightweight paperboard
    this.inertia = {
      x: 0.36,
      y: 0.055, // Low Iy allows agile, effortless 360° multi-turn spinning
      z: 0.36,
    };

    // Restoring spring stiffness constants
    this.stiffness = {
      x: 20.0, // Pitch restoration (gravity keeps card hanging down)
      y: 0.55, // Very light torsional cord twist stiffness allowing multi-turn 360° spins!
      z: 22.0, // Roll restoration (gravity keeps card centered)
    };

    // Damping coefficients (air resistance + cord hinge friction)
    this.damping = {
      x: 2.2,
      y: 0.20, // Very light yaw damping so spins carry through multiple full revolutions
      z: 2.2,
    };

    // Drag interaction
    this.dragTarget = null; // 'CARD' or 'STRING'
    this.grabbedStringNode = -1;
    this.stringGrabPos = new THREE.Vector3();
    this.dragLeverArm = { x: 0, y: -0.65, z: 0 };
    this.lastPointerPos = { x: 0, y: 0 };
    this.pointerVelocity = { x: 0, y: 0 };
    this.cardDragOffset = new THREE.Vector3();

    // Pull tracking for hero transition (reset per drag action)
    this.currentPullY = 0;
    this.maxPullY = 0;
  }

  /**
   * Card grabbed at pointer position
   */
  startCardDrag(clientX, clientY, localHitPoint = null) {
    this.dragTarget = 'CARD';
    this.state = INTERACTION_STATES.CARD_GRABBED;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;
    this.pointerVelocity.x = 0;
    this.pointerVelocity.y = 0;

    if (localHitPoint) {
      this.dragLeverArm.x = CLAMP(localHitPoint.x, -0.34, 0.34);
      this.dragLeverArm.y = CLAMP(localHitPoint.y, -1.36, -0.05);
      this.dragLeverArm.z = localHitPoint.z || 0;
    } else {
      this.dragLeverArm.x = 0;
      this.dragLeverArm.y = -0.65;
      this.dragLeverArm.z = 0;
    }

    const bottomNode = this.nodes[this.numNodes - 1];
    this.cardDragOffset.set(bottomNode.x, bottomNode.y, bottomNode.z);
    this.currentPullY = 0;
    this.maxPullY = 0;
  }

  /**
   * String grabbed at world hit position
   */
  startStringDrag(hitPoint, clientX, clientY) {
    this.dragTarget = 'STRING';
    this.state = INTERACTION_STATES.STRING_GRABBED;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;
    this.pointerVelocity.x = 0;
    this.pointerVelocity.y = 0;

    // Find closest interior rope node
    let closestIndex = 1;
    let minDistSq = Infinity;
    for (let i = 1; i < this.numNodes - 1; i++) {
      const node = this.nodes[i];
      const dx = node.x - hitPoint.x;
      const dy = node.y - hitPoint.y;
      const dz = node.z - hitPoint.z;
      const dSq = dx * dx + dy * dy + dz * dz;
      if (dSq < minDistSq) {
        minDistSq = dSq;
        closestIndex = i;
      }
    }

    this.grabbedStringNode = closestIndex;
    this.stringGrabPos.copy(hitPoint);
    this.currentPullY = 0;
    this.maxPullY = 0;
  }

  /**
   * Update active drag
   */
  updateDrag(clientX, clientY, deltaWorldX, deltaWorldY) {
    if (!this.dragTarget) return;
    this.state = INTERACTION_STATES.DRAGGING;

    const pvx = clientX - this.lastPointerPos.x;
    const pvy = clientY - this.lastPointerPos.y;
    this.pointerVelocity.x = this.pointerVelocity.x * 0.35 + pvx * 0.65;
    this.pointerVelocity.y = this.pointerVelocity.y * 0.35 + pvy * 0.65;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;

    if (this.dragTarget === 'CARD') {
      const bottomNode = this.nodes[this.numNodes - 1];
      // Move bottom attachment particle of the rope directly with cursor
      bottomNode.x = this.cardDragOffset.x + deltaWorldX;
      bottomNode.y = this.cardDragOffset.y + deltaWorldY;
      bottomNode.z = this.cardDragOffset.z - deltaWorldY * 0.15;

      // Track downward pull for hero reveal
      if (deltaWorldY < 0) {
        this.currentPullY = -deltaWorldY;
        this.maxPullY = Math.max(this.maxPullY, this.currentPullY);
      }

      // Compute torque applied to the card: τ = r × F
      const rx = this.dragLeverArm.x;
      const ry = this.dragLeverArm.y;
      const rz = this.dragLeverArm.z;
      const fx = deltaWorldX * 36.0;
      const fy = deltaWorldY * 36.0;
      const fz = -deltaWorldY * 10.0;

      const tauX = ry * fz - rz * fy;
      // Twist (Y-axis): pulling on the left (rx < 0) vs right (rx > 0) creates opposite yaw torque!
      const tauY = rz * fx - rx * fz - rx * fy * 1.5;
      const tauZ = rx * fy - ry * fx;

      this.velocity.x += (tauX / this.inertia.x) * 0.016;
      this.velocity.y += (tauY / this.inertia.y) * 0.016;
      this.velocity.z += (tauZ / this.inertia.z) * 0.016;

    } else if (this.dragTarget === 'STRING' && this.grabbedStringNode > 0) {
      // Move grabbed rope node with pointer
      const node = this.nodes[this.grabbedStringNode];
      node.x = this.stringGrabPos.x + deltaWorldX;
      node.y = this.stringGrabPos.y + deltaWorldY;
      node.z = this.stringGrabPos.z;
    }
  }

  /**
   * Pointer released: preserve momentum on both rope and card
   */
  release() {
    if (!this.dragTarget) return false;

    const wasCard = this.dragTarget === 'CARD';
    // Deliberate pull threshold: only downward pull past threshold triggers hero
    const wasDeliberatePull = wasCard && (this.maxPullY >= this.pullThreshold);

    this.dragTarget = null;
    this.grabbedStringNode = -1;
    this.currentPullY = 0;
    this.maxPullY = 0;

    if (wasDeliberatePull) {
      this.state = INTERACTION_STATES.ENTERING_HERO;
      return true;
    }

    if (wasCard) {
      // Transfer pointer release velocity to bottom node and card rotation
      const bottomNode = this.nodes[this.numNodes - 1];
      const vx = this.pointerVelocity.x * 0.0035;
      const vy = -this.pointerVelocity.y * 0.0035;

      bottomNode.oldX = bottomNode.x - vx;
      bottomNode.oldY = bottomNode.y - vy;

      // Angular impulse calibrated for lightweight paperboard
      const rx = this.dragLeverArm.x;
      const ry = this.dragLeverArm.y;
      this.velocity.z += CLAMP((-ry * vx + rx * vy) * 36.0, -16, 16);
      this.velocity.y += CLAMP((rx * -vy * 58.0) + (vx * 26.0), -32, 32);
      this.velocity.x += CLAMP(vy * 26.0, -12, 12);

      if (Math.abs(this.velocity.y) > 2.0) {
        this.state = INTERACTION_STATES.FREE_SPIN;
      } else {
        this.state = INTERACTION_STATES.FREE_SWING;
      }
    } else {
      this.state = INTERACTION_STATES.FREE_SWING;
    }

    return false;
  }

  /**
   * Advances simulation step
   */
  step(deltaTime, totalTime) {
    const dt = Math.min(0.025, Math.max(0.004, deltaTime));
    const dtSq = dt * dt;

    // 1. Step Verlet Rope Nodes
    for (let i = 1; i < this.numNodes; i++) {
      // Pin grabbed node during drag
      if (this.dragTarget === 'STRING' && i === this.grabbedStringNode) {
        continue;
      }
      // Pin bottom node during card drag
      if (this.dragTarget === 'CARD' && i === this.numNodes - 1) {
        continue;
      }

      const node = this.nodes[i];
      const vx = (node.x - node.oldX) * this.ropeDamping;
      const vy = (node.y - node.oldY) * this.ropeDamping;
      const vz = (node.z - node.oldZ) * this.ropeDamping;

      node.oldX = node.x;
      node.oldY = node.y;
      node.oldZ = node.z;

      node.x += vx;
      node.y += vy + this.gravity * dtSq;
      node.z += vz;
    }

    // 2. Solve Distance Constraints iteratively (Relaxation)
    for (let iter = 0; iter < this.iterations; iter++) {
      // Pin ceiling anchor
      this.nodes[0].x = this.ceilingAnchor.x;
      this.nodes[0].y = this.ceilingAnchor.y;
      this.nodes[0].z = this.ceilingAnchor.z;

      for (let i = 0; i < this.numNodes - 1; i++) {
        const p1 = this.nodes[i];
        const p2 = this.nodes[i + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
        const diff = (dist - this.segmentLength) / dist;

        const isP1Fixed = i === 0 || (this.dragTarget === 'STRING' && i === this.grabbedStringNode);
        const isP2Fixed =
          (this.dragTarget === 'STRING' && i + 1 === this.grabbedStringNode) ||
          (this.dragTarget === 'CARD' && i + 1 === this.numNodes - 1);

        if (isP1Fixed && isP2Fixed) {
          // both fixed, skip
        } else if (isP1Fixed) {
          p2.x -= dx * diff;
          p2.y -= dy * diff;
          p2.z -= dz * diff;
        } else if (isP2Fixed) {
          p1.x += dx * diff;
          p1.y += dy * diff;
          p1.z += dz * diff;
        } else {
          const m1 = p1.mass;
          const m2 = p2.mass;
          const totalM = m1 + m2;
          const f1 = m2 / totalM;
          const f2 = m1 / totalM;

          p1.x += dx * diff * f1;
          p1.y += dy * diff * f1;
          p1.z += dz * diff * f1;
          p2.x -= dx * diff * f2;
          p2.y -= dy * diff * f2;
          p2.z -= dz * diff * f2;
        }
      }
    }

    // 3. Update Spline Points for Rope Rendering
    for (let i = 0; i < this.numNodes; i++) {
      this.splinePoints[i].set(this.nodes[i].x, this.nodes[i].y, this.nodes[i].z);
    }

    // 4. Step Card Angular Rotation
    let idleTorqueY = 0;
    let idleTorqueZ = 0;
    if (!this.dragTarget) {
      idleTorqueY = Math.sin(totalTime * 0.73) * 0.05 + Math.cos(totalTime * 1.37) * 0.025;
      idleTorqueZ = Math.sin(totalTime * 0.91) * 0.07 + Math.cos(totalTime * 1.63) * 0.025;
    }

    const tauTotalX = -this.stiffness.x * Math.sin(this.rotation.x) - this.damping.x * this.velocity.x;
    const tauTotalY = -this.stiffness.y * this.rotation.y + idleTorqueY - this.damping.y * this.velocity.y;
    const tauTotalZ = -this.stiffness.z * Math.sin(this.rotation.z) + idleTorqueZ - this.damping.z * this.velocity.z;

    const alphaX = tauTotalX / this.inertia.x;
    const alphaY = tauTotalY / this.inertia.y;
    const alphaZ = tauTotalZ / this.inertia.z;

    this.velocity.x += alphaX * dt;
    this.velocity.y += alphaY * dt;
    this.velocity.z += alphaZ * dt;

    this.rotation.x += this.velocity.x * dt;
    this.rotation.y += this.velocity.y * dt; // Full 360° unconstrained rotation
    this.rotation.z += this.velocity.z * dt;

    this.rotation.x = CLAMP(this.rotation.x, -1.2, 1.2);
    this.rotation.z = CLAMP(this.rotation.z, -1.3, 1.3);

    // Position of the card's punched hole is EXACTLY bottom node of the rope
    const bottomNode = this.nodes[this.numNodes - 1];
    const cardPosition = {
      x: bottomNode.x,
      y: bottomNode.y,
      z: bottomNode.z,
    };

    const isTensionHigh = this.maxPullY >= this.pullThreshold * 0.75;

    return {
      cardPosition,
      rotation: this.rotation,
      splinePoints: this.splinePoints,
      isTensionHigh,
      state: this.state,
    };
  }
}
