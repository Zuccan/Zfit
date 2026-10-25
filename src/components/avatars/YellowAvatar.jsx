import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createFaceTexture } from './avatarFaces';

export default function YellowAvatar({ 
  className = '', 
  style = {},
  interactive = true, 
  autoAnimate = true,
  onClick = null
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9ecff, 1.4);
    fillLight.position.set(-4, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // Main Avatar Root Group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // 1. Yellow Blob Body (Sphere with Clay Material)
    const bodyGeo = new THREE.SphereGeometry(1, 64, 64);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0xffc83b,
      roughness: 0.28,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.12,
      sheen: 0.4,
      sheenColor: 0xffe680,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.scale.set(1.05, 0.96, 0.98);
    bodyMesh.castShadow = true;
    avatarGroup.add(bodyMesh);

    // 2. Face Plane Decal (Rendered slightly on front surface)
    const faceTex = createFaceTexture('yellow');
    const faceGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      transparent: true,
      depthWrite: false,
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(0, -0.02, 1.01);
    avatarGroup.add(faceMesh);

    // 3. 3D Hair Curl (Sweeping black curve)
    const hairCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, 0.45, 0.85),
      new THREE.Vector3(-0.4, 0.72, 0.82),
      new THREE.Vector3(-0.15, 0.82, 0.8),
      new THREE.Vector3(0.08, 0.76, 0.82),
      new THREE.Vector3(0.22, 0.62, 0.86),
      new THREE.Vector3(0.24, 0.48, 0.88),
    ]);
    const hairGeo = new THREE.TubeGeometry(hairCurve, 40, 0.065, 16, false);
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.3,
      metalness: 0.1,
    });
    const hairMesh = new THREE.Mesh(hairGeo, blackMat);
    hairMesh.castShadow = true;
    avatarGroup.add(hairMesh);

    // 4. Lavender T-Shirt & Clothes Hanger Group
    const shirtGroup = new THREE.Group();
    shirtGroup.position.set(0.12, -0.65, 0.8);
    avatarGroup.add(shirtGroup);

    // Hanger Hook & Frame
    const hangerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, 0.42, 0),
      new THREE.Vector3(0.08, 0.36, 0),
      new THREE.Vector3(0.02, 0.28, 0),
      new THREE.Vector3(0.0, 0.22, 0),
      new THREE.Vector3(-0.35, 0.08, 0),
      new THREE.Vector3(0.35, 0.08, 0),
      new THREE.Vector3(0.0, 0.22, 0),
    ]);
    const hangerGeo = new THREE.TubeGeometry(hangerCurve, 32, 0.02, 12, false);
    const hangerMesh = new THREE.Mesh(hangerGeo, blackMat);
    shirtGroup.add(hangerMesh);

    // Lavender T-Shirt Mesh
    const shirtShape = new THREE.Shape();
    shirtShape.moveTo(-0.38, 0.05);
    shirtShape.lineTo(0.38, 0.05);
    shirtShape.lineTo(0.5, -0.05);
    shirtShape.lineTo(0.38, -0.2);
    shirtShape.lineTo(0.3, -0.15);
    shirtShape.lineTo(0.28, -0.65);
    shirtShape.lineTo(-0.28, -0.65);
    shirtShape.lineTo(-0.3, -0.15);
    shirtShape.lineTo(-0.38, -0.2);
    shirtShape.lineTo(-0.5, -0.05);
    shirtShape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const shirtGeo = new THREE.ExtrudeGeometry(shirtShape, extrudeSettings);
    const shirtMat = new THREE.MeshPhysicalMaterial({
      color: 0x9b8df2, // Vibrant lavender
      roughness: 0.35,
      metalness: 0.02,
      clearcoat: 0.2,
    });
    const shirtMesh = new THREE.Mesh(shirtGeo, shirtMat);
    shirtMesh.position.set(0, 0, -0.04);
    shirtMesh.castShadow = true;
    shirtGroup.add(shirtMesh);

    // 5. Blob Sphere Hands
    const handGeo = new THREE.SphereGeometry(0.2, 32, 32);
    const handMat = bodyMat.clone();

    // Left Hand holding shirt
    const leftHand = new THREE.Mesh(handGeo, handMat);
    leftHand.position.set(-0.36, -0.62, 0.88);
    avatarGroup.add(leftHand);

    // Right Hand holding shirt
    const rightHand = new THREE.Mesh(handGeo, handMat);
    rightHand.position.set(0.48, -0.62, 0.88);
    avatarGroup.add(rightHand);

    // Interactive Mouse Tracking & Squish
    let targetRotX = 0;
    let targetRotY = 0;
    let targetScale = 1;
    let currentScale = 1;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = x * 0.45;
      targetRotX = -y * 0.35;
    };

    const handleMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
      targetScale = 1;
    };

    const handleMouseDown = () => {
      targetScale = 0.92; // Playful squish on click
      if (onClick) onClick();
    };

    const handleMouseUp = () => {
      targetScale = 1;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle floating levitation
      if (autoAnimate) {
        avatarGroup.position.y = Math.sin(elapsedTime * 2) * 0.08;
        avatarGroup.rotation.z = Math.sin(elapsedTime * 1.5) * 0.02;
      }

      // Smooth mouse rotation damping
      avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.08;
      avatarGroup.rotation.x += (targetRotX - avatarGroup.rotation.x) * 0.08;

      // Squish spring damping
      currentScale += (targetScale - currentScale) * 0.15;
      avatarGroup.scale.set(currentScale, currentScale, currentScale);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js resources
      bodyGeo.dispose();
      bodyMat.dispose();
      faceGeo.dispose();
      faceMat.dispose();
      faceTex.dispose();
      hairGeo.dispose();
      hangerGeo.dispose();
      shirtGeo.dispose();
      shirtMat.dispose();
      handGeo.dispose();
      handMat.dispose();
      renderer.dispose();
    };
  }, [interactive, autoAnimate, onClick]);

  return (
    <div 
      ref={mountRef} 
      className={`relative cursor-pointer select-none ${className}`}
      style={{ width: '100%', height: '100%', minWidth: '160px', minHeight: '160px', ...style }}
    />
  );
}
