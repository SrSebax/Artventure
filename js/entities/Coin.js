import { Entity } from './Entity.js';

export class Coin extends Entity {
    constructor(x, y) {
        super(x, y, 12, 12);
        this.bobT = Math.random() * Math.PI * 2;
        this.collected = false;
    }

    update() {
        this.bobT += 0.08;
    }

    draw(ctx, camera, theme) {
        if (this.collected) return;
        const bob = Math.sin(this.bobT) * 3;
        const cx = this.x - camera.x;
        const cy = this.y - camera.y + bob;

        ctx.fillStyle = theme.coin;
        ctx.beginPath();
        ctx.arc(cx + this.width / 2, cy + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(cx + this.width / 2 - 2, cy + this.height / 2 - 2, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
