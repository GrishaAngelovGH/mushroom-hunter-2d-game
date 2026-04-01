import { GRAVITY, FRICTION, MOVE_SPEED, JUMP_FORCE, CANVAS_HEIGHT } from '../config.js';
import { keys } from '../input.js';
import { chatBubble, platforms } from '../state.js';
import { sounds } from '../audio.js'; // Import sounds for jump effect

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
        this.y = CANVAS_HEIGHT - 150;
        this.vx = 0;
        this.vy = 0;
        this.isJumping = false;
        this.grounded = false;
        this.animTimer = 0;
        this.facing = 1;
    }

    update() {
        // 1. Apply Physics
        this.vy += GRAVITY;
        this.vx *= FRICTION;

        // 2. Input
        if (keys['ArrowLeft']) {
            if (this.vx > -MOVE_SPEED) this.vx--;
        }
        if (keys['ArrowRight']) {
            if (this.vx < MOVE_SPEED) this.vx++;
        }

        // 3. Jump (Check grounded status from LAST frame)
        if ((keys['ArrowUp'] || keys[' ']) && !this.isJumping && this.grounded) {
            this.vy = JUMP_FORCE;
            this.isJumping = true;
            this.grounded = false;
            sounds.jump(); // Play jump sound
        }

        // Apply movement
        this.x += this.vx;
        this.y += this.vy;

        // 4. Resolve Platform Collisions
        this.grounded = false;
        for (const p of platforms) {
            // Vertical Collision
            if (this.x + this.width > p.x && this.x < p.x + p.width) {
                // Falling onto top
                if (this.vy >= 0 && this.y + this.height >= p.y && this.y + this.height - this.vy <= p.y) {
                    this.y = p.y - this.height;
                    this.vy = 0;
                    this.grounded = true;
                    this.isJumping = false;
                }
                // Bonking head on bottom
                else if (this.vy < 0 && this.y <= p.y + p.height && this.y - this.vy >= p.y + p.height) {
                    this.y = p.y + p.height;
                    this.vy = 0;
                }
            }

            // Horizontal Collision (Wall push)
            if (this.y + this.height > p.y && this.y < p.y + p.height) {
                // Moving right into left wall
                if (this.vx > 0 && this.x + this.width >= p.x && this.x + this.width - this.vx <= p.x) {
                    this.x = p.x - this.width;
                    this.vx = 0;
                }
                // Moving left into right wall
                else if (this.vx < 0 && this.x <= p.x + p.width && this.x - this.vx >= p.x + p.width) {
                    this.x = p.x + p.width;
                    this.vx = 0;
                }
            }
        }

        // Animation and Facing
        if (Math.abs(this.vx) > 0.1) {
            this.facing = this.vx > 0 ? 1 : -1;
            if (this.grounded) {
                this.animTimer += Math.abs(this.vx) * 0.15;
            }
        } else if (this.grounded) {
            this.animTimer = 0;
        }

        // Boundary Clamps
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

        // --- CHAT BUBBLE ---
        if (chatBubble.timer > 0) {
            const alpha = Math.min(1, chatBubble.timer / 20); // fade out last 20 frames
            const bx = screenX + this.width / 2;
            const by = screenY - 20; // High above head
            const text = chatBubble.text;
            const padding = 10;

            ctx.save();
            ctx.font = 'bold 12px Arial';
            const textW = ctx.measureText(text).width;
            const bubbleW = textW + padding * 2;
            const bubbleH = 28;
            const bubbleX = bx - bubbleW / 2;
            const bubbleY = by - bubbleH - 12;
            const tailX = bx;
            const tailY = by + 3; // Shortened tail

            ctx.globalAlpha = alpha;

            // Bubble body
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1.5;
            const r2 = 8;
            ctx.beginPath();
            ctx.moveTo(bubbleX + r2, bubbleY);
            ctx.lineTo(bubbleX + bubbleW - r2, bubbleY);
            ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + r2);
            ctx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - r2);
            ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX + bubbleW - r2, bubbleY + bubbleH);

            // Pointier V-shape (Shortened)
            ctx.lineTo(tailX + 8, bubbleY + bubbleH);
            ctx.lineTo(tailX, tailY);
            ctx.lineTo(tailX - 8, bubbleY + bubbleH);

            ctx.lineTo(bubbleX + r2, bubbleY + bubbleH);
            ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH - r2);
            ctx.lineTo(bubbleX, bubbleY + r2);
            ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + r2, bubbleY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Bubble text
            ctx.fillStyle = '#222';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, bx, bubbleY + bubbleH / 2);
            ctx.restore();
        }
    }
}
