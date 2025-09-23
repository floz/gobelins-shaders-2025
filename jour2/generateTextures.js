import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

function generateTextureA() {
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#ff6600');
    gradient.addColorStop(0.5, '#ffcc00');
    gradient.addColorStop(1, '#ff0066');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // Grid pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    for(let i = 0; i < 1024; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1024);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1024, i);
        ctx.stroke();
    }

    return canvas;
}

function generateTextureB() {
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');

    // Radial gradient
    const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
    gradient.addColorStop(0, '#0066ff');
    gradient.addColorStop(0.5, '#00ffff');
    gradient.addColorStop(1, '#6600ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // Circles
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    for(let r = 50; r < 512; r += 50) {
        ctx.beginPath();
        ctx.arc(512, 512, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    return canvas;
}

// Generate and save textures
const textureA = generateTextureA();
const textureB = generateTextureB();

const dir = './public/assets/textures';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Save as JPG
fs.writeFileSync(path.join(dir, 'a.jpg'), textureA.toBuffer('image/jpeg'));
fs.writeFileSync(path.join(dir, 'b.jpg'), textureB.toBuffer('image/jpeg'));

console.log('Textures generated successfully!');