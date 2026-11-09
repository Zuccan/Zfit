/**
 * TagPhysics
 * Physically simulated 3D rigid-body pendulum engine:
 * - 3 independent rotational degrees of freedom: Roll (Z), Pitch (X), Yaw/Twist (Y)
 * - Torque-based interaction: τ = r × F (drag position on card determines rotational response)
 * - Dragging bottom-left twists differently than center or bottom-right
 * - Preserves angular momentum on pointer release
 * - Gravitational & torsional spring restoring forces with physical damping
 * - Deliberate downward pull threshold detection
 */

const CLAMP = (val, min, max) => Math.min(Math.max(val, min), max);

export class TagPhysics {
  constructor(options = {}) {
    this.pullThreshold = options.pullThreshold || 0.35;

    // Current 3D angular state (radians)
    // Starts with a subtle natural 3D angle so sidewalls and thickness are immediately visible
    this.rotation = {
      x: 0.05,  // Subtle forward tilt (pitch)
      y: 0.18,  // Natural 3D twist revealing card thickness & depth (yaw)
      z: -0.03, // Subtle lateral sway (roll)
    };

    // Angular velocities (rad/s) with initial physical disturbance that gently settles
    this.velocity = {
      x: 0.0,
      y: 0.45,  // Initial gentle spin that smoothly settles
      z: -0.25, // Initial gentle sway
    };

    // Card moments of inertia (Ix, Iy, Iz) calibrated for clothing hang tag
    this.inertia = {
      x: 1.1,
      y: 0.28,
      z: 1.1,
    };

    // Restoring spring stiffness constants
    this.stiffness = {
      x: 26.0, // Pendulum gravity restoration (pitch)
      y: 13.0, // Cord torsional twist restoration (yaw)
      z: 28.0, // Pendulum gravity restoration (roll)
    };

    // Damping coefficients (air resistance + cord hinge friction)
    this.damping = {
      x: 2.8,
      y: 1.9,
      z: 3.0,
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
   * Pointer grabbed at 3D point r relative to suspension hole
   * @param {number} clientX
   * @param {number} clientY
   * @param {THREE.Vector3} localHitPoint - Hit position on card relative to eyelet
   */
  startDrag(clientX, clientY, localHitPoint = null) {
    this.isDragging = true;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;
    this.pointerVelocity.x = 0;
    this.pointerVelocity.y = 0;

    if (localHitPoint) {
      this.dragLeverArm.x = CLAMP(localHitPoint.x, -0.45, 0.45);
      this.dragLeverArm.y = CLAMP(localHitPoint.y, -1.5, -0.05);
      this.dragLeverArm.z = localHitPoint.z || 0;
    } else {
      // Default to optical center of the card
      this.dragLeverArm.x = 0;
      this.dragLeverArm.y = -0.75;
      this.dragLeverArm.z = 0;
    }
  }

  /**
   * Updates drag forces based on pointer displacement and lever arm
   * @param {number} clientX
   * @param {number} clientY
   * @param {number} deltaWorldX
   * @param {number} deltaWorldY
   */
  updateDrag(clientX, clientY, deltaWorldX, deltaWorldY) {
    if (!this.isDragging) return;

    // Track pointer velocity for momentum transfer on release
    const pvx = clientX - this.lastPointerPos.x;
    const pvy = clientY - this.lastPointerPos.y;
    this.pointerVelocity.x = this.pointerVelocity.x * 0.4 + pvx * 0.6;
    this.pointerVelocity.y = this.pointerVelocity.y * 0.4 + pvy * 0.6;
    this.lastPointerPos.x = clientX;
    this.lastPointerPos.y = clientY;

    // Compute external force applied at lever arm point
    const forceFactor = 38.0;
    this.appliedForce.x = deltaWorldX * forceFactor;
    this.appliedForce.y = deltaWorldY * forceFactor;
    this.appliedForce.z = -deltaWorldY * forceFactor * 0.2; // Vertical pull induces slight 3D depth tilt

    // Downward displacement under elastic resistance
    if (deltaWorldY < 0) {
      const targetPull = Math.pow(-deltaWorldY, 0.8) * 0.55;
      this.pullY = Math.max(this.pullY, targetPull);
    }
  }

  /**
   * Pointer released: transfers impulse and preserves angular momentum
   * @returns {boolean} wasDeliberatePull - Whether downward pull threshold was reached
   */
  release() {
    if (!this.isDragging) return false;
    this.isDragging = false;

    // Check deliberate downward pull threshold
    const wasDeliberatePull = this.pullY >= this.pullThreshold;

    // Transfer release pointer velocity directly into angular momentum
    const rx = this.dragLeverArm.x;
    const ry = this.dragLeverArm.y;
    const vx = this.pointerVelocity.x * 0.08;
    const vy = this.pointerVelocity.y * 0.08;

    // Angular velocity impulses around Roll (Z), Pitch (X), and Twist (Y)
    this.velocity.z += CLAMP((-ry * vx + rx * vy) * 0.8, -12, 12);
    this.velocity.y += CLAMP((rx * -vy * 1.5), -14, 14);
    this.velocity.x += CLAMP(vy * 0.8, -10, 10);

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
      tauDragY = rz * fx - rx * fz - rx * fy * 0.8;
      tauDragZ = rx * fy - ry * fx;
    } else {
      // Natural subtle idle breathing when not interacted with
      // Non-repetitive combination of primes to prevent mechanical looping
      const idleTorqueY = Math.sin(totalTime * 0.73) * 0.12 + Math.cos(totalTime * 1.37) * 0.06;
      const idleTorqueZ = Math.sin(totalTime * 0.91) * 0.14 + Math.cos(totalTime * 1.63) * 0.05;
      tauDragY = idleTorqueY;
      tauDragZ = idleTorqueZ;
    }

    // 1. Total Torques: Restoring torque + Drag torque - Damping torque
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
    this.rotation.y += this.velocity.y * dt;
    this.rotation.z += this.velocity.z * dt;

    // Safety clamps on extreme angles to maintain realistic cord suspension
    this.rotation.x = CLAMP(this.rotation.x, -1.1, 1.1);
    this.rotation.y = CLAMP(this.rotation.y, -2.2, 2.2);
    this.rotation.z = CLAMP(this.rotation.z, -1.2, 1.2);

    // 4. Vertical downward pull spring simulation
    if (!this.isDragging) {
      const pullForce = -this.pullStiffness * this.pullY - this.pullDamping * this.pullVelocity;
      this.pullVelocity += pullForce * dt;
      this.pullY += this.pullVelocity * dt;
      if (this.pullY < 0) {
        this.pullY = 0;
        this.pullVelocity = 0;
      }
    }

    const isTensionHigh = this.pullY >= this.pullThreshold * 0.85;

    return {
      rotation: this.rotation,
      pullY: this.pullY,
      isTensionHigh,
    };
  }
}
