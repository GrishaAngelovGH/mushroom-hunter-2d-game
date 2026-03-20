// js/entities/Coin.js
export class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.collected = false;
        this.bob = 0; // For bobbing animation
    }

    draw(ctx, scrollOffset) {
        if (this.collected) return;

        const screenX = this.x - scrollOffset;
        const screenY = this.y + Math.sin(this.bob) * 5; // Apply bobbing animation

        // Coin Body (Gold)
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#F1C40F'; // Coin Gold
        ctx.fill();

        // Border
        ctx.strokeStyle = '#D4AC0D';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shine (White arced line)
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius - 3, Math.PI * 1.5, Math.PI * 1.8);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner detail (Vertical slot)
        ctx.fillStyle = '#D4AC0D';
        ctx.fillRect(screenX - 2, screenY - 5, 4, 10);

        ctx.closePath();
    }

    // Update method for animation or other logic if needed
    update() {
        this.bob += 0.06; // Animate bobbing
    }
}
