import { currentPalette } from '../state.js';

export class Chimney {
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

        const bodyColor = p.pipe;
        const highlightColor = this.shadeColor(p.pipe, 40);
        const shadowColor = this.shadeColor(p.pipe, -40);
        const rimColor = this.shadeColor(p.pipe, -20);

        // 1. Pipe body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(screenX + 5, screenY + 15, this.width - 10, this.height - 15);

        // 2. Body Highlight (3D Effect)
        ctx.fillStyle = highlightColor;
        ctx.fillRect(screenX + 10, screenY + 15, 8, this.height - 15);
        ctx.fillStyle = shadowColor;
        ctx.fillRect(screenX + this.width - 15, screenY + 15, 5, this.height - 15);

        // 3. Pipe top (Rim)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(screenX, screenY, this.width, 15);
        ctx.strokeStyle = rimColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, this.width, 15);

        // 4. Rim Highlight
        ctx.fillStyle = highlightColor;
        ctx.fillRect(screenX + 5, screenY + 3, 10, 9);
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
