import { currentPalette } from '../state.js';
import { shadeColor } from '../utils.js';

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
        const highlightColor = shadeColor(p.pipe, 45);
        const shadowColor = shadeColor(p.pipe, -45);
        const rimColor = shadeColor(p.pipe, -25);

        // 1. Pipe body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(screenX + 5, screenY + 15, this.width - 10, this.height - 15);

        // 2. Body Highlight (3D Effect)
        ctx.fillStyle = highlightColor;
        ctx.fillRect(screenX + 10, screenY + 15, 8, this.height - 15);
        
        ctx.fillStyle = shadowColor;
        ctx.fillRect(screenX + this.width - 15, screenY + 15, 6, this.height - 15);

        // 3. Pipe top (Rim)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(screenX, screenY, this.width, 15);
        
        // Rim Border and shadow
        ctx.strokeStyle = rimColor;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(screenX, screenY, this.width, 15);

        // 4. Rim Highlights
        ctx.fillStyle = highlightColor;
        ctx.fillRect(screenX + 5, screenY + 3, 12, 9);
        
        // Added top-glow highlight for rim
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(screenX + 2, screenY + 2, this.width - 4, 2);
    }
}
