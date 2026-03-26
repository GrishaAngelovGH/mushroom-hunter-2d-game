import { GRAVITY } from '../config.js';

export class Stone {
    constructor(x, y, canvasHeight, direction) {
        this.x = x;
        this.y = y;
        this.canvasHeight = canvasHeight;
        this.vx = direction * 6;
        this.vy = -3;
        this.radius = 6;
        this.alive = true;
        this.rotation = 0;
        this.trail = [];
    }

    update(scrollOffset, canvasWidth) {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();
        
        this.x += this.vx;
        this.y += this.vy;
        this.vy += GRAVITY * 0.4;
        this.rotation += this.vx * 0.1;

        if (this.y > this.canvasHeight || 
            this.x < scrollOffset - 100 || 
            this.x > scrollOffset + canvasWidth + 100) {
            this.alive = false;
        }
    }

    draw(ctx, scrollOffset) {
        if (!this.alive) return;
        const sx = this.x - scrollOffset;
        const sy = this.y;

        // Trail
        this.trail.forEach((t, i) => {
            ctx.beginPath();
            ctx.arc(t.x - scrollOffset, t.y, this.radius * (i / this.trail.length) * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(160,140,120,${(i / this.trail.length) * 0.35})`;
            ctx.fill();
        });

        // Stone body
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.rotation);
        
        const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, this.radius);
        grad.addColorStop(0, '#CCC');
        grad.addColorStop(0.6, '#888');
        grad.addColorStop(1, '#555');
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        
        // Crack detail
        ctx.strokeStyle = 'rgba(80,80,80,0.5)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-2, -3); 
        ctx.lineTo(1, 0); 
        ctx.lineTo(-1, 3);
        ctx.stroke();
        
        ctx.restore();
    }
}
