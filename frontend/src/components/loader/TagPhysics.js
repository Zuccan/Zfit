/**
 * TagPhysics (V4)
 * Physically simulated 3D rigid-body pendulum engine:
 * - Full 360° rotational freedom around suspension axis (no artificial yaw clamps)
 * - Continuous angular momentum & multi-revolution spinning
 * - Torque-based interaction: τ = r × F (corner dragging produces distinct rotational responses)
 * - Complete state machine: INITIALIZING, IDLE, CARD_GRABBED, STRING_GRABBED, DRAGGING, FREE_SWING, FREE_SPIN, SETTLING, ENTERING_HERO, COMPLETED
 * - Downward tension threshold detection for deliberate pull-to-enter
 */

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

export class TagPhysics {
  constructor(options = {}) {
    this.pullThreshold = options.pullThreshold || 0.35;
    this.state = INTERACTION_STATES.INITIALIZING;

    // Current 3D angular orientation (radians)
    // Starts with a subtle natural 3D angle so sidewall thickness is immediately visible
    this.rotation = {
      x: 0.05,  // Pitch (tilt forward/back)
      y: 0.18,  // Yaw (full 360° rotational twist around cord)
      z: -0.03, // Roll (pendulum sway)
    };

    // Angular velocities (rad/s) with initial physical disturbance
    this.velocity = {
      x: 0.0,
      y: 0.45,  // Initial gentle spin that smoothly settles
      z: -0.25, // Initial gentle sway
    };

    // Card moments of inertia (Ix, Iy, Iz)
    // Low Iy allows effortless 360° spinning around vertical cord
    this.inertia = {
      x: 1.1,
      y: 0.22,
      z: 1.1,
    };

    // Restoring spring stiffness constants
    this.stiffness = {
      x: 24.0, // Pendulum gravity restoration (pitch)
      y: 1.2,  // Light torsional cord twist restoration allowing multiple full 360° rotations!
      z: 26.0, // Pendulum gravity restoration (roll)
    };

    // Damping coefficients (air resistance + cord hinge friction)
    this.damping = {
      x: 2.6,
      y: 0.35, // Very light yaw damping so spins carry through full 360° revolutions!
      z: 2.8,
    };

    // Vertical downward pull state (units)
    this.pullY = 0;
    this.pullVelocity = 0;
    this.pullStiffness = 95.0;
    this.pullDamping = 9.0;

    // Interaction state
    this.isDragging = false;
    this.dragLeverArm = { x: 0, y: -0.75, z: 0 }; // Local hit position r relative to suspension hole
    this.appliedForce = { x: 0, y: 0, z: 0 };
    this.lastPointerPos = { x: 0, y: 0 };
    this.pointerVelocity = { x: 0, y: 0 };
  }

  /**
   * Card grabbed at 3D point r relative to suspension hole
   */
  startCardDrag(clientX, clientY, localHitPoint = null) {
    this.isDragging = true;
    this.state = INTERACTION_STATES.CARD_GRABBED;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;
    this.pointerVelocity.x = 0;
    this.pointerVelocity.y = 0;

    if (localHitPoint) {
      this.dragLeverArm.x = CLAMP(localHitPoint.x, -0.45, 0.45);
      this.dragLeverArm.y = CLAMP(localHitPoint.y, -1.5, -0.05);
      this.dragLeverArm.z = localHitPoint.z || 0;
    } else {
      this.dragLeverArm.x = 0;
      this.dragLeverArm.y = -0.75;
      this.dragLeverArm.z = 0;
    }
  }

  startDrag(clientX, clientY, localHitPoint = null) {
    return this.startCardDrag(clientX, clientY, localHitPoint);
  }

  /**
   * Updates drag forces based on pointer displacement and lever arm
   */
  updateDrag(clientX, clientY, deltaWorldX, deltaWorldY) {
    if (!this.isDragging) return;
    this.state = INTERACTION_STATES.DRAGGING;

    // Track pointer velocity for momentum transfer on release
    const pvx = clientX - this.lastPointerPos.x;
    const pvy = clientY - this.lastPointerPos.y;
    this.pointerVelocity.x = this.pointerVelocity.x * 0.35 + pvx * 0.65;
    this.pointerVelocity.y = this.pointerVelocity.y * 0.35 + pvy * 0.65;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;

    // Compute external force applied at lever arm point
    const forceFactor = 38.0;
    this.appliedForce.x = deltaWorldX * forceFactor;
    this.appliedForce.y = deltaWorldY * forceFactor;
    this.appliedForce.z = -deltaWorldY * forceFactor * 0.2;

    // Downward displacement under elastic resistance
    if (deltaWorldY < 0) {
      const targetPull = Math.pow(-deltaWorldY, 0.8) * 0.55;
      this.pullY = Math.max(this.pullY, targetPull);
    }
  }

  /**
   * Pointer released: transfers impulse and preserves angular momentum
   */
  release() {
    if (!this.isDragging) return false;
    this.isDragging = false;

    // Check deliberate downward pull threshold
    const wasDeliberatePull = this.pullY >= this.pullThreshold;

    if (wasDeliberatePull) {
      this.state = INTERACTION_STATES.ENTERING_HERO;
    } else {
      // Transfer release pointer velocity directly into angular momentum
      const rx = this.dragLeverArm.x;
      const ry = this.dragLeverArm.y;
      const vx = this.pointerVelocity.x * 0.09;
      const vy = this.pointerVelocity.y * 0.09;

      // Angular velocity impulses around Roll (Z), Pitch (X), and Twist (Y)
      this.velocity.z += CLAMP((-ry * vx + rx * vy) * 0.8, -14, 14);
      // High rotational impulse on yaw for full 360° spin!
      this.velocity.y += CLAMP((rx * -vy * 2.2) + (vx * 0.8), -24, 24);
      this.velocity.x += CLAMP(vy * 0.8, -10, 10);

      // Determine post-release state
      if (Math.abs(this.velocity.y) > 2.0) {
        this.state = INTERACTION_STATES.FREE_SPIN;
      } else {
        this.state = INTERACTION_STATES.FREE_SWING;
      }
    }

    // Reset applied forces
    this.appliedForce.x = 0;
    this.appliedForce.y = 0;
    this.appliedForce.z = 0;

    return wasDeliberatePull;
  }

  /**
   * Advances the physical simulation step by deltaTime
   */
  step(deltaTime, totalTime) {
    const dt = Math.min(0.033, Math.max(0.002, deltaTime));

    // Calculate torques τ = r × F
    let tauDragX = 0;
    let tauDragY = 0;
    let tauDragZ = 0;

    if (this.isDragging) {
      const rx = this.dragLeverArm.x;
      const ry = this.dragLeverArm.y;
      const rz = this.dragLeverArm.z;
      const fx = this.appliedForce.x;
      const fy = this.appliedForce.y;
      const fz = this.appliedForce.z;

      // τ = r × F
      tauDragX = ry * fz - rz * fy;
      // Twist (Y-axis): pulling on the left (rx < 0) vs right (rx > 0) creates opposite yaw torque!
      tauDragY = rz * fx - rx * fz - rx * fy * 1.2;
      tauDragZ = rx * fy - ry * fx;
    } else {
      // Natural subtle idle breathing when not interacted with
      const idleTorqueY = Math.sin(totalTime * 0.73) * 0.08 + Math.cos(totalTime * 1.37) * 0.04;
      const idleTorqueZ = Math.sin(totalTime * 0.91) * 0.12 + Math.cos(totalTime * 1.63) * 0.04;
      tauDragY = idleTorqueY;
      tauDragZ = idleTorqueZ;
    }

    // 1. Total Torques: Restoring torque + Drag torque - Damping torque
    // Note: Periodic gravitational restoration for pitch and roll: -k * sin(theta)
    // Light linear torsional restoration for yaw: -k * theta (allows continuous multi-turn 360° spin!)
    const tauTotalX = -this.stiffness.x * Math.sin(this.rotation.x) + tauDragX - this.damping.x * this.velocity.x;
    const tauTotalY = -this.stiffness.y * this.rotation.y + tauDragY - this.damping.y * this.velocity.y;
    const tauTotalZ = -this.stiffness.z * Math.sin(this.rotation.z) + tauDragZ - this.damping.z * this.velocity.z;

    // 2. Angular accelerations: α = τ / I
    const alphaX = tauTotalX / this.inertia.x;
    const alphaY = tauTotalY / this.inertia.y;
    const alphaZ = tauTotalZ / this.inertia.z;

    // 3. Semi-implicit Euler integration
    this.velocity.x += alphaX * dt;
    this.velocity.y += alphaY * dt;
    this.velocity.z += alphaZ * dt;

    this.rotation.x += this.velocity.x * dt;
    this.rotation.y += this.velocity.y * dt; // NO CLAMP on Y! Full 360° continuous rotation!
    this.rotation.z += this.velocity.z * dt;

    // Gentle physical limits for pitch and roll (gravity keeps tag suspended beneath cord)
    this.rotation.x = CLAMP(this.rotation.x, -1.2, 1.2);
    this.rotation.z = CLAMP(this.rotation.z, -1.3, 1.3);

    // 4. Vertical downward pull spring simulation
    if (!this.isDragging) {
      const pullForce = -this.pullStiffness * this.pullY - this.pullDamping * this.pullVelocity;
      this.pullVelocity += pullForce * dt;
      this.pullY += this.pullVelocity * dt;
      if (this.pullY < 0) {
        this.pullY = 0;
        this.pullVelocity = 0;
      }

      // Update state when settling
      const kineticEnergy =
        0.5 * this.inertia.x * this.velocity.x * this.velocity.x +
        0.5 * this.inertia.y * this.velocity.y * this.velocity.y +
        0.5 * this.inertia.z * this.velocity.z * this.velocity.z;

      if (this.state !== INTERACTION_STATES.ENTERING_HERO && this.state !== INTERACTION_STATES.COMPLETED) {
        if (kineticEnergy < 0.005) {
          this.state = INTERACTION_STATES.IDLE;
        } else if (kineticEnergy < 0.08) {
          this.state = INTERACTION_STATES.SETTLING;
        }
      }
    }

    const isTensionHigh = this.pullY >= this.pullThreshold * 0.85;

    return {
      rotation: this.rotation,
      pullY: this.pullY,
      isTensionHigh,
      state: this.state,
    };
  }
}
