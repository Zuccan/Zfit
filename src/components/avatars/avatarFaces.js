import * as THREE from 'three';

/**
 * Creates high-resolution 1024x1024 canvas textures for each blob avatar face.
 */
export function createFaceTexture(avatarType) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, 1024, 1024);

  const cx = 512;
  const cy = 460;

  if (avatarType === 'yellow') {
    // YELLOW AVATAR: Left wink eye, right round eye with shine, happy open smile

    // Left eye (viewer's left) - Playful wink curve
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx - 100, cy - 25, 42, Math.PI * 1.15, Math.PI * 1.85, false);
    ctx.stroke();

    // Right eye (viewer's right) - Big round glossy eye
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(cx + 100, cy - 35, 38, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx + 88, cy - 50, 12, 16, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Happy open mouth
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.moveTo(cx - 85, cy + 80);
    ctx.quadraticCurveTo(cx, cy + 65, cx + 85, cy + 80);
    ctx.quadraticCurveTo(cx + 80, cy + 200, cx, cy + 210);
    ctx.quadraticCurveTo(cx - 80, cy + 200, cx - 85, cy + 80);
    ctx.closePath();
    ctx.fill();

    // Cute pink tongue
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#ff6b8b';
    ctx.beginPath();
    ctx.arc(cx, cy + 200, 75, Math.PI, 0, false);
    ctx.fill();
    ctx.restore();
  } else if (avatarType === 'blue') {
    // BLUE AVATAR: Two big wide cartoon eyes, sweet curved smile

    // Left Eye
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(cx - 95, cy - 30, 44, 58, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Left eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - 108, cy - 50, 16, 20, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 80, cy - 12, 7, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(cx + 95, cy - 30, 44, 58, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Right eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx + 82, cy - 50, 16, 20, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 110, cy - 12, 7, 0, Math.PI * 2);
    ctx.fill();

    // Cute curved smile
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy + 85, 48, Math.PI * 0.15, Math.PI * 0.85, false);
    ctx.stroke();
  } else if (avatarType === 'green') {
    // GREEN AVATAR: Inquisitive raised eyebrow, happy glossy eyes, jaunty smile

    // Raised Eyebrow over left eye
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 130, cy - 120);
    ctx.quadraticCurveTo(cx - 80, cy - 160, cx - 30, cy - 125);
    ctx.stroke();

    // Left Eye
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(cx - 85, cy - 40, 38, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - 96, cy - 56, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(cx + 85, cy - 40, 38, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx + 74, cy - 56, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy + 60);
    ctx.quadraticCurveTo(cx, cy + 45, cx + 70, cy + 60);
    ctx.quadraticCurveTo(cx + 60, cy + 155, cx, cy + 160);
    ctx.quadraticCurveTo(cx - 60, cy + 155, cx - 70, cy + 60);
    ctx.closePath();
    ctx.fill();
  } else if (avatarType === 'pink') {
    // PINK AVATAR: Joyful squinting eyes '> <', open cheering mouth, rosy blush

    // Rosy Blush
    ctx.fillStyle = 'rgba(255, 60, 110, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx - 150, cy + 30, 48, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 150, cy + 30, 48, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left Squint Eye '>'
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy - 70);
    ctx.lineTo(cx - 60, cy - 35);
    ctx.lineTo(cx - 120, cy);
    ctx.stroke();

    // Right Squint Eye '<'
    ctx.beginPath();
    ctx.moveTo(cx + 120, cy - 70);
    ctx.lineTo(cx + 60, cy - 35);
    ctx.lineTo(cx + 120, cy);
    ctx.stroke();

    // Cheering Open Mouth
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy + 70);
    ctx.quadraticCurveTo(cx, cy + 55, cx + 65, cy + 70);
    ctx.quadraticCurveTo(cx + 55, cy + 160, cx, cy + 170);
    ctx.quadraticCurveTo(cx - 55, cy + 160, cx - 65, cy + 70);
    ctx.closePath();
    ctx.fill();

    // Tongue
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#ff4d79';
    ctx.beginPath();
    ctx.arc(cx, cy + 160, 55, Math.PI, 0, false);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
