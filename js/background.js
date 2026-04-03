import { currentPalette } from './state.js';
import { shadeColor } from './utils.js';

function drawMountainRange(ctx, peaks, groundY, bodyColor, shadowColor, snowColor, snowLine) {
    ctx.beginPath();
    ctx.moveTo(peaks[0].x - 50, groundY);
    for (let i = 0; i < peaks.length; i++) {
        const p = peaks[i];
        const next = peaks[i + 1];
        if (next) {
            const cpX = (p.x + next.x) / 2;
            ctx.quadraticCurveTo(p.x, p.y, cpX, (p.y + next.y) / 2);
        } else {
            ctx.quadraticCurveTo(p.x, p.y, p.x + 50, groundY);
        }
    }
    ctx.lineTo(peaks[peaks.length - 1].x + 50, groundY);
    ctx.closePath();

    const minY = Math.min(...peaks.map(p => p.y));
    const grad = ctx.createLinearGradient(0, minY, 0, groundY);
    grad.addColorStop(0, bodyColor);
    // Use a shifted shadow color for better depth
    grad.addColorStop(1, shadowColor || shadeColor(bodyColor, -40));
    ctx.fillStyle = grad;
    ctx.fill();

    // Side shadows for 3D feel
    for (const p of peaks) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.w * 0.55, p.y + p.h * 0.6);
        ctx.lineTo(p.x + p.w * 0.5, groundY > p.y + p.h ? p.y + p.h : groundY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();
    }

    if (snowColor) {
        for (const p of peaks) {
            if (p.y > snowLine) continue;
            const snowBase = p.y + (snowLine - p.y) * 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.w * 0.08, p.y + (snowBase - p.y) * 0.5);
            ctx.lineTo(p.x - p.w * 0.04, p.y + (snowBase - p.y) * 0.7);
            ctx.lineTo(p.x + p.w * 0.02, p.y + (snowBase - p.y) * 0.55);
            ctx.lineTo(p.x + p.w * 0.06, snowBase);
            ctx.lineTo(p.x + p.w * 0.13, p.y + (snowBase - p.y) * 0.75);
            ctx.lineTo(p.x + p.w * 0.1, p.y + (snowBase - p.y) * 0.45);
            ctx.closePath();
            ctx.fillStyle = snowColor;
            ctx.fill();
        }
    }
}

function drawStars(ctx, canvas, scrollOffset) {
    const starCount = 100;
    const seed = 12345; // Fixed seed for stars
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < starCount; i++) {
        // Simple Pseudo-random positioning
        const x = (Math.sin(i * 123.45 + seed) * 0.5 + 0.5) * (canvas.width + 1000) - (scrollOffset * 0.02 % (canvas.width + 1000));
        const y = (Math.cos(i * 456.78 + seed) * 0.5 + 0.5) * (canvas.height * 0.6);
        const size = (Math.sin(i + Date.now() * 0.002) * 0.5 + 0.5) * 1.5 + 0.5;
        const opacity = (Math.sin(i * 10 + Date.now() * 0.001) * 0.3 + 0.7);
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
}

export function drawBackground(ctx, canvas, scrollOffset) {
    const p = currentPalette;

    // 1. Sky Base
    ctx.fillStyle = p.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Stars (Only for dark themes)
    if (p.uiColor === '#FFF') {
        drawStars(ctx, canvas, scrollOffset);
    }

    // 3. Layer 1: Distant snow-capped mountains (Parallax)
    const farOffset = scrollOffset * 0.04;
    const farPeaks = [
        { x: -farOffset % 1400 + 0, y: 200, w: 420, h: 350 },
        { x: -farOffset % 1400 + 280, y: 260, w: 360, h: 290 },
        { x: -farOffset % 1400 + 530, y: 170, w: 460, h: 380 },
        { x: -farOffset % 1400 + 820, y: 230, w: 380, h: 320 },
        { x: -farOffset % 1400 + 1060, y: 190, w: 430, h: 360 },
    ];
    drawMountainRange(ctx, farPeaks, 560, p.mountainsFar, p.hills, '#FFFFFF', 260);

    // 4. Layer 2: Mid green mountains
    const midOffset = scrollOffset * 0.12;
    const midPeaks = [
        { x: -midOffset % 1200 + 0, y: 310, w: 300, h: 240 },
        { x: -midOffset % 1200 + 420, y: 290, w: 320, h: 260 },
        { x: -midOffset % 1200 + 860, y: 305, w: 310, h: 245 },
    ];
    drawMountainRange(ctx, midPeaks, 560, p.mountainsMid, p.hills, null, 999);

    // 5. Layer 3: Near rolling hills
    const nearOffset = scrollOffset * 0.28;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    const hillCount = 10;
    const hillSpacing = (canvas.width + 400) / hillCount;
    ctx.fillStyle = p.hills;
    for (let i = 0; i <= hillCount; i++) {
        const hx = i * hillSpacing - (nearOffset % (canvas.width + 400));
        const hy = 580 - 25 * Math.sin(i * 1.2 + scrollOffset * 0.004);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // 6. Layer 4: Clouds
    for (let i = 0; i < 4; i++) {
        const cloudX = (i * 450 - (scrollOffset * 0.08)) % (canvas.width + 400);
        const x = cloudX < -300 ? cloudX + canvas.width + 450 : cloudX;
        const y = 80 + (i % 3) * 45;
        const scale = 0.8 + (i % 2) * 0.3;
        ctx.globalAlpha = p.uiColor === '#FFF' ? 0.4 : 0.8; // Dimmer clouds at night
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 35 * scale, 0, Math.PI * 2);
        ctx.arc(x + 38 * scale, y + 8 * scale, 28 * scale, 0, Math.PI * 2);
        ctx.arc(x - 28 * scale, y + 10 * scale, 22 * scale, 0, Math.PI * 2);
        ctx.arc(x + 12 * scale, y - 12 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
