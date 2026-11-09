import * as THREE from 'three';

const CLAMP = (val, min, max) => Math.min(Math.max(val, min), max);

export const INTERACTION_STATES = {
  IDLE: 'IDLE',
  DRAGGING: 'DRAGGING',
  TENSIONED: 'TENSIONED',
  DETACHED: 'DETACHED',
  FABRIC_RELEASED: 'FABRIC_RELEASED',
  HERO_REVEALED: 'HERO_REVEALED',
};

/**
 * UnifiedTagPhysics (V12)
 * Physical Breakaway Suspension & Freely Falling Tag Simulation:
 * - Upper attachment anchor at (0, 1.85, 0)
 * - 12-particle Verlet rope connecting anchor to fashion tag
 * - Tension threshold = 0.18 (~50px downward travel)
 * - Upon excessive tension:
 *   1. Upper connection snaps completely
 *   2. Node 0 unpins and recoils downward
 *   3. Entire rope + tag assembly plummets under gravity (g = -12.5 m/s²)
 *   4. Angular momentum and downward momentum are fully preserved
 *   5. Triggers thread fibers and immediate fabric drop
 */
export class UnifiedTagPhysics {
  constructor(options = {}) {
    this.pullThreshold = options.pullThreshold || 0.18;
    this.onBreakaway = options.onBreakaway || null;
    this.state = INTERACTION_STATES.IDLE;

    // --- 1. TOP SUSPENSION ANCHOR ---
    this.initialAnchorY = 1.85;
    this.anchorPos = new THREE.Vector3(0, this.initialAnchorY, 0);

    // Breakaway state
    this.isDetached = false;
    this.hasTriggered = false;

    // --- 2. VERLET SUSPENSION ROPE (12 nodes) ---
    this.numNodes = 12;
    this.totalRopeLength = 1.15; // Distance from ceiling to tag hole
    this.segmentLength = this.totalRopeLength / (this.numNodes - 1);
    this.ropeDamping = 0.965;
    this.iterations = 12;
    this.gravity = -12.5;

    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      const t = i / (this.numNodes - 1);
      const y = this.anchorPos.y - t * this.totalRopeLength;
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

    this.splinePoints = this.nodes.map(n => new THREE.Vector3(n.x, n.y, n.z));

    // --- 3. FASHION TAG ROTATION STATE ---
    this.rotation = {
      x: 0.04,  // Pitch
      y: 0.22,  // Yaw (full 360° unconstrained rotation)
      z: -0.03, // Roll
    };

    this.velocity = {
      x: 0.0,
      y: 0.55,
      z: -0.22,
    };

    this.inertia = {
      x: 0.36,
      y: 0.055, // Low Iy for agile 360° spinning
      z: 0.36,
    };

    this.stiffness = {
      x: 18.0,
      y: 0.50,
      z: 20.0,
    };

    this.damping = {
      x: 2.0,
      y: 0.18,
      z: 2.0,
    };

    // --- 4. DRAG & TENSION STATE ---
    this.dragTarget = null;
    this.grabbedStringNode = -1;
    this.stringGrabPos = new THREE.Vector3();
    this.dragLeverArm = { x: 0, y: -0.65, z: 0 };
    this.lastPointerPos = { x: 0, y: 0 };
    this.pointerVelocity = { x: 0, y: 0 };
    this.cardDragOffset = new THREE.Vector3();

    this.dragStartTime = 0;
    this.startClientX = 0;
    this.startClientY = 0;
    this.screenDx = 0;
    this.pullPixels = 0;
    this.currentPullY = 0;
    this.maxPullY = 0;
    this.isTriggerReady = false;
    this.isLocked = false;
  }

  /**
   * Break the upper suspension anchor connection
   */
  triggerBreakaway() {
    if (this.isDetached) return;

    this.isDetached = true;
    this.hasTriggered = true;
    this.dragTarget = null;
    this.isLocked = true;
    this.state = INTERACTION_STATES.DETACHED;

    // 1. Recoil impulse at the break point: top nodes whip downwards
    this.nodes[0].oldY = this.nodes[0].y + 0.06; // Downward initial velocity
    this.nodes[0].oldX = this.nodes[0].x + (Math.random() - 0.5) * 0.04;
    this.nodes[1].oldY = this.nodes[1].y + 0.04;

    // 2. Tag preserves downward momentum from the pull
    const bottomNode = this.nodes[this.numNodes - 1];
    const downwardImpulse = Math.min(-0.04, -this.pointerVelocity.y * 0.0035 - 0.03);
    bottomNode.oldY = bottomNode.y - downwardImpulse;

    // 3. Impart tumbling angular momentum
    this.velocity.y += (Math.random() - 0.5) * 4.5;
    this.velocity.z += (Math.random() - 0.5) * 2.5;
    this.velocity.x += (Math.random() - 0.5) * 1.5;

    // 4. Notify scene of breakaway
    if (this.onBreakaway) {
      this.onBreakaway({
        anchorPos: { x: this.anchorPos.x, y: this.anchorPos.y, z: this.anchorPos.z },
        velocity: this.velocity,
      });
    }
  }

  /**
   * Pointer grabbed card
   */
  startCardDrag(clientX, clientY, localHitPoint = null) {
    if (this.isLocked || this.isDetached) return;

    this.dragTarget = 'CARD';
    this.state = INTERACTION_STATES.DRAGGING;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;
    this.startClientX = clientX;
    this.startClientY = clientY;
    this.dragStartTime = performance.now();
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
    this.pullPixels = 0;
    this.currentPullY = 0;
    this.maxPullY = 0;
    this.isTriggerReady = false;
  }

  /**
   * Pointer grabbed string
   */
  startStringDrag(hitPoint, clientX, clientY) {
    if (this.isLocked || this.isDetached) return;

    this.dragTarget = 'STRING';
    this.state = INTERACTION_STATES.DRAGGING;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;
    this.startClientX = clientX;
    this.startClientY = clientY;
    this.dragStartTime = performance.now();
    this.pointerVelocity.x = 0;
    this.pointerVelocity.y = 0;

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
    this.pullPixels = 0;
    this.currentPullY = 0;
    this.maxPullY = 0;
    this.isTriggerReady = false;
  }

  /**
   * Update active drag and track tension
   */
  updateDrag(clientX, clientY, deltaWorldX, deltaWorldY) {
    if (this.isLocked || this.isDetached || !this.dragTarget) return;

    const pvx = clientX - this.lastPointerPos.x;
    const pvy = clientY - this.lastPointerPos.y;
    this.pointerVelocity.x = this.pointerVelocity.x * 0.35 + pvx * 0.65;
    this.pointerVelocity.y = this.pointerVelocity.y * 0.35 + pvy * 0.65;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;

    const screenDx = clientX - this.startClientX;
    const screenDy = clientY - this.startClientY;
    this.screenDx = screenDx;

    if (this.dragTarget === 'CARD') {
      const bottomNode = this.nodes[this.numNodes - 1];
      bottomNode.x = this.cardDragOffset.x + deltaWorldX;
      bottomNode.y = this.cardDragOffset.y + deltaWorldY;
      bottomNode.z = this.cardDragOffset.z - deltaWorldY * 0.15;

      // Downward pull & tension measurement
      if (screenDy > 10) {
        this.pullPixels = screenDy;
        const worldPull = Math.max(0, -deltaWorldY);
        const pixelPull = Math.max(0, screenDy * 0.0035);
        this.currentPullY = Math.max(worldPull, pixelPull);
        this.maxPullY = Math.max(this.maxPullY, this.currentPullY);

        const tensionRatio = this.currentPullY / this.pullThreshold;
        if (tensionRatio >= 0.70) {
          this.state = INTERACTION_STATES.TENSIONED;
        } else {
          this.state = INTERACTION_STATES.DRAGGING;
        }

        // Breakaway threshold reached!
        if (this.currentPullY >= this.pullThreshold) {
          this.isTriggerReady = true;
          this.triggerBreakaway();
          return;
        }
      } else {
        this.pullPixels = 0;
        this.currentPullY = 0;
        this.state = INTERACTION_STATES.DRAGGING;
      }

      // Torques τ = r × F
      const rx = this.dragLeverArm.x;
      const ry = this.dragLeverArm.y;
      const rz = this.dragLeverArm.z;
      const fx = deltaWorldX * 36.0;
      const fy = deltaWorldY * 36.0;
      const fz = -deltaWorldY * 10.0;

      const tauX = ry * fz - rz * fy;
      const tauY = rz * fx - rx * fz - rx * fy * 1.5;
      const tauZ = rx * fy - ry * fx;

      this.velocity.x += (tauX / this.inertia.x) * 0.016;
      this.velocity.y += (tauY / this.inertia.y) * 0.016;
      this.velocity.z += (tauZ / this.inertia.z) * 0.016;

    } else if (this.dragTarget === 'STRING' && this.grabbedStringNode > 0) {
      const node = this.nodes[this.grabbedStringNode];
      node.x = this.stringGrabPos.x + deltaWorldX;
      node.y = this.stringGrabPos.y + deltaWorldY;
      node.z = this.stringGrabPos.z;

      if (screenDy > 15) {
        this.pullPixels = screenDy;
        this.currentPullY = Math.max(0, screenDy * 0.0035);
        this.maxPullY = Math.max(this.maxPullY, this.currentPullY);

        if (this.currentPullY / this.pullThreshold >= 0.70) {
          this.state = INTERACTION_STATES.TENSIONED;
        }

        if (this.currentPullY >= this.pullThreshold) {
          this.isTriggerReady = true;
          this.triggerBreakaway();
          return;
        }
      }
    }
  }

  /**
   * Pointer released
   */
  release() {
    if (this.isLocked || this.isDetached || !this.dragTarget) return false;

    const wasCard = this.dragTarget === 'CARD';
    const wasDeliberatePull = this.isTriggerReady || this.maxPullY >= this.pullThreshold;

    this.dragTarget = null;
    this.grabbedStringNode = -1;
    this.pullPixels = 0;
    this.screenDx = 0;
    this.currentPullY = 0;

    if (wasDeliberatePull) {
      this.triggerBreakaway();
      return true;
    }

    if (wasCard) {
      const bottomNode = this.nodes[this.numNodes - 1];
      const vx = this.pointerVelocity.x * 0.0035;
      const vy = -this.pointerVelocity.y * 0.0035;

      bottomNode.oldX = bottomNode.x - vx;
      bottomNode.oldY = bottomNode.y - vy;

      const rx = this.dragLeverArm.x;
      const ry = this.dragLeverArm.y;
      this.velocity.z += CLAMP((-ry * vx + rx * vy) * 36.0, -16, 16);
      this.velocity.y += CLAMP((rx * -vy * 58.0) + (vx * 26.0), -32, 32);
      this.velocity.x += CLAMP(vy * 26.0, -12, 12);

      this.state = Math.abs(this.velocity.y) > 2.0 ? 'FREE_SPIN' : 'FREE_SWING';
    } else {
      this.state = 'FREE_SWING';
    }

    return false;
  }

  /**
   * Advances simulation step
   */
  step(deltaTime, totalTime) {
    const dt = Math.min(0.025, Math.max(0.004, deltaTime));
    const dtSq = dt * dt;

    if (!this.isDetached) {
      // --- A. INTACT STATE: NODE 0 IS PINNED TO ANCHOR BRACKET ---
      let anchorY = this.initialAnchorY;
      if (this.dragTarget === 'CARD' && this.currentPullY > 0) {
        // Microscopic physical strain at anchor bracket before break (max 2mm)
        anchorY -= Math.min(0.025, this.currentPullY * 0.05);
      }
      this.anchorPos.y = anchorY;

      this.nodes[0].x = this.anchorPos.x;
      this.nodes[0].y = this.anchorPos.y;
      this.nodes[0].z = this.anchorPos.z;

      // Step nodes 1 to numNodes - 1
      for (let i = 1; i < this.numNodes; i++) {
        if (this.dragTarget === 'STRING' && i === this.grabbedStringNode) continue;
        if (this.dragTarget === 'CARD' && i === this.numNodes - 1) continue;

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

      // Solve distance constraints with Node 0 pinned
      for (let iter = 0; iter < this.iterations; iter++) {
        this.nodes[0].x = this.anchorPos.x;
        this.nodes[0].y = this.anchorPos.y;
        this.nodes[0].z = this.anchorPos.z;

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
            // both fixed
          } else if (isP1Fixed) {
            p2.x -= dx * diff;
            p2.y -= dy * diff;
            p2.z -= dz * diff;
          } else if (isP2Fixed) {
            p1.x += dx * diff;
            p1.y += dy * diff;
            p1.z += dz * diff;
          } else {
            const half = diff * 0.5;
            p1.x += dx * half;
            p1.y += dy * half;
            p1.z += dz * half;
            p2.x -= dx * half;
            p2.y -= dy * half;
            p2.z -= dz * half;
          }
        }
      }

    } else {
      // --- B. DETACHED BREAKAWAY STATE: ALL NODES (0 TO 11) FALL FREELY UNDER GRAVITY ---
      for (let i = 0; i < this.numNodes; i++) {
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

      // Solve distance constraints with ALL nodes free to move and whip
      for (let iter = 0; iter < this.iterations; iter++) {
        for (let i = 0; i < this.numNodes - 1; i++) {
          const p1 = this.nodes[i];
          const p2 = this.nodes[i + 1];

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dz = p2.z - p1.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
          const diff = (dist - this.segmentLength) / dist;

          const half = diff * 0.5;
          p1.x += dx * half;
          p1.y += dy * half;
          p1.z += dz * half;

          p2.x -= dx * half;
          p2.y -= dy * half;
          p2.z -= dz * half;
        }
      }
    }

    // Update Catmull-Rom spline points for rope tube mesh
    for (let i = 0; i < this.numNodes; i++) {
      this.splinePoints[i].set(this.nodes[i].x, this.nodes[i].y, this.nodes[i].z);
    }

    // Step tag angular orientation
    let idleTorqueY = 0;
    let idleTorqueZ = 0;
    if (!this.dragTarget && !this.isDetached) {
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

    if (!this.isDetached) {
      this.rotation.x = CLAMP(this.rotation.x, -1.2, 1.2);
      this.rotation.z = CLAMP(this.rotation.z, -1.3, 1.3);
    }

    const bottomNode = this.nodes[this.numNodes - 1];
    const cardPosition = {
      x: bottomNode.x,
      y: bottomNode.y,
      z: bottomNode.z,
    };

    const pullProgress = CLAMP(this.currentPullY / this.pullThreshold, 0, 1);
    const isTensionHigh = pullProgress >= 0.70;

    return {
      anchorPos: this.anchorPos,
      cardPosition,
      rotation: this.rotation,
      splinePoints: this.splinePoints,
      pullPixels: this.pullPixels,
      screenDx: this.screenDx,
      currentPullY: this.currentPullY,
      maxPullY: this.maxPullY,
      pullProgress,
      isTensionHigh,
      isTriggerReady: this.isTriggerReady,
      isDetached: this.isDetached,
      state: this.state,
    };
  }
}
