import { TILE_SIZE } from './physics.js';

export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    drawBackground(theme, camera) {
        const ctx = this.ctx;
        // Sky
        ctx.fillStyle = theme.sky;
        ctx.fillRect(0, 0, this.width, this.height);

        // Clouds (parallax)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const cloudOffset = (camera.x * 0.2) % this.width;
        [[80, 40], [250, 70], [420, 30], [580, 50]].forEach(([cx, cy]) => {
            const x = ((cx - cloudOffset) + this.width) % this.width;
            ctx.beginPath(); ctx.arc(x, cy, 20, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 15, cy - 5, 15, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x - 15, cy - 3, 12, 0, Math.PI * 2); ctx.fill();
        });

        // Mountains (parallax)
        ctx.fillStyle = theme.bg2 + '66';
        const mountOffset = (camera.x * 0.4) % this.width;
        for (let i = 0; i < 3; i++) {
            const x = ((i * 300 - mountOffset) + this.width * 2) % (this.width * 2) - 150;
            ctx.beginPath();
            ctx.moveTo(x - 100, this.height);
            ctx.lineTo(x, this.height - 120);
            ctx.lineTo(x + 100, this.height);
            ctx.fill();
        }
    }

    drawLevel(level, camera) {
        const startC = Math.floor(camera.x / TILE_SIZE);
        const endC = Math.ceil((camera.x + this.width) / TILE_SIZE) + 1;

        for (let r = 0; r < level.rows; r++) {
            for (let c = startC; c < endC && c < level.cols; c++) {
                const t = level.map[r][c];
                if (t > 0 && t !== 3 && t !== 4) {
                    this._drawTile(t, c * TILE_SIZE - camera.x, r * TILE_SIZE - camera.y, level.theme);
                }
            }
        }
    }

    _drawTile(type, x, y, theme) {
        const ctx = this.ctx;
        const s = TILE_SIZE;

        if (type === 1) { // Ground
            ctx.fillStyle = theme.ground;
            ctx.fillRect(x, y, s, s);
            ctx.fillStyle = theme.groundDark;
            ctx.fillRect(x, y + s - 4, s, 4);
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(x, y, 4, s);
        } else if (type === 2) { // Brick
            ctx.fillStyle = theme.brick;
            ctx.fillRect(x, y, s, s);
            ctx.strokeStyle = theme.brickDark;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(x + 2, y + 2, s - 12, s - 12);
        } else if (type === 5) { // Flag Pole
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(x + s / 2 - 2, y, 4, s);
        }
    }

    drawFlag(flag, camera, bobT) {
        if (!flag) return;
        const fx = flag.x - camera.x;
        const fy = flag.y - camera.y;
        const ctx = this.ctx;

        // Animate flag banner lowering if reached
        if (flag.reached && flag.bannerY < (this.height - TILE_SIZE)) {
            flag.bannerY += 2;
        }

        // Banner
        const wave = flag.reached ? 0 : Math.sin(bobT * 5) * 4;
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(fx + 6, fy + flag.bannerY);
        ctx.lineTo(fx + 34, fy + flag.bannerY + 7 + wave);
        ctx.lineTo(fx + 6, fy + flag.bannerY + 17);
        ctx.fill();
    }
}
