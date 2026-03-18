export class Chimney {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Classic Emerald Colors for Pipes
        this.colors = {
            body: "#1E8449",
            highlight: "#2ECC71",
            shadow: "#0B5345",
            rim: "#145A32"
        };
    }

    draw(ctx, scrollOffset = 0) {
        const screenX = this.x - scrollOffset;
        const screenY = this.y;

        // 1. Pipe body
        ctx.fillStyle = this.colors.body;
        ctx.fillRect(screenX + 5, screenY + 15, this.width - 10, this.height - 15);

        // 2. Body Highlight (3D Effect)
        ctx.fillStyle = this.colors.highlight;
        ctx.fillRect(screenX + 10, screenY + 15, 8, this.height - 15);
        ctx.fillStyle = this.colors.shadow;
        ctx.fillRect(screenX + this.width - 15, screenY + 15, 5, this.height - 15);

        // 3. Pipe top (Rim)
        ctx.fillStyle = this.colors.body;
        ctx.fillRect(screenX, screenY, this.width, 15);
        ctx.strokeStyle = this.colors.rim;
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, this.width, 15);

        // 4. Rim Highlight
        ctx.fillStyle = this.colors.highlight;
        ctx.fillRect(screenX + 5, screenY + 3, 10, 9);
    }
}
