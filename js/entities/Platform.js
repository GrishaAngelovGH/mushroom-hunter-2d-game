import { currentPalette } from '../state.js';

export class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx, scrollOffset = 0) {
        const screenX = this.x - scrollOffset;
        const screenY = this.y;
        const p = currentPalette;

        // 1. Dirt (Body) with gradient
        const dirtGrad = ctx.createLinearGradient(0, screenY, 0, screenY + this.height);
        dirtGrad.addColorStop(0, p.dirt);
        // Create a slightly darker version for the bottom of the dirt
        dirtGrad.addColorStop(1, this.shadeColor(p.dirt, -20));
        ctx.fillStyle = dirtGrad;
        ctx.fillRect(screenX, screenY, this.width, this.height);

        // 2. Rock details (small rectangles)
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < this.width; i += 40) {
            ctx.fillRect(screenX + i + 10, screenY + 20, 10, 5);
            ctx.fillRect(screenX + i + 25, screenY + 35, 5, 5);
        }

        // 3. Grass base strip (gradient)
        const grassGrad = ctx.createLinearGradient(0, screenY - 2, 0, screenY + 12);
        grassGrad.addColorStop(0, p.grass);
        grassGrad.addColorStop(1, this.shadeColor(p.grass, -15));
        ctx.fillStyle = grassGrad;
        ctx.fillRect(screenX, screenY, this.width, 12);

        // 4. Rounded grass blades
        const bladeSpacing = 16;
        for (let i = 2; i < this.width - 2; i += bladeSpacing) {
            const bx = screenX + i;
            const by = screenY;
            const odd = (i / bladeSpacing) % 2 === 0;

            // Blade shadow (darker, slightly offset)
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.moveTo(bx + 1, by);
            ctx.quadraticCurveTo(bx + 5, by - (odd ? 11 : 8), bx + 8, by);
            ctx.fill();

            // Main blade
            ctx.fillStyle = odd ? p.grass : this.shadeColor(p.grass, 10);
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.quadraticCurveTo(bx + 3, by - (odd ? 13 : 9), bx + 7, by);
            ctx.fill();

            // Highlight on blade tip
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.beginPath();
            ctx.moveTo(bx + 1, by - 2);
            ctx.quadraticCurveTo(bx + 2.5, by - (odd ? 10 : 7), bx + 4, by - 3);
            ctx.fill();
        }
    }

    shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);

        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }
}
