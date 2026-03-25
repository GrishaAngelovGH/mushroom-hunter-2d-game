/** Mushroom enemy: patrols between startX and startX + range on a platform. Sprite comes in roadmap #41. */
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
    }

    update() {
        if (this.range > 0) {
            this.x += this.speed * this.direction;
            if (this.x > this.startX + this.range || this.x < this.startX) {
                this.direction *= -1;
            }
        }
    }

    /** Placeholder until enemy sprite (roadmap #41). */
    draw(ctx, scrollOffset) {
        const screenX = this.x - scrollOffset;
        ctx.fillStyle = this.isElite ? '#F1C40F' : '#C0392B';
        ctx.fillRect(screenX, this.y, this.width, this.height);
        ctx.strokeStyle = '#1A1A2E';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, this.y, this.width, this.height);
    }
}
