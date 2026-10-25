import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createFaceTexture } from './avatarFaces';

export default function GreenAvatar({ 
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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xaef58c, 1.4);
    fillLight.position.set(-4, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // 1. Lime Green Blob Body
    const bodyGeo = new THREE.SphereGeometry(1, 64, 64);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x8ce65b,
      roughness: 0.26,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.12,
      sheen: 0.4,
      sheenColor: 0xc4ff9e,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.scale.set(1.02, 0.96, 0.98);
    bodyMesh.castShadow = true;
    avatarGroup.add(bodyMesh);

    // 2. Face Plane Decal
    const faceTex = createFaceTexture('green');
    const faceGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      transparent: true,
      depthWrite: false,
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(0, -0.02, 1.01);
    avatarGroup.add(faceMesh);

    // 3. 3D Hair Flick / Tuft on top
    const hairCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 0.92, 0.2),
      new THREE.Vector3(-0.15, 1.1, 0.18),
      new THREE.Vector3(-0.35, 1.18, 0.12),
      new THREE.Vector3(-0.48, 1.12, 0.08),
    ]);
    const hairGeo = new THREE.TubeGeometry(hairCurve, 32, 0.06, 16, false);
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.3,
      metalness: 0.1,
    });
    const hairMesh = new THREE.Mesh(hairGeo, blackMat);
    hairMesh.castShadow = true;
    avatarGroup.add(hairMesh);

    // 4. Hands
    const handGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const handMat = bodyMat.clone();

    const hand = new THREE.Mesh(handGeo, handMat);
    hand.position.set(0.68, -0.4, 0.65);
    avatarGroup.add(hand);

    // Mouse Interaction
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
      targetScale = 0.92;
      if (onClick) onClick();
    };

    const handleMouseUp = () => {
      targetScale = 1;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (autoAnimate) {
        avatarGroup.position.y = Math.sin(elapsedTime * 2.1 + 2) * 0.08;
        avatarGroup.rotation.z = Math.sin(elapsedTime * 1.6 + 0.5) * 0.02;
      }

      avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.08;
      avatarGroup.rotation.x += (targetRotX - avatarGroup.rotation.x) * 0.08;

      currentScale += (targetScale - currentScale) * 0.15;
      avatarGroup.scale.set(currentScale, currentScale, currentScale);

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
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      bodyGeo.dispose();
      bodyMat.dispose();
      faceGeo.dispose();
      faceMat.dispose();
      faceTex.dispose();
      hairGeo.dispose();
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
