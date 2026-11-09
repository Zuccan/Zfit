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
 * UnifiedTagPhysics (V8)
 * Physically Coupled Header + Rope + Tag Breakaway Simulation:
 * - Rigid full-width ivory header panel with realistic mass and inertia
 * - 12-particle dynamic Verlet rope with distance relaxation constraints
 * - Upper rope end (Node 0) is physically attached to the underside bracket of the header panel
 * - Lower rope end (Node 11) is physically attached to the fashion tag
 * - Initially, the header panel is held by a breakaway constraint at the ceiling
 * - User pulling the tag creates genuine physical tension
 * - Strong deliberate downward pull releases the breakaway constraint
 * - The entire assembly (Header + Rope + Tag) falls together under real gravity (g = -9.8 m/s²)
 */
export class UnifiedTagPhysics {
  constructor(options = {}) {
    this.pullThreshold = options.pullThreshold || 0.40;
    this.onAssemblyExit = options.onAssemblyExit || null;
    this.state = INTERACTION_STATES.INITIALIZING;

    // --- 1. HEADER PANEL PHYSICAL RIGID-BODY ---
    this.initialHeaderY = 1.64;
    this.headerHeight = 0.34;
    this.headerDepth = 0.04;
    this.headerPos = new THREE.Vector3(0, this.initialHeaderY, 0);
    this.headerVel = new THREE.Vector3(0, 0, 0);
    this.headerRot = new THREE.Vector3(0, 0, 0);
    this.headerRotVel = new THREE.Vector3(0, 0, 0);
    this.headerMass = 2.4;
    this.headerState = 'FIXED'; // 'FIXED', 'FALLING', 'EXITED'
    this.hasTriggeredExit = false;

    // Underside attachment bracket in world coordinates
    this.anchorWorld = new THREE.Vector3(0, this.initialHeaderY - this.headerHeight / 2, 0);

    // --- 2. SUSPENSION ROPE PARTICLES ---
    this.numNodes = 12;
    this.totalRopeLength = 1.05; // Distance from header bracket to tag hole
    this.segmentLength = this.totalRopeLength / (this.numNodes - 1);
    this.ropeDamping = 0.965;
    this.iterations = 12;
    this.gravity = -9.8;

    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      const t = i / (this.numNodes - 1);
      const y = this.anchorWorld.y - t * this.totalRopeLength;
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

    // --- 3. FASHION TAG ANGULAR STATE ---
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
      y: 0.055, // Low Iy for agile, graceful 360° spinning
      z: 0.36,
    };

    this.stiffness = {
      x: 20.0,
      y: 0.55,
      z: 22.0,
    };

    this.damping = {
      x: 2.2,
      y: 0.20,
      z: 2.2,
    };

    // --- 4. INTERACTION STATE ---
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
   * Releases the header breakaway constraint, allowing the entire assembly
   * (Header -> Rope -> Tag) to accelerate downward under genuine gravity.
   */
  triggerBreakaway() {
    if (this.headerState === 'FALLING') return;

    this.headerState = 'FALLING';
    this.dragTarget = null;
    this.isLocked = true;
    this.state = INTERACTION_STATES.ENTERING_HERO;

    // Impart initial downward impulse from the user's release pull
    this.headerVel.y = -0.9;
    this.headerRotVel.z = (Math.random() - 0.5) * 0.7;
    this.headerRotVel.x = (Math.random() - 0.5) * 0.3;

    // Preserved angular velocity on the tag
    this.velocity.y += (Math.random() - 0.5) * 4.0;
  }

  /**
   * Card grabbed at pointer position
   */
  startCardDrag(clientX, clientY, localHitPoint = null) {
    if (this.isLocked) return;

    this.dragTarget = 'CARD';
    this.state = INTERACTION_STATES.CARD_GRABBED;
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
   * String grabbed at world hit position
   */
  startStringDrag(hitPoint, clientX, clientY) {
    if (this.isLocked) return;

    this.dragTarget = 'STRING';
    this.state = INTERACTION_STATES.STRING_GRABBED;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;
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
   * Update active drag
   */
  updateDrag(clientX, clientY, deltaWorldX, deltaWorldY) {
    if (this.isLocked || !this.dragTarget) return;
    this.state = INTERACTION_STATES.DRAGGING;

    const pvx = clientX - this.lastPointerPos.x;
    const pvy = clientY - this.lastPointerPos.y;
    this.pointerVelocity.x = this.pointerVelocity.x * 0.35 + pvx * 0.65;
    this.pointerVelocity.y = this.pointerVelocity.y * 0.35 + pvy * 0.65;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;

    if (this.dragTarget === 'CARD') {
      const bottomNode = this.nodes[this.numNodes - 1];
      bottomNode.x = this.cardDragOffset.x + deltaWorldX;
      bottomNode.y = this.cardDragOffset.y + deltaWorldY;
      bottomNode.z = this.cardDragOffset.z - deltaWorldY * 0.15;

      const screenDx = clientX - this.startClientX;
      const screenDy = clientY - this.startClientY;
      this.screenDx = screenDx;

      // Downward pull detection
      if (screenDy > 10 && screenDy > Math.abs(screenDx) * 0.75) {
        this.pullPixels = screenDy;
        this.currentPullY = Math.max(0, -deltaWorldY);
        this.maxPullY = Math.max(this.maxPullY, this.currentPullY);

        const pullDuration = performance.now() - this.dragStartTime;
        // Breakaway condition reached!
        if (this.currentPullY >= this.pullThreshold && pullDuration >= 80) {
          this.isTriggerReady = true;
          this.triggerBreakaway();
          return;
        }
      } else {
        this.pullPixels = 0;
        this.currentPullY = 0;
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
    }
  }

  /**
   * Pointer released
   */
  release() {
    if (this.isLocked || !this.dragTarget) return false;

    const wasCard = this.dragTarget === 'CARD';
    const wasDeliberatePull = wasCard && (this.isTriggerReady || this.maxPullY >= this.pullThreshold);

    this.dragTarget = null;
    this.grabbedStringNode = -1;
    this.pullPixels = 0;
    this.screenDx = 0;
    this.currentPullY = 0;
    this.maxPullY = 0;
    this.isTriggerReady = false;

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

    // --- A. STEP HEADER RIGID-BODY ---
    if (this.headerState === 'FALLING') {
      // True physical gravity integration
      this.headerVel.y += this.gravity * dt;
      this.headerPos.y += this.headerVel.y * dt;
      this.headerPos.x += this.headerVel.x * dt;

      // Angular momentum & slight tilt
      this.headerRot.z += this.headerRotVel.z * dt;
      this.headerRot.x += this.headerRotVel.x * dt;
      this.headerRotVel.z *= 0.99;
      this.headerRotVel.x *= 0.99;

      // Check if complete assembly has fallen out of viewport
      if (this.headerPos.y < -1.65 && !this.hasTriggeredExit) {
        this.hasTriggeredExit = true;
        this.headerState = 'EXITED';
        if (this.onAssemblyExit) {
          this.onAssemblyExit();
        }
      }
    } else {
      // While FIXED: respond with subtle physical strain if card is being pulled down
      if (this.dragTarget === 'CARD' && this.currentPullY > 0) {
        const strainY = Math.min(0.045, this.currentPullY * 0.08);
        this.headerPos.y = this.initialHeaderY - strainY;
        this.headerRot.z = (this.screenDx / 350) * 0.015;
      } else {
        // Return smoothly to rest position
        this.headerPos.y += (this.initialHeaderY - this.headerPos.y) * 0.15;
        this.headerRot.z += (0 - this.headerRot.z) * 0.15;
      }
    }

    // --- B. UPDATE UNDERSIDE ANCHOR POINT ---
    // The bracket is at (0, -headerHeight/2, 0) relative to the header center
    const localBracket = new THREE.Vector3(0, -this.headerHeight / 2, 0);
    const euler = new THREE.Euler(this.headerRot.x, this.headerRot.y, this.headerRot.z);
    localBracket.applyEuler(euler);
    this.anchorWorld.copy(this.headerPos).add(localBracket);

    // Pin Node 0 of the rope directly to the header bracket! ZERO GAP!
    this.nodes[0].x = this.anchorWorld.x;
    this.nodes[0].y = this.anchorWorld.y;
    this.nodes[0].z = this.anchorWorld.z;

    // --- C. STEP VERLET ROPE NODES (1 to numNodes - 1) ---
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

    // --- D. SOLVE DISTANCE CONSTRAINTS (RELAXATION) ---
    for (let iter = 0; iter < this.iterations; iter++) {
      // Re-pin upper anchor (Node 0) to the header bracket
      this.nodes[0].x = this.anchorWorld.x;
      this.nodes[0].y = this.anchorWorld.y;
      this.nodes[0].z = this.anchorWorld.z;

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

    // --- E. UPDATE CATMULL-ROM SPLINE POINTS FOR ROPE MESH ---
    for (let i = 0; i < this.numNodes; i++) {
      this.splinePoints[i].set(this.nodes[i].x, this.nodes[i].y, this.nodes[i].z);
    }

    // --- F. STEP TAG ANGULAR ORIENTATION ---
    let idleTorqueY = 0;
    let idleTorqueZ = 0;
    if (!this.dragTarget && this.headerState !== 'FALLING') {
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

    const bottomNode = this.nodes[this.numNodes - 1];
    const cardPosition = {
      x: bottomNode.x,
      y: bottomNode.y,
      z: bottomNode.z,
    };

    const pullProgress = CLAMP(this.currentPullY / this.pullThreshold, 0, 1);
    const isTensionHigh = pullProgress >= 0.75;

    return {
      headerPos: this.headerPos,
      headerRot: this.headerRot,
      cardPosition,
      rotation: this.rotation,
      splinePoints: this.splinePoints,
      pullPixels: this.pullPixels,
      screenDx: this.screenDx,
      pullProgress,
      isTensionHigh,
      isTriggerReady: this.isTriggerReady,
      headerState: this.headerState,
      state: this.state,
    };
  }
}
