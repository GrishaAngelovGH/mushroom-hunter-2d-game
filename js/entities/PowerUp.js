export class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.collected = false;
        this.bob = Math.random() * Math.PI * 2;
    }

    draw(ctx, scrollOffset) {
        if (this.collected) return;
        this.bob += 0.06;
        const screenX = this.x - scrollOffset;
        const screenY = this.y + Math.sin(this.bob) * 10;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 24px Arial';
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillText('+5 🪨', screenX + 2, screenY + 2);
        
        // Main text
        ctx.fillStyle = '#fff';
        ctx.fillText('+5 🪨', screenX, screenY);
        ctx.restore();
    }
}
