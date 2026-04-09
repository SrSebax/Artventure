import { Entity } from './Entity.js';
import { GRAVITY, TILE_SIZE } from '../core/physics.js';

export class Enemy extends Entity {
    constructor(x, y, type = 'goomba') {
        super(x, y, 18, 18);
        this.type = type;
        this.vx = -0.8;
        this.frame = 0;
        this.frameTimer = 0;
    }

    update(physics, level) {
        if (!this.alive) return;

        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        // Simple world bounce
        const lc = Math.floor(this.x / TILE_SIZE);
        const rc = Math.floor((this.x + this.width - 1) / TILE_SIZE);
        const bc = Math.floor((this.y + this.height) / TILE_SIZE);

        if (physics.isSolid(level.getTile(lc, bc)) || physics.isSolid(level.getTile(rc, bc))) {
            this.y = bc * TILE_SIZE - this.height;
            this.vy = 0;
        }

        // Wall bounce
        const midRow = Math.floor((this.y + this.height / 2) / TILE_SIZE);
        if (this.vx > 0 && physics.isSolid(level.getTile(rc + 1, midRow))) this.vx *= -1;
        if (this.vx < 0 && physics.isSolid(level.getTile(lc - 1, midRow))) this.vx *= -1;

        // Cliff bounce
        const footRow = Math.floor((this.y + this.height + 2) / TILE_SIZE);
        if (this.vx > 0 && !physics.isSolid(level.getTile(rc + 1, footRow))) this.vx *= -1;
        if (this.vx < 0 && !physics.isSolid(level.getTile(lc - 1, footRow))) this.vx *= -1;

        // Animation
        this.frameTimer++;
        if (this.frameTimer > 12) {
            this.frame = (this.frame + 1) % 2;
            this.frameTimer = 0;
        }

        if (this.y > level.rows * TILE_SIZE) this.alive = false;
    }

    draw(ctx, camera) {
        if (!this.alive) return;
        const ex = this.x - camera.x;
        const ey = this.y - camera.y;

        // Goomba-like body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(ex + this.width / 2, ey + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(ex + 5, ey + 6, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + this.width - 5, ey + 6, 3, 0, Math.PI * 2); ctx.fill();
        
        ctx.fillStyle = '#000';
        const pupX = this.vx < 0 ? -1 : 1;
        ctx.beginPath(); ctx.arc(ex + 5 + pupX, ey + 6, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + this.width - 5 + pupX, ey + 6, 1.5, 0, Math.PI * 2); ctx.fill();

        // Feet
        const lf = this.frame === 0 ? 0 : 2;
        ctx.fillStyle = '#5C3317';
        ctx.fillRect(ex + 1, ey + this.height - 4 + lf, 6, 4);
        ctx.fillRect(ex + this.width - 7, ey + this.height - 4 - lf, 6, 4);
    }
}
