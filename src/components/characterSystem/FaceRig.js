import * as THREE from 'three';

/**
 * Procedural Cheek Blush Texture Generator
 * Creates a soft radial rosy gradient for blushing.
 */
function createBlushTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 60, 110, 0.85)');
  grad.addColorStop(0.5, 'rgba(255, 80, 130, 0.4)');
  grad.addColorStop(1, 'rgba(255, 80, 130, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Dynamic Mouth Renderer
 * Renders mouth phonemes and shapes to an independent canvas at 60 FPS for lip-sync.
 */
class DynamicMouthRenderer {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 256;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  draw(mouthState) {
    const ctx = this.ctx;
    const { shape = 'gentle_smile', open = 0.5, width = 1.0 } = mouthState;
    const cx = 128;
    const cy = 120;

    ctx.clearRect(0, 0, 256, 256);

    ctx.fillStyle = '#141414';
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const w = 45 * width;
    const h = 55 * Math.max(open, 0.05);

    if (open < 0.15 || shape === 'gentle_smile') {
      // Gentle closed smile arc
      ctx.beginPath();
      ctx.arc(cx, cy - 10, w, Math.PI * 0.2, Math.PI * 0.8, false);
      ctx.stroke();
    } else if (shape === 'cat_smile') {
      // 'w' cat-smile (Blue mascot style)
      ctx.beginPath();
      ctx.arc(cx - 16, cy + 5, 18, Math.PI * 0.15, Math.PI * 0.9, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 16, cy + 5, 18, Math.PI * 0.1, Math.PI * 0.85, false);
      ctx.stroke();
    } else if (shape === 'round_o') {
      // 'O' mouth for Surprised or 'O'/'U' speech phoneme
      ctx.beginPath();
      ctx.ellipse(cx, cy + 15, w * 0.75, h * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'crooked') {
      // Crooked inquisitive mouth (Green mascot)
      ctx.beginPath();
      ctx.moveTo(cx - w, cy);
      ctx.quadraticCurveTo(cx, cy + 8, cx + w, cy - 8);
      ctx.quadraticCurveTo(cx + w * 0.8, cy + h * 0.8, cx, cy + h);
      ctx.quadraticCurveTo(cx - w * 0.8, cy + h * 0.8, cx - w, cy);
      ctx.closePath();
      ctx.fill();
    } else {
      // Open smiling/talking mouth with cute tongue
      ctx.beginPath();
      ctx.moveTo(cx - w, cy);
      ctx.quadraticCurveTo(cx, cy - 6, cx + w, cy);
      ctx.quadraticCurveTo(cx + w * 0.85, cy + h * 1.5, cx, cy + h * 1.6);
      ctx.quadraticCurveTo(cx - w * 0.85, cy + h * 1.5, cx - w, cy);
      ctx.closePath();
      ctx.fill();

      // Pink tongue inside
      if (h > 18) {
        ctx.save();
        ctx.clip();
        ctx.fillStyle = '#ff6080';
        ctx.beginPath();
        ctx.arc(cx, cy + h * 1.6, w * 0.8, Math.PI, 0, false);
        ctx.fill();
        ctx.restore();
      }
    }

    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}

/**
 * Dynamic Eye Renderer
 * Generates an independent eye texture that supports opening, closing, winking, blinking, and gaze.
 */
class DynamicEyeRenderer {
  constructor(isLeft = true) {
    this.isLeft = isLeft;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 128;
    this.canvas.height = 128;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  draw(eyeState) {
    const ctx = this.ctx;
    const { open = 1.0, shape = 'round', pupilX = 0, pupilY = 0 } = eyeState;
    const cx = 64;
    const cy = 64;

    ctx.clearRect(0, 0, 128, 128);

    if (shape === 'wink' || open <= 0.1) {
      // Closed wink/blink curve
      ctx.strokeStyle = '#141414';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, 28, Math.PI * 1.15, Math.PI * 1.85, false);
      ctx.stroke();
    } else if (shape === 'happy_arc') {
      // Inverted happy smile curve
      ctx.strokeStyle = '#141414';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy + 10, 26, Math.PI * 1.2, Math.PI * 1.8, false);
      ctx.stroke();
    } else if (shape === 'squint') {
      // Squinting closed eye '> <' (Pink mascot style)
      ctx.strokeStyle = '#141414';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (this.isLeft) {
        ctx.moveTo(cx - 24, cy - 20);
        ctx.lineTo(cx + 12, cy);
        ctx.lineTo(cx - 24, cy + 20);
      } else {
        ctx.moveTo(cx + 24, cy - 20);
        ctx.lineTo(cx - 12, cy);
        ctx.lineTo(cx + 24, cy + 20);
      }
      ctx.stroke();
    } else {
      // Standard open eye with gaze offset and glossy shine
      const px = cx + pupilX * 18;
      const py = cy - pupilY * 18;
      const rx = 24 * Math.min(open, 1.25);
      const ry = 32 * Math.min(open, 1.35);

      // Black Pupil
      ctx.fillStyle = '#141414';
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glossy Reflection Highlight
      if (open > 0.4) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(px - rx * 0.35, py - ry * 0.35, rx * 0.35, ry * 0.32, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Secondary tiny shine dot
        ctx.beginPath();
        ctx.arc(px + rx * 0.3, py + ry * 0.3, rx * 0.16, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}

/**
 * FaceRig Class
 * Manages all facial components independently:
 * - Left/Right Eyes (Blink, Wink, LookAt, Shapes)
 * - Left/Right Eyebrows (Lift, Tilt, Arch)
 * - Cheeks (Blush intensity 0.0 -> 1.0)
 * - Mouth (Speech phonemes, Open, Width, Shapes)
 */
export class FaceRig {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0.98); // Positions on front sphere surface

    // 1. Cheeks System (Separate blush meshes)
    const blushTex = createBlushTexture();
    const cheekGeo = new THREE.PlaneGeometry(0.42, 0.42);
    this.leftCheekMat = new THREE.MeshBasicMaterial({
      map: blushTex,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    this.rightCheekMat = this.leftCheekMat.clone();

    this.leftCheek = new THREE.Mesh(cheekGeo, this.leftCheekMat);
    this.leftCheek.position.set(-0.46, -0.16, 0.02);
    this.group.add(this.leftCheek);

    this.rightCheek = new THREE.Mesh(cheekGeo, this.rightCheekMat);
    this.rightCheek.position.set(0.46, -0.16, 0.02);
    this.group.add(this.rightCheek);

    // 2. Eyes System (Independent Eye Rigs)
    this.leftEyeRenderer = new DynamicEyeRenderer(true);
    this.rightEyeRenderer = new DynamicEyeRenderer(false);

    const eyeGeo = new THREE.PlaneGeometry(0.48, 0.48);
    const leftEyeMat = new THREE.MeshBasicMaterial({
      map: this.leftEyeRenderer.texture,
      transparent: true,
      depthWrite: false,
    });
    const rightEyeMat = new THREE.MeshBasicMaterial({
      map: this.rightEyeRenderer.texture,
      transparent: true,
      depthWrite: false,
    });

    this.leftEye = new THREE.Mesh(eyeGeo, leftEyeMat);
    this.leftEye.position.set(-0.28, 0.06, 0.03);
    this.group.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, rightEyeMat);
    this.rightEye.position.set(0.28, 0.06, 0.03);
    this.group.add(this.rightEye);

    // 3. Eyebrows System (3D Curved Arches)
    const browCurveLeft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, -0.02, 0),
      new THREE.Vector3(0.0, 0.06, 0),
      new THREE.Vector3(0.16, -0.02, 0),
    ]);
    const browGeo = new THREE.TubeGeometry(browCurveLeft, 16, 0.024, 8, false);
    const browMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.3,
      metalness: 0.08,
    });

    this.leftEyebrow = new THREE.Mesh(browGeo, browMat);
    this.leftEyebrow.position.set(-0.28, 0.32, 0.04);
    this.group.add(this.leftEyebrow);

    this.rightEyebrow = new THREE.Mesh(browGeo.clone(), browMat.clone());
    this.rightEyebrow.position.set(0.28, 0.32, 0.04);
    this.group.add(this.rightEyebrow);

    // 4. Mouth System (Independent dynamic mouth for lip-sync & speech)
    this.mouthRenderer = new DynamicMouthRenderer();
    const mouthGeo = new THREE.PlaneGeometry(0.72, 0.72);
    const mouthMat = new THREE.MeshBasicMaterial({
      map: this.mouthRenderer.texture,
      transparent: true,
      depthWrite: false,
    });

    this.mouth = new THREE.Mesh(mouthGeo, mouthMat);
    this.mouth.position.set(0, -0.22, 0.03);
    this.group.add(this.mouth);

    // Current State
    this.currentEyeState = {
      left: { open: 1.0, shape: 'round', pupilX: 0, pupilY: 0 },
      right: { open: 1.0, shape: 'round', pupilX: 0, pupilY: 0 },
    };
    this.currentMouthState = { shape: 'gentle_smile', open: 0.5, width: 1.0 };
    this.currentBlush = 0.0;

    // Initial render
    this.update();
  }

  setExpression(exprState) {
    if (!exprState) return;

    // 1. Update Eyes
    if (exprState.leftEye) {
      this.currentEyeState.left = { ...this.currentEyeState.left, ...exprState.leftEye };
    }
    if (exprState.rightEye) {
      this.currentEyeState.right = { ...this.currentEyeState.right, ...exprState.rightEye };
    }

    // 2. Update Eyebrows (Position & Rotation)
    if (exprState.leftEyebrow) {
      this.leftEyebrow.position.y = 0.32 + (exprState.leftEyebrow.y || 0);
      this.leftEyebrow.rotation.z = exprState.leftEyebrow.rot || 0;
    }
    if (exprState.rightEyebrow) {
      this.rightEyebrow.position.y = 0.32 + (exprState.rightEyebrow.y || 0);
      this.rightEyebrow.rotation.z = exprState.rightEyebrow.rot || 0;
    }

    // 3. Update Mouth
    if (exprState.mouth) {
      this.currentMouthState = { ...this.currentMouthState, ...exprState.mouth };
    }

    // 4. Update Blush
    if (exprState.blush !== undefined) {
      this.currentBlush = exprState.blush;
      this.leftCheekMat.opacity = this.currentBlush;
      this.rightCheekMat.opacity = this.currentBlush;
    }

    this.update();
  }

  setLookAt(targetX, targetY) {
    // Normalizes pupil gaze offset between -0.4 and 0.4
    const clampedX = Math.max(-0.4, Math.min(0.4, targetX));
    const clampedY = Math.max(-0.4, Math.min(0.4, targetY));

    this.currentEyeState.left.pupilX = clampedX;
    this.currentEyeState.left.pupilY = clampedY;
    this.currentEyeState.right.pupilX = clampedX;
    this.currentEyeState.right.pupilY = clampedY;

    this.leftEyeRenderer.draw(this.currentEyeState.left);
    this.rightEyeRenderer.draw(this.currentEyeState.right);
  }

  setBlink(leftOpen, rightOpen) {
    this.currentEyeState.left.open = leftOpen;
    this.currentEyeState.right.open = rightOpen;
    this.leftEyeRenderer.draw(this.currentEyeState.left);
    this.rightEyeRenderer.draw(this.currentEyeState.right);
  }

  setPhoneme(phoneme) {
    if (!phoneme) return;
    this.currentMouthState = { ...this.currentMouthState, ...phoneme };
    this.mouthRenderer.draw(this.currentMouthState);
  }

  setBlush(intensity) {
    this.currentBlush = Math.max(0, Math.min(1, intensity));
    this.leftCheekMat.opacity = this.currentBlush;
    this.rightCheekMat.opacity = this.currentBlush;
  }

  update() {
    this.leftEyeRenderer.draw(this.currentEyeState.left);
    this.rightEyeRenderer.draw(this.currentEyeState.right);
    this.mouthRenderer.draw(this.currentMouthState);
  }

  dispose() {
    this.leftEyeRenderer.dispose();
    this.rightEyeRenderer.dispose();
    this.mouthRenderer.dispose();
    this.leftCheekMat.dispose();
    this.rightCheekMat.dispose();
  }
}
