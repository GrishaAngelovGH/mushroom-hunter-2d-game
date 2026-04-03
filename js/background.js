import { currentPalette } from './state.js';
import { shadeColor } from './utils.js';

function drawMountainRange(ctx, peaks, groundY, bodyColor, shadowColor, snowColor, snowLine, drawShadows = false) {
    // 1. Define the continuous rolling silhouette path
    const buildPath = (ctx) => {
        ctx.beginPath();
        const firstPeak = peaks[0];
        ctx.moveTo(firstPeak.x - 100, groundY);
        for (let i = 0; i < peaks.length; i++) {
            const p = peaks[i];
            const next = peaks[i+1];
            if (next) {
                const cpX = (p.x + next.x) / 2;
                ctx.quadraticCurveTo(p.x, p.y, cpX, (p.y + next.y) / 2);
            } else {
                ctx.quadraticCurveTo(p.x, p.y, p.x + 100, groundY);
            }
        }
        ctx.lineTo(peaks[peaks.length-1].x + 200, groundY);
        ctx.closePath();
    };

    // 2. Draw Main Body with Gradient
    buildPath(ctx);
    const minY = Math.min(...peaks.map(p => p.y));
    const bodyGrad = ctx.createLinearGradient(0, minY, 0, groundY);
    bodyGrad.addColorStop(0, bodyColor);
    bodyGrad.addColorStop(1, shadowColor || shadeColor(bodyColor, -25));
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // 3. Detail Layers (Shadows & Snow) clipped to the mountain silhouette
    ctx.save();
    buildPath(ctx);
    ctx.clip();

    // Side Shadows (Occasional and very soft)
    if (drawShadows) {
        for (let i = 0; i < peaks.length; i++) {
            if (i % 2 === 0) { // Only every other peak to reduce clutter
                const p = peaks[i];
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.w * 0.55, p.y + p.h * 0.6);
                ctx.lineTo(p.x + p.w * 0.5, groundY + 100);
                ctx.closePath();
                ctx.fillStyle = 'rgba(0,0,0,0.05)'; // Much fainter
                ctx.fill();
            }
        }
    }

    // Snow Caps (Irregular and anchored)
    if (snowColor) {
        for (const p of peaks) {
            if (p.y > snowLine) continue;
            const snowBase = p.y + (snowLine - p.y) * 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.w * 0.08, p.y + (snowBase - p.y) * 0.5);
            ctx.lineTo(p.x - p.w * 0.04, p.y + (snowBase - p.y) * 0.8);
            ctx.lineTo(p.x + p.w * 0.02, p.y + (snowBase - p.y) * 0.6);
            ctx.lineTo(p.x + p.w * 0.1, snowBase);
            ctx.lineTo(p.x + p.w * 0.15, p.y + (snowBase - p.y) * 0.7);
            ctx.lineTo(p.x + p.w * 0.08, p.y + (snowBase - p.y) * 0.4);
            ctx.closePath();
            ctx.fillStyle = snowColor;
            ctx.fill();
        }
    }

    ctx.restore();
}

export function drawBackground(ctx, canvas, scrollOffset) {
    const p = currentPalette;

    // 1. Sky Base
    ctx.fillStyle = p.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Layer 1: Distant snow-capped ranges
    const farOffset = scrollOffset * 0.04;
    const farColor = '#8fa4b3'; // Muted slate from screenshot
    const farPeaks = [
        { x: -farOffset % 1400 + 0, y: 200, w: 420, h: 350 },
        { x: -farOffset % 1400 + 280, y: 260, w: 360, h: 290 },
        { x: -farOffset % 1400 + 530, y: 170, w: 460, h: 380 },
        { x: -farOffset % 1400 + 820, y: 230, w: 380, h: 320 },
        { x: -farOffset % 1400 + 1060, y: 190, w: 430, h: 360 },
        { x: -farOffset % 1400 + 1350, y: 240, w: 400, h: 310 },
        { x: -farOffset % 1400 + 1580, y: 210, w: 410, h: 340 },
    ];
    drawMountainRange(ctx, farPeaks, 550, farColor, p.hills, '#FFFFFF', 260, true);

    // 3. Layer 2: Mid green ranges
    const midOffset = scrollOffset * 0.12;
    const midPeaks = [
        { x: -midOffset % 1200 + 0, y: 310, w: 300, h: 240 },
        { x: -midOffset % 1200 + 220, y: 350, w: 260, h: 200 },
        { x: -midOffset % 1200 + 420, y: 290, w: 320, h: 260 },
        { x: -midOffset % 1200 + 660, y: 340, w: 280, h: 210 },
        { x: -midOffset % 1200 + 860, y: 305, w: 310, h: 245 },
        { x: -midOffset % 1200 + 1100, y: 330, w: 290, h: 220 },
        { x: -midOffset % 1200 + 1290, y: 315, w: 300, h: 235 },
    ];
    drawMountainRange(ctx, midPeaks, 550, p.mountainsMid, p.hills, null, 999, false);

    // 4. Layer 3: Near rolling hills
    const nearOffset = scrollOffset * 0.28;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    const hillCount = 10;
    const hillSpacing = (canvas.width + 400) / hillCount;
    ctx.fillStyle = p.hills;
    for (let i = 0; i <= hillCount; i++) {
        const hx = i * hillSpacing - (nearOffset % (canvas.width + 400));
        const hy = 550 - 25 * Math.sin(i * 1.2 + scrollOffset * 0.004);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // 5. Layer 4: Clouds
    for (let i = 0; i < 4; i++) {
        const cloudX = (i * 450 - (scrollOffset * 0.08)) % (canvas.width + 400);
        const x = cloudX < -300 ? cloudX + canvas.width + 450 : cloudX;
        const y = 80 + (i % 3) * 45;
        const scale = 0.8 + (i % 2) * 0.3;
        ctx.globalAlpha = p.uiColor === '#FFF' ? 0.35 : 0.85;
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