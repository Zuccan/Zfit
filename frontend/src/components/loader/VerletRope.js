import * as THREE from 'three';

/**
 * VerletRope
 * Physically simulated dynamic rope using Verlet integration and distance constraints:
 * - N particles connected by distance constraints
 * - Pinned ceiling anchor at node 0
 * - Bottom node attached to the card's punched hole/knot
 * - Direct user interaction: grabbing any section of the cord deforms the rope naturally
 * - Propagates tension and waves through neighboring nodes
 * - Zero-allocation frame updates for smooth 60fps performance
 */
export class VerletRope {
  constructor(options = {}) {
    this.numNodes = options.numNodes || 14;
    this.ceilingAnchor = new THREE.Vector3(0, options.ceilingY || 2.4, 0);
    this.restLength = options.totalLength || 1.82;
    this.segmentLength = this.restLength / (this.numNodes - 1);
    this.iterations = options.iterations || 8;
    this.damping = 0.965; // Air damping
    this.gravity = new THREE.Vector3(0, -9.8, 0);

    // Node particle states
    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      const t = i / (this.numNodes - 1);
      const y = this.ceilingAnchor.y - t * this.restLength;
      this.nodes.push({
        x: this.ceilingAnchor.x,
        y,
        z: this.ceilingAnchor.z,
        oldX: this.ceilingAnchor.x,
        oldY: y,
        oldZ: this.ceilingAnchor.z,
      });
    }

    // Interactive grab state on the rope
    this.isGrabbed = false;
    this.grabbedIndex = -1;
    this.grabbedTarget = new THREE.Vector3();

    // Reusable points array for CatmullRomCurve generation
    this.splinePoints = this.nodes.map(n => new THREE.Vector3(n.x, n.y, n.z));
  }

  /**
   * Set ceiling anchor position
   */
  setCeilingAnchor(x, y, z) {
    this.ceilingAnchor.set(x, y, z);
    this.nodes[0].x = x;
    this.nodes[0].y = y;
    this.nodes[0].z = z;
  }

  /**
   * User grabs the rope at a specific height/point
   * @param {THREE.Vector3} hitPoint - World coordinate of pointer on rope
   */
  grabAtPoint(hitPoint) {
    let closestIndex = 1;
    let minDistSq = Infinity;

    // Find the closest interior node (nodes 1 to numNodes - 2)
    for (let i = 1; i < this.numNodes - 1; i++) {
      const node = this.nodes[i];
      const dx = node.x - hitPoint.x;
      const dy = node.y - hitPoint.y;
      const dz = node.z - hitPoint.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        closestIndex = i;
      }
    }

    this.isGrabbed = true;
    this.grabbedIndex = closestIndex;
    this.grabbedTarget.copy(hitPoint);
  }

  /**
   * Update the position of the grabbed rope node during drag
   */
  updateGrab(targetPoint) {
    if (!this.isGrabbed || this.grabbedIndex < 0) return;
    this.grabbedTarget.copy(targetPoint);
  }

  /**
   * Release the grabbed rope node, allowing it to swing freely
   */
  releaseGrab() {
    this.isGrabbed = false;
    this.grabbedIndex = -1;
  }

  /**
   * Step the physical rope simulation by deltaTime
   * @param {number} deltaTime
   * @param {THREE.Vector3} bottomAttachmentPos - Current position of the card's attachment point
   */
  step(deltaTime, bottomAttachmentPos) {
    const dt = Math.min(0.025, Math.max(0.003, deltaTime));
    const dtSq = dt * dt;

    // 1. Verlet Integration for interior nodes
    for (let i = 1; i < this.numNodes; i++) {
      // If node is currently held by user, pin it to grabbedTarget
      if (this.isGrabbed && i === this.grabbedIndex) {
        this.nodes[i].x = this.grabbedTarget.x;
        this.nodes[i].y = this.grabbedTarget.y;
        this.nodes[i].z = this.grabbedTarget.z;
        continue;
      }

      // If bottom node, track the card attachment point
      if (i === this.numNodes - 1 && bottomAttachmentPos) {
        this.nodes[i].x = bottomAttachmentPos.x;
        this.nodes[i].y = bottomAttachmentPos.y;
        this.nodes[i].z = bottomAttachmentPos.z;
        continue;
      }

      const node = this.nodes[i];
      const vx = (node.x - node.oldX) * this.damping;
      const vy = (node.y - node.oldY) * this.damping;
      const vz = (node.z - node.oldZ) * this.damping;

      node.oldX = node.x;
      node.oldY = node.y;
      node.oldZ = node.z;

      node.x += vx + this.gravity.x * dtSq;
      node.y += vy + this.gravity.y * dtSq;
      node.z += vz + this.gravity.z * dtSq;
    }

    // 2. Solve Distance Constraints iteratively (Relaxation)
    for (let iter = 0; iter < this.iterations; iter++) {
      // Pin top anchor
      this.nodes[0].x = this.ceilingAnchor.x;
      this.nodes[0].y = this.ceilingAnchor.y;
      this.nodes[0].z = this.ceilingAnchor.z;

      // Pin grabbed node
      if (this.isGrabbed && this.grabbedIndex > 0) {
        this.nodes[this.grabbedIndex].x = this.grabbedTarget.x;
        this.nodes[this.grabbedIndex].y = this.grabbedTarget.y;
        this.nodes[this.grabbedIndex].z = this.grabbedTarget.z;
      }

      // Pin bottom node if attached
      if (bottomAttachmentPos) {
        const last = this.nodes[this.numNodes - 1];
        last.x = bottomAttachmentPos.x;
        last.y = bottomAttachmentPos.y;
        last.z = bottomAttachmentPos.z;
      }

      for (let i = 0; i < this.numNodes - 1; i++) {
        const p1 = this.nodes[i];
        const p2 = this.nodes[i + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
        const diff = (dist - this.segmentLength) / dist;

        const isP1Fixed = i === 0 || (this.isGrabbed && i === this.grabbedIndex);
        const isP2Fixed =
          (this.isGrabbed && i + 1 === this.grabbedIndex) ||
          (bottomAttachmentPos && i + 1 === this.numNodes - 1);

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
          p1.x += dx * diff * 0.5;
          p1.y += dy * diff * 0.5;
          p1.z += dz * diff * 0.5;
          p2.x -= dx * diff * 0.5;
          p2.y -= dy * diff * 0.5;
          p2.z -= dz * diff * 0.5;
        }
      }
    }

    // 3. Update reusable spline points
    for (let i = 0; i < this.numNodes; i++) {
      this.splinePoints[i].set(this.nodes[i].x, this.nodes[i].y, this.nodes[i].z);
    }

    return this.splinePoints;
  }

  /**
   * Returns current tension vector exerted on the bottom card attachment
   */
  getBottomTension() {
    const pPrev = this.nodes[this.numNodes - 2];
    const pLast = this.nodes[this.numNodes - 1];
    return new THREE.Vector3(
      pPrev.x - pLast.x,
      pPrev.y - pLast.y,
      pPrev.z - pLast.z
    );
  }
}
