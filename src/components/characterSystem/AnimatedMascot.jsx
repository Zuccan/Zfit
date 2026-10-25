import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { CharacterRig } from './CharacterRig';

const AnimatedMascot = forwardRef(function AnimatedMascot(
  {
    character = 'yellow',
    expression = 'happy',
    isTalking = false,
    blushIntensity = null,
    interactive = true,
    autoAnimate = true,
    className = '',
    style = {},
    onClick = null,
  },
  ref
) {
  const mountRef = useRef(null);
  const rigRef = useRef(null);

  // Expose imperative API for external animation triggers
  useImperativeHandle(ref, () => ({
    blink: () => rigRef.current?.triggerBlink(),
    wink: (eye = 'right') => rigRef.current?.triggerWink(eye),
    wave: () => rigRef.current?.triggerWave(),
    squish: (amount = 0.82) => rigRef.current?.triggerSquish(amount),
    speak: (duration = 3) => rigRef.current?.startTalking(duration),
    stopSpeaking: () => rigRef.current?.stopTalking(),
    setExpression: (expr) => rigRef.current?.setExpression(expr),
    setBlush: (val) => rigRef.current?.setBlush(val),
    lookAt: (x, y) => rigRef.current?.setLookAt(x, y),
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
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

    // 2. Studio Lighting Setup (Glossy Clay Look)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ec, 2.2);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdceeff, 1.4);
    fillLight.position.set(-4, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // 3. Initialize Rigged Mascot
    const rig = new CharacterRig(character);
    rigRef.current = rig;
    scene.add(rig.root);

    // 4. Mouse Tracking & Gaze
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      targetRotY = normX * 0.45;
      targetRotX = -normY * 0.35;

      // LookAt tracking
      rig.setLookAt(normX * 0.35, -normY * 0.35);
    };

    const handleMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
      rig.setLookAt(0, 0);
    };

    const handleMouseDown = () => {
      rig.triggerSquish(0.85); // Organic spring squish
      if (onClick) onClick(character);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousedown', handleMouseDown);

    // 5. Render Loop with Animation Physics
    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Idle floating levitation
      if (autoAnimate) {
        rig.root.position.y = Math.sin(elapsed * 2.0) * 0.08;
        rig.root.rotation.z = Math.sin(elapsed * 1.5) * 0.02;
      }

      // Smooth mouse rotation damping
      rig.root.rotation.y += (targetRotY - rig.root.rotation.y) * 0.08;
      rig.root.rotation.x += (targetRotX - rig.root.rotation.x) * 0.08;

      // Update Rig internal animations (breathing, blinking, speaking, waving)
      rig.update(delta, elapsed);

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize Observer
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

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousedown', handleMouseDown);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      rig.dispose();
      renderer.dispose();
    };
  }, [character, interactive, autoAnimate, onClick]);

  // Handle external prop changes (expression, talking, blush)
  useEffect(() => {
    if (rigRef.current) {
      rigRef.current.setExpression(expression);
    }
  }, [expression]);

  useEffect(() => {
    if (rigRef.current) {
      if (isTalking) {
        rigRef.current.startTalking(100); // Continuous while prop is true
      } else {
        rigRef.current.stopTalking();
      }
    }
  }, [isTalking]);

  useEffect(() => {
    if (rigRef.current && blushIntensity !== null) {
      rigRef.current.setBlush(blushIntensity);
    }
  }, [blushIntensity]);

  return (
    <div
      ref={mountRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ width: '100%', height: '100%', minWidth: '160px', minHeight: '160px', ...style }}
    />
  );
});

export default AnimatedMascot;
