import { CANVAS_WIDTH } from '../config.js';

/** Mushroom enemy: patrols between startX and startX + range on a platform. */
export class Enemy {
    constructor(x, y, range, isElite = false) {
        this.startX = x;
        this.x = x;
        this.y = y;
        this.isElite = isElite;
        this.width = 30;
        this.height = 30;
        this.range = Math.max(0, range);
        this.speed = 1.5 + Math.random();
        this.direction = 1;
        this.animPhase = Math.random() * Math.PI * 2;
        this.alive = true;
    }

    update() {
        if (!this.alive) return;
        this.animPhase += 0.05 * this.speed;
        if (this.range > 0) {
            this.x += this.speed * this.direction;
            if (this.x > this.startX + this.range || this.x < this.startX) {
                this.direction *= -1;
            }
        }
    }

    draw(ctx, scrollOffset) {
        if (!this.alive) return;
        const screenX = this.x - scrollOffset;
        const bob = Math.sin(this.animPhase) * 1.5;
        const scale = this.width / 40;

        ctx.save();
        ctx.translate(screenX + this.width / 2, this.y);
        ctx.scale(this.direction * scale, scale);
        ctx.translate(-20, 0);

        const drawX = 0;
        const drawY = 0;
        const drawW = 40;
        const drawH = 40;
        const cx = drawX + drawW / 2;
        const cy = drawY + drawH / 2;

        ctx.fillStyle = '#1A1A2E';
        ctx.beginPath();
        ctx.ellipse(cx - 10, drawY + drawH + bob, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10, drawY + drawH + bob, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const bodyGrad = ctx.createRadialGradient(cx - 4, cy + 6 + bob, 2, cx, cy + 8 + bob, 16);
        bodyGrad.addColorStop(0, '#EFEBE9');
        bodyGrad.addColorStop(1, '#BCAAA4');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8 + bob, 15, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        let capMain = '#E53935';
        let capDark = '#B71C1C';
        let capAccent = '#7F0000';
        if (this.isElite) {
            capMain = '#F1C40F';
            capDark = '#D4AC0D';
            capAccent = '#9A7D0A';
        }

        const capGrad = ctx.createRadialGradient(cx - 5, drawY + 5 + bob, 3, cx, drawY + 14 + bob, 22);
        capGrad.addColorStop(0, capMain);
        capGrad.addColorStop(0.6, capDark);
        capGrad.addColorStop(1, capAccent);
        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.moveTo(drawX - 2, drawY + 22 + bob);
        ctx.bezierCurveTo(drawX - 2, drawY + bob, cx - 5, drawY - 6 + bob, cx, drawY - 6 + bob);
        ctx.bezierCurveTo(cx + 5, drawY - 6 + bob, drawX + drawW + 2, drawY + bob, drawX + drawW + 2, drawY + 22 + bob);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.ellipse(cx - 5, drawY + 6 + bob, 7, 5, -0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        [[cx - 8, drawY + 10], [cx + 6, drawY + 8], [cx - 2, drawY + 4]].forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(sx, sy + bob, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });

        const eyeY = drawY + 20 + bob;
        [-8, 8].forEach(ox => {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.ellipse(cx + ox, eyeY, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1A1A2E';
            ctx.beginPath();
            ctx.ellipse(cx + ox + (ox > 0 ? -1 : 1), eyeY + 1, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.arc(cx + ox - 1, eyeY - 2, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.strokeStyle = '#1A1A2E';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 13, eyeY - 7);
        ctx.lineTo(cx - 4, eyeY - 4);
        ctx.moveTo(cx + 13, eyeY - 7);
        ctx.lineTo(cx + 4, eyeY - 4);
        ctx.stroke();

        ctx.restore();
    }
}
