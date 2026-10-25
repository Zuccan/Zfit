import * as THREE from 'three';
import { FaceRig } from './FaceRig';
import { EXPRESSIONS, PHONEMES, MASCOTS } from './expressions';

export class CharacterRig {
  constructor(mascotId = 'yellow') {
    this.mascotConfig = MASCOTS[mascotId] || MASCOTS.yellow;
    this.root = new THREE.Group();

    // Expression & Animation State
    this.currentExpression = 'neutral';
    this.isBlinking = false;
    this.blinkTimer = 0;
    this.nextBlinkTime = 2.5 + Math.random() * 3;
    this.isWaving = false;
    this.waveTimer = 0;
    this.isTalking = false;
    this.speechTimer = 0;
    this.phonemeIndex = 0;
    this.squishSpring = { current: 1.0, target: 1.0, velocity: 0 };
    this.lookTarget = { x: 0, y: 0 };

    // 1. Base Blob Body (Organic claymorphic sphere)
    this.bodyGeo = new THREE.SphereGeometry(1, 64, 64);
    this.bodyMat = new THREE.MeshPhysicalMaterial({
      color: this.mascotConfig.color,
      roughness: 0.25,
      metalness: 0.04,
      clearcoat: 0.38,
      clearcoatRoughness: 0.1,
      sheen: 0.45,
      sheenColor: this.mascotConfig.sheenColor,
    });
    this.bodyMesh = new THREE.Mesh(this.bodyGeo, this.bodyMat);
    this.bodyMesh.scale.set(1.04, 0.96, 0.98);
    this.bodyMesh.castShadow = true;
    this.root.add(this.bodyMesh);

    // 2. Modular FaceRig (Eyes, Eyebrows, Cheeks, Mouth)
    this.faceRig = new FaceRig();
    this.root.add(this.faceRig.group);

    // 3. Hands Rig (Left & Right 3D Hands)
    this.handsGroup = new THREE.Group();
    this.root.add(this.handsGroup);

    const handGeo = new THREE.SphereGeometry(0.2, 32, 32);
    this.handMat = this.bodyMat.clone();

    this.leftHand = new THREE.Mesh(handGeo, this.handMat);
    this.leftHand.position.set(-0.48, -0.52, 0.75);
    this.handsGroup.add(this.leftHand);

    this.rightHand = new THREE.Mesh(handGeo, this.handMat);
    this.rightHand.position.set(0.48, -0.52, 0.75);
    this.handsGroup.add(this.rightHand);

    // 4. Character Specific Accessories & Hair Rig
    this.accessoriesGroup = new THREE.Group();
    this.root.add(this.accessoriesGroup);
    this.buildCharacterAccessories(mascotId);

    // Initialize default expression
    this.setExpression(this.mascotConfig.defaultExpression || 'happy');
  }

  buildCharacterAccessories(mascotId) {
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.3,
      metalness: 0.1,
    });

    if (mascotId === 'yellow') {
      // Sweeping Hair Curl on Forehead
      const hairCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.48, 0.52, 0.82),
        new THREE.Vector3(-0.35, 0.76, 0.8),
        new THREE.Vector3(-0.1, 0.84, 0.78),
        new THREE.Vector3(0.12, 0.76, 0.82),
        new THREE.Vector3(0.24, 0.58, 0.86),
      ]);
      const hairMesh = new THREE.Mesh(new THREE.TubeGeometry(hairCurve, 32, 0.06, 12, false), blackMat);
      hairMesh.castShadow = true;
      this.accessoriesGroup.add(hairMesh);

      // White Sneakers in hands
      const shoeGeo = new THREE.BoxGeometry(0.26, 0.18, 0.42);
      const shoeMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, clearcoat: 0.3 });
      
      const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
      leftShoe.position.set(-0.2, -0.54, 0.95);
      leftShoe.rotation.set(0.2, 0.1, -0.1);
      this.accessoriesGroup.add(leftShoe);

      const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
      rightShoe.position.set(0.2, -0.54, 0.95);
      rightShoe.rotation.set(0.2, -0.1, 0.1);
      this.accessoriesGroup.add(rightShoe);
    } else if (mascotId === 'blue') {
      // Loopy Antenna on Top
      const antennaCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 0.92, 0.05),
        new THREE.Vector3(0.08, 1.18, 0.1),
        new THREE.Vector3(-0.15, 1.38, 0.08),
        new THREE.Vector3(-0.24, 1.54, 0.02),
        new THREE.Vector3(-0.06, 1.66, -0.02),
        new THREE.Vector3(0.18, 1.54, -0.06),
        new THREE.Vector3(0.12, 1.32, -0.05),
      ]);
      const antennaMesh = new THREE.Mesh(new THREE.TubeGeometry(antennaCurve, 40, 0.05, 12, false), blackMat);
      antennaMesh.castShadow = true;
      this.accessoriesGroup.add(antennaMesh);

      // Cool Sunglasses
      const glassesGroup = new THREE.Group();
      glassesGroup.position.set(0, 0.12, 1.02);

      const frameMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.15, clearcoat: 0.8 });
      const leftLens = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.06), frameMat);
      leftLens.position.set(-0.26, 0, 0);
      leftLens.rotation.z = -0.1;
      glassesGroup.add(leftLens);

      const rightLens = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.06), frameMat);
      rightLens.position.set(0.26, 0, 0);
      rightLens.rotation.z = 0.1;
      glassesGroup.add(rightLens);

      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.06), frameMat);
      bridge.position.set(0, 0.04, 0);
      glassesGroup.add(bridge);

      this.sunglasses = glassesGroup;
      this.accessoriesGroup.add(glassesGroup);
    } else if (mascotId === 'green') {
      // Hair Tuft / Flick on Top
      const hairCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.05, 0.92, 0.15),
        new THREE.Vector3(-0.16, 1.12, 0.14),
        new THREE.Vector3(-0.38, 1.2, 0.1),
        new THREE.Vector3(-0.5, 1.14, 0.06),
      ]);
      const hairMesh = new THREE.Mesh(new THREE.TubeGeometry(hairCurve, 28, 0.055, 12, false), blackMat);
      this.accessoriesGroup.add(hairMesh);

      // Cream Sweatshirt on Clothes Hanger
      const sweaterGroup = new THREE.Group();
      sweaterGroup.position.set(0.0, -0.68, 0.85);

      const sweaterMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.65, 0.14),
        new THREE.MeshPhysicalMaterial({ color: 0xf5eedc, roughness: 0.5, clearcoat: 0.1 })
      );
      sweaterGroup.add(sweaterMesh);

      const hangerMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.02, 8, 24, Math.PI),
        blackMat
      );
      hangerMesh.position.set(0, 0.36, 0);
      hangerMesh.rotation.z = Math.PI;
      sweaterGroup.add(hangerMesh);

      this.accessoriesGroup.add(sweaterGroup);
    } else if (mascotId === 'pink') {
      // Headphone Arc over head
      const bandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.85, 0.2, 0.2),
        new THREE.Vector3(-0.7, 0.85, 0.15),
        new THREE.Vector3(0.0, 1.08, 0.1),
        new THREE.Vector3(0.7, 0.85, 0.15),
        new THREE.Vector3(0.85, 0.2, 0.2),
      ]);
      const bandMesh = new THREE.Mesh(new THREE.TubeGeometry(bandCurve, 32, 0.05, 12, false), blackMat);
      this.accessoriesGroup.add(bandMesh);

      // Black Wide-Leg Trousers in hands
      const pantsGroup = new THREE.Group();
      pantsGroup.position.set(0.0, -0.75, 0.85);

      const pantsMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.85, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.6 })
      );
      pantsGroup.add(pantsMesh);

      this.accessoriesGroup.add(pantsGroup);
    }
  }

  setExpression(exprName) {
    this.currentExpression = exprName;
    const exprState = EXPRESSIONS[exprName] || EXPRESSIONS.happy;
    this.faceRig.setExpression(exprState);

    // Apply head tilt & squash target
    if (exprState.headTilt) {
      this.root.rotation.x = exprState.headTilt.x || 0;
      this.root.rotation.y = exprState.headTilt.y || 0;
      this.root.rotation.z = exprState.headTilt.z || 0;
    }
  }

  setLookAt(targetX, targetY) {
    this.lookTarget = { x: targetX, y: targetY };
    this.faceRig.setLookAt(targetX, targetY);
  }

  triggerBlink() {
    this.isBlinking = true;
    this.blinkTimer = 0;
  }

  triggerWink(eye = 'right') {
    if (eye === 'left') {
      this.faceRig.setBlink(0.0, 1.0);
    } else {
      this.faceRig.setBlink(1.0, 0.0);
    }
    setTimeout(() => {
      this.faceRig.setBlink(1.0, 1.0);
    }, 400);
  }

  triggerWave() {
    this.isWaving = true;
    this.waveTimer = 0;
  }

  triggerSquish(intensity = 0.82) {
    this.squishSpring.current = intensity;
    this.squishSpring.target = 1.0;
  }

  startTalking(durationSeconds = 3) {
    this.isTalking = true;
    this.speechTimer = durationSeconds;
    this.phonemeIndex = 0;
  }

  stopTalking() {
    this.isTalking = false;
    this.faceRig.setPhoneme(PHONEMES.REST);
  }

  setBlush(intensity) {
    this.faceRig.setBlush(intensity);
  }

  update(delta, elapsed) {
    // 1. Idle Breathing & Bobbing
    const breathOffset = Math.sin(elapsed * 2.2) * 0.03;
    this.bodyMesh.scale.y = (0.96 + breathOffset) * this.squishSpring.current;
    this.bodyMesh.scale.x = (1.04 - breathOffset * 0.5) / Math.sqrt(this.squishSpring.current);
    this.bodyMesh.scale.z = (0.98 - breathOffset * 0.5) / Math.sqrt(this.squishSpring.current);

    // Spring damping for squish
    this.squishSpring.current += (this.squishSpring.target - this.squishSpring.current) * 0.18;

    // 2. Natural Random Blinking
    this.nextBlinkTime -= delta;
    if (this.nextBlinkTime <= 0 && !this.isBlinking) {
      this.triggerBlink();
      this.nextBlinkTime = 2.5 + Math.random() * 3.5;
    }

    if (this.isBlinking) {
      this.blinkTimer += delta;
      if (this.blinkTimer < 0.12) {
        // Closing eyelids
        const progress = 1.0 - this.blinkTimer / 0.12;
        this.faceRig.setBlink(progress, progress);
      } else if (this.blinkTimer < 0.25) {
        // Opening eyelids
        const progress = (this.blinkTimer - 0.12) / 0.13;
        this.faceRig.setBlink(progress, progress);
      } else {
        this.faceRig.setBlink(1.0, 1.0);
        this.isBlinking = false;
      }
    }

    // 3. Waving Hand Animation
    if (this.isWaving) {
      this.waveTimer += delta;
      const waveAngle = Math.sin(this.waveTimer * 12) * 0.35;
      this.rightHand.position.y = -0.1 + Math.sin(this.waveTimer * 6) * 0.1;
      this.rightHand.position.x = 0.65 + waveAngle * 0.2;
      this.rightHand.rotation.z = waveAngle;

      if (this.waveTimer > 2.0) {
        this.isWaving = false;
        this.rightHand.position.set(0.48, -0.52, 0.75);
        this.rightHand.rotation.z = 0;
      }
    }

    // 4. Speech & Lip-Sync Animation Loop
    if (this.isTalking) {
      this.speechTimer -= delta;
      const speechSpeed = 0.12; // Change phoneme every 120ms
      const phonemeKeys = ['A', 'O', 'E', 'U', 'M', 'A', 'E'];
      const currentPhonemeKey = phonemeKeys[Math.floor(elapsed / speechSpeed) % phonemeKeys.length];
      this.faceRig.setPhoneme(PHONEMES[currentPhonemeKey]);

      // Subtle speech head bobbing
      this.root.position.y = Math.sin(elapsed * 10) * 0.02;

      if (this.speechTimer <= 0) {
        this.stopTalking();
      }
    }
  }

  dispose() {
    this.faceRig?.dispose();
    this.bodyGeo?.dispose();
    this.bodyMat?.dispose();
    this.handMat?.dispose();
  }
}
