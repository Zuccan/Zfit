/**
 * TagPhysics
 * Damped 3-DOF spherical pendulum and angular spring simulation:
 * - Pitch (X-axis): Front/back displacement and gravity restoration
 * - Twist (Y-axis): Axial aerodynamic rotation
 * - Roll (Z-axis): Horizontal sway left and right
 * - Vertical Elastic Tension: Downward stretch for deliberate pull-triggering
 * - Frame-rate independent numerical integration with preserved release momentum
 */

export class TagPhysics {
  constructor(options = {}) {
    // Spring stiffness coefficients for each degree of freedom
    this.stiffness = {
      x: options.stiffnessX ?? 32.0, // Pitch (front/back)
      y: options.stiffnessY ?? 22.0, // Twist (axial)
      z: options.stiffnessZ ?? 36.0, // Roll (left/right sway)
      pull: 42.0,                   // Vertical elastic tension
    };

    // Damping ratios for smooth decay
    this.damping = {
      x: options.dampingX ?? 3.4,
      y: options.dampingY ?? 2.6,
      z: options.dampingZ ?? 3.2,
      pull: 5.5,
    };

    // Current angular state (radians)
    this.rotation = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.target = { x: 0, y: 0, z: 0 };

    // Vertical pull displacement
    this.pullY = 0;
    this.pullVelocity = 0;
    this.targetPullY = 0;

    // Interaction flags
    this.isDragging = false;
    this.hasTriggeredPull = false;
    this.pullThreshold = options.pullThreshold ?? 0.65; // World units downward

    // Historical pointer velocity tracking for release momentum
    this.lastPointer = { x: 0, y: 0, time: 0 };
    this.pointerVelocity = { x: 0, y: 0 };
  }

  /**
   * Called when pointer grabs the tag
   */
  startDrag(pointerX, pointerY) {
    this.isDragging = true;
    this.lastPointer.x = pointerX;
    this.lastPointer.y = pointerY;
    this.lastPointer.time = performance.now();
    this.pointerVelocity.x = 0;
    this.pointerVelocity.y = 0;
  }

  /**
   * Called while pointer is dragging across viewport
   */
  updateDrag(pointerX, pointerY, deltaWorldX, deltaWorldY) {
    if (!this.isDragging) return;

    const now = performance.now();
    const dt = Math.max(0.005, (now - this.lastPointer.time) / 1000);

    // Track instantaneous pointer velocity
    this.pointerVelocity.x = (pointerX - this.lastPointer.x) / dt;
    this.pointerVelocity.y = (pointerY - this.lastPointer.y) / dt;

    this.lastPointer.x = pointerX;
    this.lastPointer.y = pointerY;
    this.lastPointer.time = now;

    // 1. Horizontal sway (Z-axis roll) and twist (Y-axis yaw)
    this.target.z = THREE_MATH_CLAMP(-deltaWorldX * 0.45, -0.9, 0.9);
    this.target.y = THREE_MATH_CLAMP(deltaWorldX * 0.35, -0.75, 0.75);

    // 2. Pitch (X-axis) and downward pull tension
    if (deltaWorldY < 0) {
      // Downward pull with realistic elastic resistance (diminishing displacement)
      const rawPull = -deltaWorldY;
      this.targetPullY = Math.pow(rawPull, 0.8) * 0.55;
      this.target.x = THREE_MATH_CLAMP(-this.targetPullY * 0.4, -0.6, 0.4);
    } else {
      // Upward or neutral push
      this.targetPullY = 0;
      this.target.x = THREE_MATH_CLAMP(deltaWorldY * 0.35, -0.4, 0.6);
    }
  }

  /**
   * Called when pointer is released
   */
  release() {
    if (!this.isDragging) return false;
    this.isDragging = false;

    // Check if user exceeded deliberate downward pull threshold
    const wasDeliberatePull = this.pullY >= this.pullThreshold;

    // Transfer release pointer velocity into physical angular momentum
    const impulseMultiplier = 0.08;
    this.velocity.z += THREE_MATH_CLAMP(this.pointerVelocity.x * impulseMultiplier, -15, 15);
    this.velocity.x += THREE_MATH_CLAMP(this.pointerVelocity.y * impulseMultiplier * 0.8, -12, 12);
    this.velocity.y += THREE_MATH_CLAMP(this.pointerVelocity.x * impulseMultiplier * 0.5, -10, 10);

    // Reset targets to natural resting equilibrium
    this.target.x = 0;
    this.target.y = 0;
    this.target.z = 0;
    this.targetPullY = 0;

    return wasDeliberatePull;
  }

  /**
   * Frame-by-frame simulation step
   */
  step(deltaTime, totalTime) {
    const dt = Math.min(0.04, Math.max(0.001, deltaTime));

    // Idle ambient micro-motion when resting and not grabbed
    if (!this.isDragging) {
      const idleRoll = Math.sin(totalTime * 0.9) * 0.022 + Math.cos(totalTime * 1.5) * 0.008;
      const idleYaw = Math.sin(totalTime * 0.65) * 0.016;
      const idlePitch = Math.cos(totalTime * 0.8) * 0.012;

      this.target.z = idleRoll;
      this.target.y = idleYaw;
      this.target.x = idlePitch;
    }

    // 1. Roll (Z-axis sway) integration
    const accelZ = -this.stiffness.z * (this.rotation.z - this.target.z) - this.damping.z * this.velocity.z;
    this.velocity.z += accelZ * dt;
    this.rotation.z += this.velocity.z * dt;

    // 2. Pitch (X-axis tilt) integration
    const accelX = -this.stiffness.x * (this.rotation.x - this.target.x) - this.damping.x * this.velocity.x;
    this.velocity.x += accelX * dt;
    this.rotation.x += this.velocity.x * dt;

    // 3. Twist (Y-axis yaw) integration
    const accelY = -this.stiffness.y * (this.rotation.y - this.target.y) - this.damping.y * this.velocity.y;
    this.velocity.y += accelY * dt;
    this.rotation.y += this.velocity.y * dt;

    // 4. Vertical elastic pull tension integration
    const accelPull = -this.stiffness.pull * (this.pullY - this.targetPullY) - this.damping.pull * this.pullVelocity;
    this.pullVelocity += accelPull * dt;
    this.pullY = Math.max(0, this.pullY + this.pullVelocity * dt);

    return {
      rotation: this.rotation,
      pullY: this.pullY,
      isTensionHigh: this.pullY > this.pullThreshold * 0.7,
    };
  }
}

function THREE_MATH_CLAMP(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
