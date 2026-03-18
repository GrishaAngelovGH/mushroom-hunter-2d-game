import { GRAVITY, FRICTION, MOVE_SPEED, JUMP_FORCE, CANVAS_HEIGHT } from '../config.js';

export class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.animTimer = 0;
        this.facing = 1;
        this.reset();
    }

    reset() {
        this.x = 100;
        this.y = CANVAS_HEIGHT - 100;
        this.vx = 0;
        this.vy = 0;
        this.isJumping = false;
        this.grounded = false;
        this.animTimer = 0;
        this.facing = 1;
    }

    update() {
        // Initial physics constants setup
        this.vy += GRAVITY;
        this.vx *= FRICTION;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
    }

    draw(ctx, scrollOffset = 0) {
        const screenX = this.x - scrollOffset;
        const screenY = this.y;
        const f = this.facing;
        const walk = Math.sin(this.animTimer) * 10;
        const isAir = !this.grounded;

        // Center of the sprite
        const cx = screenX + this.width / 2;
        const cy = screenY + this.height / 2;

        // --- LEGS & SHOES ---
        ctx.fillStyle = '#5D4037'; // Brown Shoes
        const lx = isAir ? -15 : -8 + walk;
        const ly = isAir ? 5 : 15;
        ctx.beginPath();
        ctx.ellipse(cx + lx, cy + ly + 2, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const rx = isAir ? 15 : 8 - walk;
        const ry = isAir ? 0 : 15;
        ctx.beginPath();
        ctx.ellipse(cx + rx, cy + ry + 2, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- BODY (Shirt & Overalls) ---
        ctx.fillStyle = '#E74C3C'; // Shirt (Red)
        ctx.beginPath();
        ctx.arc(cx, cy + 5, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3498DB'; // Overalls (Blue)
        ctx.beginPath();
        ctx.arc(cx, cy + 10, 11, 0, Math.PI); // Bottom curve
        ctx.fill();
        ctx.fillRect(cx - 11, cy + 2, 22, 8); // Middle block

        ctx.fillRect(cx - 9, cy - 2, 4, 6); // Straps
        ctx.fillRect(cx + 5, cy - 2, 4, 6);

        ctx.fillStyle = '#F1C40F'; // Buttons (Yellow)
        ctx.beginPath();
        ctx.arc(cx - 7, cy + 3, 2, 0, Math.PI * 2);
        ctx.arc(cx + 7, cy + 3, 2, 0, Math.PI * 2);
        ctx.fill();

        // --- ARMS & HANDS ---
        ctx.fillStyle = '#E74C3C'; // Sleeve
        const backArmX = cx - 12 * f + (isAir ? 0 : walk * f);
        const backArmY = cy + (isAir ? -10 : 5);
        ctx.beginPath();
        ctx.arc(backArmX, backArmY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white'; // Glove
        ctx.beginPath();
        ctx.arc(cx - 15 * f + (isAir ? 0 : walk * f), cy + (isAir ? -15 : 8), 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#E74C3C'; // Front Arm
        ctx.beginPath();
        ctx.arc(cx + 12 * f - (isAir ? 0 : walk * f), cy + (isAir ? -20 : 5), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(cx + 15 * f - (isAir ? 0 : walk * f), cy + (isAir ? -25 : 8), 5, 0, Math.PI * 2);
        ctx.fill();

        // --- HEAD ---
        const hx = cx + 2 * f;
        const hy = cy - 12;

        ctx.fillStyle = '#FFE0B2'; // Face
        ctx.beginPath();
        ctx.arc(hx, hy, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath(); // Nose
        ctx.arc(hx + 10 * f, hy + 2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3E2723'; // Mustache
        ctx.fillRect(hx + 5 * f, hy + 5, 8 * f, 3);

        ctx.fillStyle = 'white'; // Eyes
        ctx.beginPath();
        ctx.ellipse(hx + 5 * f, hy - 3, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(hx + (5.5) * f, hy - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // --- CAP ---
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath(); // Cap top
        ctx.arc(hx, hy - 5, 11, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(hx, hy - 8, 16 * f, 4); // Brim
    }
}
