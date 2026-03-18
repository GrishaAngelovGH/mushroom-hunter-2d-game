const palette = {
    name: "Classic Emerald",
    sky: ["#5BA8D4", "#87CEEB"],
    farMtn: { body: "#8FA8C0", shadow: "#5C7A96", snow: "#E8F0F8", snowLine: 260 },
    midMtn: { body: "#6B8F71", shadow: "#3D6647" },
    hills: "#228B22"
};

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
    grad.addColorStop(1, shadowColor);
    ctx.fillStyle = grad;
    ctx.fill();

    for (const p of peaks) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.w * 0.55, p.y + p.h * 0.6);
        ctx.lineTo(p.x + p.w * 0.5, groundY > p.y + p.h ? p.y + p.h : groundY);
        ctx.closePath();
        ctx.fillStyle = shadowColor;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1.0;
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
            
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.w * 0.03, p.y + (snowBase - p.y) * 0.35);
            ctx.lineTo(p.x + p.w * 0.01, p.y + (snowBase - p.y) * 0.3);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fill();
        }
    }
}

export function drawBackground(ctx, canvas, scrollOffset) {
    const p = palette;

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, p.sky[0]);
    skyGrad.addColorStop(1, p.sky[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Distant snow-capped mountains (Slowest parallax)
    const farOffset = scrollOffset * 0.04;
    const farPeaks = [
        { x: -farOffset % 1400 + 0, y: 200, w: 420, h: 350 },
        { x: -farOffset % 1400 + 280, y: 260, w: 360, h: 290 },
        { x: -farOffset % 1400 + 530, y: 170, w: 460, h: 380 },
        { x: -farOffset % 1400 + 820, y: 230, w: 380, h: 320 },
        { x: -farOffset % 1400 + 1060, y: 190, w: 430, h: 360 },
        { x: -farOffset % 1400 + 1350, y: 240, w: 400, h: 310 },
        { x: -farOffset % 1400 + 1580, y: 210, w: 410, h: 340 },
    ];
    drawMountainRange(ctx, farPeaks, 560, p.farMtn.body, p.farMtn.shadow, p.farMtn.snow, p.farMtn.snowLine);

    // Layer 2: Mid green mountains
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
    drawMountainRange(ctx, midPeaks, 560, p.midMtn.body, p.midMtn.shadow, null, 999);

    // Layer 3: Near rolling hills
    const nearOffset = scrollOffset * 0.28;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    const hillCount = 10;
    const hillSpacing = (canvas.width + 400) / hillCount;
    ctx.fillStyle = p.hills;
    for (let i = 0; i <= hillCount; i++) {
        const hx = i * hillSpacing - (nearOffset % (canvas.width + 400));
        const hy = 560 - 20 * Math.sin(i * 0.8 + scrollOffset * 0.005);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // Layer 4: Clouds
    for (let i = 0; i < 6; i++) {
        const cloudX = (i * 380 - (scrollOffset * 0.08)) % (canvas.width + 300);
        const x = cloudX < -220 ? cloudX + canvas.width + 380 : cloudX;
        const y = 60 + (i % 3) * 35;
        const scale = 0.7 + (i % 3) * 0.2;
        ctx.globalAlpha = 0.88;
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
