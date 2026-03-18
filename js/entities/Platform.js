export class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Classic Emerald Colors (from palette)
        this.colors = {
            dirt: ["#A0785A", "#6D4C3A"],
            grass: ["#4CD964", "#27AE60"],
            detail: "#B08870"
        };
    }

    draw(ctx, scrollOffset = 0) {
        const screenX = this.x - scrollOffset;
        const screenY = this.y;

        // 1. Dirt (Body) with gradient
        const dirtGrad = ctx.createLinearGradient(0, screenY, 0, screenY + this.height);
        dirtGrad.addColorStop(0, this.colors.dirt[0]);
        dirtGrad.addColorStop(1, this.colors.dirt[1]);
        ctx.fillStyle = dirtGrad;
        ctx.fillRect(screenX, screenY, this.width, this.height);

        // 2. Rock details (small rectangles)
        ctx.fillStyle = this.colors.detail;
        for (let i = 0; i < this.width; i += 40) {
            ctx.fillRect(screenX + i + 10, screenY + 20, 10, 5);
            ctx.fillRect(screenX + i + 25, screenY + 35, 5, 5);
        }

        // 3. Grass base strip (gradient)
        const grassGrad = ctx.createLinearGradient(0, screenY - 2, 0, screenY + 12);
        grassGrad.addColorStop(0, this.colors.grass[0]);
        grassGrad.addColorStop(1, this.colors.grass[1]);
        ctx.fillStyle = grassGrad;
        ctx.fillRect(screenX, screenY, this.width, 12);

        // 4. Rounded grass blades
        const bladeSpacing = 16;
        for (let i = 2; i < this.width - 2; i += bladeSpacing) {
            const bx = screenX + i;
            const by = screenY;
            const odd = (i / bladeSpacing) % 2 === 0;

            // Blade shadow (darker, slightly offset)
            ctx.fillStyle = '#1E9648';
            ctx.beginPath();
            ctx.moveTo(bx + 1, by);
            ctx.quadraticCurveTo(bx + 5, by - (odd ? 11 : 8), bx + 8, by);
            ctx.fill();

            // Main blade
            ctx.fillStyle = odd ? '#5DDC75' : '#3EC95A';
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
}
