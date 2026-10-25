import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createFaceTexture } from './avatarFaces';

export default function BlobAvatarsScene({ className = '', style = {} }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.0);
    keyLight.position.set(4, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdcf0ff, 1.3);
    fillLight.position.set(-5, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. White 3D iPhone in Center
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(0.2, 0.05, 0.2);
    phoneGroup.rotation.z = -0.06;
    rootGroup.add(phoneGroup);

    // Phone Body
    const phoneGeo = new THREE.BoxGeometry(1.6, 2.7, 0.12);
    const phoneMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
      clearcoat: 0.8,
    });
    const phoneMesh = new THREE.Mesh(phoneGeo, phoneMat);
    phoneMesh.castShadow = true;
    phoneGroup.add(phoneMesh);

    // Phone Screen with Outfit Card
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 860;
    const sCtx = screenCanvas.getContext('2d');
    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(0, 0, 512, 860);

    // Header: Back Chevron & Dots
    sCtx.fillStyle = '#141414';
    sCtx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    sCtx.fillText('<', 32, 70);
    sCtx.fillText('⋮', 460, 70);

    // Title: Today's Outfit
    sCtx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
    sCtx.fillText("Today's Outfit", 32, 140);

    // Outfit Cards
    sCtx.fillStyle = '#f8f8f8';
    sCtx.beginPath();
    sCtx.roundRect(32, 175, 210, 240, 24);
    sCtx.fill();

    sCtx.beginPath();
    sCtx.roundRect(268, 175, 210, 360, 24);
    sCtx.fill();

    sCtx.beginPath();
    sCtx.roundRect(32, 440, 210, 160, 24);
    sCtx.fill();

    // Color Swatches
    const colors = ['#1a1a1a', '#8e8e93', '#d1bfa7', '#d8d5f5'];
    colors.forEach((col, i) => {
      sCtx.fillStyle = col;
      sCtx.beginPath();
      sCtx.arc(50 + i * 50, 660, 18, 0, Math.PI * 2);
      sCtx.fill();
    });

    // "Get This Look ->" Button
    sCtx.fillStyle = '#111111';
    sCtx.beginPath();
    sCtx.roundRect(32, 720, 448, 80, 40);
    sCtx.fill();
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('Get This Look →', 256, 770);

    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    const screenGeo = new THREE.PlaneGeometry(1.5, 2.55);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0, 0.065);
    phoneGroup.add(screenMesh);

    // 2. Yellow Avatar (Bottom Center)
    const yellowGroup = new THREE.Group();
    yellowGroup.position.set(-0.25, -1.05, 0.45);
    rootGroup.add(yellowGroup);

    const yellowBodyGeo = new THREE.SphereGeometry(0.72, 48, 48);
    const yellowMat = new THREE.MeshPhysicalMaterial({
      color: 0xffc83b,
      roughness: 0.28,
      metalness: 0.04,
      clearcoat: 0.35,
    });
    const yellowBody = new THREE.Mesh(yellowBodyGeo, yellowMat);
    yellowBody.scale.set(1.05, 0.96, 0.98);
    yellowGroup.add(yellowBody);

    const yellowFaceTex = createFaceTexture('yellow');
    const yellowFaceMat = new THREE.MeshBasicMaterial({ map: yellowFaceTex, transparent: true, depthWrite: false });
    const yellowFace = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), yellowFaceMat);
    yellowFace.position.set(0, -0.01, 0.73);
    yellowGroup.add(yellowFace);

    // Yellow Hair Curl
    const yellowHairCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.4, 0.35, 0.62),
      new THREE.Vector3(-0.25, 0.52, 0.6),
      new THREE.Vector3(0.05, 0.55, 0.6),
      new THREE.Vector3(0.18, 0.45, 0.62),
    ]);
    const yellowHair = new THREE.Mesh(
      new THREE.TubeGeometry(yellowHairCurve, 24, 0.045, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.3 })
    );
    yellowGroup.add(yellowHair);

    // Purple Shirt
    const shirtMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.55, 0.08),
      new THREE.MeshPhysicalMaterial({ color: 0x9b8df2, roughness: 0.3, clearcoat: 0.2 })
    );
    shirtMesh.position.set(0.12, -0.4, 0.65);
    yellowGroup.add(shirtMesh);

    // 3. Blue Avatar (Top Peeker)
    const blueGroup = new THREE.Group();
    blueGroup.position.set(0.2, 1.25, -0.1);
    rootGroup.add(blueGroup);

    const blueBodyGeo = new THREE.SphereGeometry(0.68, 48, 48);
    const blueMat = new THREE.MeshPhysicalMaterial({
      color: 0x54b5ff,
      roughness: 0.25,
      clearcoat: 0.38,
    });
    const blueBody = new THREE.Mesh(blueBodyGeo, blueMat);
    blueGroup.add(blueBody);

    const blueFaceTex = createFaceTexture('blue');
    const blueFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.8),
      new THREE.MeshBasicMaterial({ map: blueFaceTex, transparent: true, depthWrite: false })
    );
    blueFace.position.set(0, -0.02, 0.69);
    blueGroup.add(blueFace);

    // Blue Antenna Loop
    const blueAntennaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.65, 0.05),
      new THREE.Vector3(0.08, 0.85, 0.08),
      new THREE.Vector3(-0.12, 1.05, 0.05),
      new THREE.Vector3(-0.18, 1.18, 0.0),
      new THREE.Vector3(-0.02, 1.25, -0.05),
      new THREE.Vector3(0.12, 1.15, -0.08),
      new THREE.Vector3(0.08, 1.0, -0.05),
    ]);
    const blueAntenna = new THREE.Mesh(
      new THREE.TubeGeometry(blueAntennaCurve, 36, 0.04, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.3 })
    );
    blueGroup.add(blueAntenna);

    // 4. Green Avatar (Left)
    const greenGroup = new THREE.Group();
    greenGroup.position.set(-1.05, 0.3, 0.1);
    rootGroup.add(greenGroup);

    const greenBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 48, 48),
      new THREE.MeshPhysicalMaterial({ color: 0x8ce65b, roughness: 0.26, clearcoat: 0.35 })
    );
    greenGroup.add(greenBody);

    const greenFaceTex = createFaceTexture('green');
    const greenFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.72),
      new THREE.MeshBasicMaterial({ map: greenFaceTex, transparent: true, depthWrite: false })
    );
    greenFace.position.set(0, -0.01, 0.61);
    greenGroup.add(greenFace);

    // 5. Pink Avatar (Right)
    const pinkGroup = new THREE.Group();
    pinkGroup.position.set(1.2, -0.25, 0.2);
    rootGroup.add(pinkGroup);

    const pinkBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 48, 48),
      new THREE.MeshPhysicalMaterial({ color: 0xff7da1, roughness: 0.25, clearcoat: 0.4 })
    );
    pinkGroup.add(pinkBody);

    const pinkFaceTex = createFaceTexture('pink');
    const pinkFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.74, 0.74),
      new THREE.MeshBasicMaterial({ map: pinkFaceTex, transparent: true, depthWrite: false })
    );
    pinkFace.position.set(0, -0.01, 0.63);
    pinkGroup.add(pinkFace);

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = x * 0.35;
      targetRotX = -y * 0.25;
    };

    const handleMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Organic individual levitation offsets
      yellowGroup.position.y = -1.05 + Math.sin(t * 2) * 0.05;
      blueGroup.position.y = 1.25 + Math.sin(t * 2.2 + 1) * 0.05;
      greenGroup.position.y = 0.3 + Math.sin(t * 2.1 + 2) * 0.05;
      pinkGroup.position.y = -0.25 + Math.sin(t * 2.3 + 3) * 0.05;
      phoneGroup.position.y = 0.05 + Math.sin(t * 1.8) * 0.04;

      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

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

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`relative w-full h-full cursor-pointer select-none ${className}`}
      style={{ minHeight: '440px', ...style }}
    />
  );
}
