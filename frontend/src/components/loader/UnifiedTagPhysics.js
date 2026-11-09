import * as THREE from 'three';
import { TAG_CONFIG } from './TagConfig';

const CLAMP = (val, min, max) => Math.min(Math.max(val, min), max);

export const INTERACTION_STATES = {
  INITIAL_DROP: 'INITIAL_DROP',
  IDLE: 'IDLE',
  DRAGGING: 'DRAGGING',
  TENSIONED: 'TENSIONED',
  STRING_SNAPPED: 'STRING_SNAPPED',
  TAG_RELEASED: 'TAG_RELEASED',
  TRANSITIONING: 'TRANSITIONING',
  FREE_SWING: 'FREE_SWING',
  FREE_SPIN: 'FREE_SPIN',
};

/**
 * UnifiedTagPhysics
 * 1000% Real-World Physical Simulation:
 * - Ceiling anchor fixed at top: (0, TAG_CONFIG.ceilingY, -0.020)
 * - String is physically mounted BEHIND the card at all times (Z = -0.020)
 * - INITIAL DROP: When user opens website, card plummets down from above the viewport
 *   under real gravity (g = -18.5 m/s²), string trails behind it, string catches card
 *   with elastic spring rebound and 3D spinning momentum, settling in the optical center
 * - Full 360° unconstrained rotation on yaw with low rotational inertia
 * - Deliberate downward pull builds tension and physically snaps connection at the punched hole
 * - Tag falls freely off-screen under gravity with tumbling rotation
 * - Full-screen loader panel then slides down to reveal homepage hero
 */
export class UnifiedTagPhysics {
  constructor(options = {}) {
    this.pullThreshold = options.pullThreshold || 0.18;
    this.onTriggerSlideDown = options.onTriggerSlideDown || null;
    this.onSnap = options.onSnap || null;
    this.state = INTERACTION_STATES.INITIAL_DROP;

    // --- 1. TOP CEILING ANCHOR BRACKET ---
    this.ceilingY = TAG_CONFIG.ceilingY || 2.15;
    this.ropeZ = -0.020; // Strictly BEHIND the card in the Z-axis
    this.anchorPos = new THREE.Vector3(0, this.ceilingY, this.ropeZ);

    // --- 2. SUSPENSION ROPE PARTICLES (12 nodes) ---
    this.numNodes = 12;
    this.totalRopeLength = TAG_CONFIG.totalRopeLength || 1.50; // Full previous length
    this.segmentLength = this.totalRopeLength / (this.numNodes - 1);
    this.ropeDamping = TAG_CONFIG.ropeDamping || 0.95;
    this.iterations = 14;
    this.gravity = TAG_CONFIG.gravity || -18.5;

    // --- 3. INITIAL DROP PARAMETERS ---
    this.dropStartHeight = TAG_CONFIG.dropStartHeight || 2.75; // Completely above viewport
    this.dropTime = 0;
    this.isDropCatchEngaged = false;

    // Initialize rope nodes: Node 0 at ceiling anchor, Node 11 at start height
    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      const t = i / (this.numNodes - 1);
      const y = this.ceilingY + (this.dropStartHeight - this.ceilingY) * t;
      this.nodes.push({
        x: 0,
        y,
        z: this.ropeZ,
        oldX: 0,
        oldY: y + 0.04, // Initial downward velocity impulse
        oldZ: this.ropeZ,
        mass: i === this.numNodes - 1 ? 0.22 : 0.04,
      });
    }

    this.splinePoints = this.nodes.map(n => new THREE.Vector3(n.x, n.y, n.z));

    // --- 4. FASHION TAG SPATIAL & ANGULAR STATE ---
    this.tagPosition = new THREE.Vector3(0, this.dropStartHeight, 0.008);
    this.tagVelocity = new THREE.Vector3(0, -3.2, 0); // Plunging downward under gravity at t=0

    // Initial 3D rotational pose & spinning momentum on entrance
    this.rotation = {
      x: 0.20,  // Subtle forward tilt
      y: 1.25,  // Initial yaw angle
      z: -0.08, // Initial roll
    };

    this.velocity = {
      x: -0.22,
      y: 4.8,   // High-speed elegant 360° spin as it drops into the scene
      z: -0.85, // Natural pendulum sway
    };

    this.inertia = {
      x: 0.36,
      y: 0.055, // Low Iy for effortless 360° multi-turn spinning
      z: 0.36,
    };

    this.stiffness = {
      x: 18.0,
      y: 0.42,  // Gentle torsional spring allowing multiple 360° revolutions
      z: 18.0,
    };

    this.damping = {
      x: 1.8,
      y: 0.16,  // Smooth air drag allowing sustained rotation
      z: 1.8,
    };

    // Elastic cord catch constants
    this.cordSpringK = 480.0;
    this.cordDamperC = 26.0;

    // Breakaway & drag interaction state
    this.isSnapped = false;
    this.snapElapsed = 0;
    this.hasTriggeredSlideDown = false;
    this.isLocked = false;

    this.dragTarget = null;
    this.grabbedStringNode = -1;
    this.stringGrabPos = new THREE.Vector3();
    this.dragLeverArm = { x: 0, y: -TAG_CONFIG.cardHeight / 2, z: 0 };
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
  }

  /**
   * Snaps the attachment connection at the TOP-CENTER punched hole of the tag
   */
  snapConnection() {
    if (this.isSnapped) return;

    this.isSnapped = true;
    this.isLocked = true;
    this.dragTarget = null;
    this.state = INTERACTION_STATES.STRING_SNAPPED;
    this.snapElapsed = 0;

    // Capture current position from the bottom rope node
    const bottomNode = this.nodes[this.numNodes - 1];
    this.tagPosition.set(bottomNode.x, bottomNode.y, 0.008);

    // Initial tag freefall velocity (preserves pull momentum + downward plunge)
    this.tagVelocity.x = CLAMP(this.pointerVelocity.x * 0.0035, -2.0, 2.0);
    this.tagVelocity.y = -4.2; // Immediate downward snap plunge
    this.tagVelocity.z = (Math.random() - 0.5) * 0.3;

    // Impart natural forward tumble and spin upon snap
    this.velocity.x += -2.2;
    this.velocity.y += CLAMP(this.pointerVelocity.x * 0.05, -5.0, 5.0) + (Math.random() - 0.5) * 3.0;
    this.velocity.z += (Math.random() - 0.5) * 2.0;

    // Elastic upward recoil impulse on the severed bottom string node
    const recoilSpeed = 4.2;
    bottomNode.oldY = bottomNode.y + recoilSpeed * 0.024;
    bottomNode.oldX = bottomNode.x + (Math.random() - 0.5) * 0.02;

    if (this.numNodes > 2) {
      this.nodes[this.numNodes - 2].oldY = this.nodes[this.numNodes - 2].y + recoilSpeed * 0.016;
      this.nodes[this.numNodes - 3].oldY = this.nodes[this.numNodes - 3].y + recoilSpeed * 0.008;
    }

    if (this.onSnap) {
      this.onSnap({
        tagPosition: this.tagPosition.clone(),
        stringEnd: new THREE.Vector3(bottomNode.x, bottomNode.y, bottomNode.z),
      });
    }

    // IMMEDIATELY trigger the full-screen loader slide-down IN PERFECT SYNCHRONIZATION with the tag snap
    if (!this.hasTriggeredSlideDown) {
      this.hasTriggeredSlideDown = true;
      this.state = INTERACTION_STATES.TRANSITIONING;
      if (this.onTriggerSlideDown) {
        this.onTriggerSlideDown();
      }
    }
  }

  /**
   * Pointer grabbed card
   */
  startCardDrag(clientX, clientY, localHitPoint = null) {
    if (this.isLocked || this.isSnapped) return;

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
      this.dragLeverArm.x = CLAMP(localHitPoint.x, -TAG_CONFIG.cardWidth / 2, TAG_CONFIG.cardWidth / 2);
      this.dragLeverArm.y = CLAMP(localHitPoint.y, -TAG_CONFIG.cardHeight, -0.05);
      this.dragLeverArm.z = localHitPoint.z || 0;
    } else {
      this.dragLeverArm.x = 0;
      this.dragLeverArm.y = -TAG_CONFIG.cardHeight / 2;
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
    if (this.isLocked || this.isSnapped) return;

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
   * Update active drag
   */
  updateDrag(clientX, clientY, deltaWorldX, deltaWorldY) {
    if (this.isLocked || this.isSnapped || !this.dragTarget) return;

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
      bottomNode.z = this.ropeZ;
      this.tagPosition.set(bottomNode.x, bottomNode.y, 0.008);

      // Downward pull detection
      if (screenDy > 10) {
        this.pullPixels = screenDy;
        const worldPull = Math.max(0, -deltaWorldY);
        const pixelPull = Math.max(0, screenDy * 0.0035);
        this.currentPullY = Math.max(worldPull, pixelPull);
        this.maxPullY = Math.max(this.maxPullY, this.currentPullY);

        if (this.currentPullY / this.pullThreshold >= 0.70) {
          this.state = INTERACTION_STATES.TENSIONED;
        } else {
          this.state = INTERACTION_STATES.DRAGGING;
        }

        // Trigger snap when intentional downward threshold is crossed
        if (this.currentPullY >= this.pullThreshold) {
          this.isTriggerReady = true;
          this.snapConnection();
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
      node.z = this.ropeZ;

      if (screenDy > 15) {
        this.pullPixels = screenDy;
        this.currentPullY = Math.max(0, screenDy * 0.0035);
        this.maxPullY = Math.max(this.maxPullY, this.currentPullY);

        if (this.currentPullY >= this.pullThreshold) {
          this.isTriggerReady = true;
          this.snapConnection();
          return;
        }
      }
    }
  }

  /**
   * Pointer released
   */
  release() {
    if (this.isLocked || this.isSnapped || !this.dragTarget) return false;

    const wasCard = this.dragTarget === 'CARD';
    const wasDeliberatePull = this.isTriggerReady || this.maxPullY >= this.pullThreshold;

    this.dragTarget = null;
    this.grabbedStringNode = -1;
    this.pullPixels = 0;
    this.screenDx = 0;
    this.currentPullY = 0;

    if (wasDeliberatePull) {
      this.snapConnection();
      return true;
    }

    if (wasCard) {
      const bottomNode = this.nodes[this.numNodes - 1];
      const vx = this.pointerVelocity.x * 0.0035;
      const vy = -this.pointerVelocity.y * 0.0035;

      bottomNode.oldX = bottomNode.x - vx;
      bottomNode.oldY = bottomNode.y - vy;
      this.tagVelocity.set(vx * 40.0, vy * 40.0, 0);

      const rx = this.dragLeverArm.x;
      const ry = this.dragLeverArm.y;
      this.velocity.z += CLAMP((-ry * vx + rx * vy) * 36.0, -16, 16);
      this.velocity.y += CLAMP((rx * -vy * 58.0) + (vx * 26.0), -32, 32);
      this.velocity.x += CLAMP(vy * 26.0, -12, 12);

      this.state = Math.abs(this.velocity.y) > 2.0 ? INTERACTION_STATES.FREE_SPIN : INTERACTION_STATES.FREE_SWING;
    } else {
      this.state = INTERACTION_STATES.FREE_SWING;
    }

    return false;
  }

  /**
   * Advances master physics simulation step
   */
  step(deltaTime, totalTime) {
    const dt = Math.min(0.025, Math.max(0.004, deltaTime));
    const dtSq = dt * dt;

    // Pin Node 0 strictly to the fixed ceiling bracket hardware (Z = -0.020 behind card)
    this.nodes[0].x = this.anchorPos.x;
    this.nodes[0].y = this.anchorPos.y;
    this.nodes[0].z = this.ropeZ;

    // =========================================================================
    // 1. INITIAL ENTRANCE DROP UNDER REAL GRAVITY & ELASTIC CORD CATCH
    // =========================================================================
    if (this.state === INTERACTION_STATES.INITIAL_DROP && !this.dragTarget && !this.isSnapped) {
      this.dropTime += dt;

      // Realistic gravitational acceleration
      this.tagVelocity.y += this.gravity * dt;
      this.tagVelocity.x *= 0.992;
      this.tagPosition.x += this.tagVelocity.x * dt;
      this.tagPosition.y += this.tagVelocity.y * dt;

      // Distance from ceiling anchor (0, ceilingY) to the card's punched hole
      const dx = this.tagPosition.x - this.anchorPos.x;
      const dy = this.tagPosition.y - this.anchorPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;

      // When card reaches full rope extension, the cord engages with elastic spring catch
      if (dist >= this.totalRopeLength) {
        this.isDropCatchEngaged = true;
        const overExtension = dist - this.totalRopeLength;
        const ux = dx / dist;
        const uy = dy / dist;

        // Radial velocity towards/away from anchor
        const radialVel = this.tagVelocity.x * ux + this.tagVelocity.y * uy;

        // Restoring spring tension + damping
        const springForce = this.cordSpringK * overExtension;
        const dampForce = this.cordDamperC * Math.max(-10, Math.min(25, radialVel));
        const tension = Math.max(0, springForce + dampForce);

        const ax = -tension * ux;
        const ay = -tension * uy;

        this.tagVelocity.x += ax * dt;
        this.tagVelocity.y += ay * dt;

        // Impart pendulum swing and torsional recoil upon rope catch
        if (overExtension > 0.02 && Math.abs(this.velocity.y) < 1.0) {
          this.velocity.y += (Math.random() - 0.5) * 1.5;
          this.velocity.z += (Math.random() - 0.5) * 0.8;
        }

        // Clamp extreme bounce
        if (overExtension > 0.18) {
          this.tagPosition.x = this.anchorPos.x + ux * (this.totalRopeLength + 0.18);
          this.tagPosition.y = this.anchorPos.y + uy * (this.totalRopeLength + 0.18);
        }
      }

      // Settle drop after initial oscillations
      if (this.dropTime > 1.8 && Math.abs(this.tagVelocity.y) < 0.15 && Math.abs(this.tagVelocity.x) < 0.10) {
        this.state = INTERACTION_STATES.IDLE;
      }

      // Synchronize bottom rope node directly with the card eyelet (strictly at ropeZ behind card)
      const bottomNode = this.nodes[this.numNodes - 1];
      bottomNode.x = this.tagPosition.x;
      bottomNode.y = this.tagPosition.y;
      bottomNode.z = this.ropeZ;
    }

    // =========================================================================
    // 2. BREAKAWAY FREEFALL PLUNGE UNDER GRAVITY
    // =========================================================================
    if (this.isSnapped) {
      this.snapElapsed += dt;
      this.state = INTERACTION_STATES.TAG_RELEASED;

      // Free card accelerates downwards with realistic gravity and air drag
      this.tagVelocity.y += this.gravity * dt;
      this.tagVelocity.x *= 0.995;

      this.tagPosition.x += this.tagVelocity.x * dt;
      this.tagPosition.y += this.tagVelocity.y * dt;
      this.tagPosition.z += this.tagVelocity.z * dt;

      // Fallback safeguard in case transition hasn't fired yet
      if (!this.hasTriggeredSlideDown) {
        this.hasTriggeredSlideDown = true;
        this.state = INTERACTION_STATES.TRANSITIONING;
        if (this.onTriggerSlideDown) {
          this.onTriggerSlideDown();
        }
      }
    }

    // =========================================================================
    // 3. STEP VERLET SUSPENSION ROPE PARTICLES (ALWAYS STRICTLY AT Z = -0.020)
    // =========================================================================
    for (let i = 1; i < this.numNodes; i++) {
      if (!this.isSnapped && this.dragTarget === 'STRING' && i === this.grabbedStringNode) continue;
      if (!this.isSnapped && (this.dragTarget === 'CARD' || this.state === INTERACTION_STATES.INITIAL_DROP) && i === this.numNodes - 1) continue;

      const node = this.nodes[i];
      const vx = (node.x - node.oldX) * this.ropeDamping;
      const vy = (node.y - node.oldY) * this.ropeDamping;

      node.oldX = node.x;
      node.oldY = node.y;
      node.oldZ = this.ropeZ;

      node.x += vx;
      node.y += vy + (this.gravity * 0.75) * dtSq;
      node.z = this.ropeZ; // Always maintain string strictly behind card in Z
    }

    // Solve distance constraints (Relaxation iterations)
    for (let iter = 0; iter < this.iterations; iter++) {
      this.nodes[0].x = this.anchorPos.x;
      this.nodes[0].y = this.anchorPos.y;
      this.nodes[0].z = this.ropeZ;

      for (let i = 0; i < this.numNodes - 1; i++) {
        const p1 = this.nodes[i];
        const p2 = this.nodes[i + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const diff = (dist - this.segmentLength) / dist;

        const isP1Fixed = i === 0 || (!this.isSnapped && this.dragTarget === 'STRING' && i === this.grabbedStringNode);
        const isP2Fixed =
          (!this.isSnapped && this.dragTarget === 'STRING' && i + 1 === this.grabbedStringNode) ||
          (!this.isSnapped && (this.dragTarget === 'CARD' || this.state === INTERACTION_STATES.INITIAL_DROP) && i + 1 === this.numNodes - 1);

        if (isP1Fixed && isP2Fixed) {
          // both fixed
        } else if (isP1Fixed) {
          p2.x -= dx * diff;
          p2.y -= dy * diff;
        } else if (isP2Fixed) {
          p1.x += dx * diff;
          p1.y += dy * diff;
        } else {
          const half = diff * 0.5;
          p1.x += dx * half;
          p1.y += dy * half;
          p2.x -= dx * half;
          p2.y -= dy * half;
        }

        p1.z = this.ropeZ;
        p2.z = this.ropeZ;
      }
    }

    // Synchronize tag position when attached in idle or swinging
    if (!this.isSnapped && this.state !== INTERACTION_STATES.INITIAL_DROP && !this.dragTarget) {
      const bottomNode = this.nodes[this.numNodes - 1];
      this.tagPosition.set(bottomNode.x, bottomNode.y, 0.008);
    }

    // Update Catmull-Rom spline points for continuous 3D cord mesh
    for (let i = 0; i < this.numNodes; i++) {
      this.splinePoints[i].set(this.nodes[i].x, this.nodes[i].y, this.ropeZ);
    }

    // =========================================================================
    // 4. STEP 3D ROTATION (360° SPINNING MOMENTUM & NATURAL AIR RESISTANCE)
    // =========================================================================
    let idleTorqueY = 0;
    let idleTorqueZ = 0;
    if (!this.dragTarget && !this.isSnapped) {
      idleTorqueY = Math.sin(totalTime * 0.73) * 0.06 + Math.cos(totalTime * 1.37) * 0.03;
      idleTorqueZ = Math.sin(totalTime * 0.91) * 0.08 + Math.cos(totalTime * 1.63) * 0.03;
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
    this.rotation.y += this.velocity.y * dt; // Full unconstrained 360° rotation!
    this.rotation.z += this.velocity.z * dt;

    if (!this.isSnapped) {
      this.rotation.x = CLAMP(this.rotation.x, -1.2, 1.2);
      this.rotation.z = CLAMP(this.rotation.z, -1.3, 1.3);
    }

    const pullProgress = CLAMP(this.currentPullY / this.pullThreshold, 0, 1);
    const isTensionHigh = pullProgress >= 0.70;

    return {
      anchorPos: this.anchorPos,
      cardPosition: this.tagPosition,
      stringEnd: this.nodes[this.numNodes - 1],
      rotation: this.rotation,
      splinePoints: this.splinePoints,
      pullPixels: this.pullPixels,
      screenDx: this.screenDx,
      currentPullY: this.currentPullY,
      maxPullY: this.maxPullY,
      pullProgress,
      isTensionHigh,
      isTriggerReady: this.isTriggerReady,
      isSnapped: this.isSnapped,
      state: this.state,
    };
  }
}
