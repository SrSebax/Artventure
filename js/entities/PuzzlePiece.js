import { Entity } from './Entity.js';

export class PuzzlePiece extends Entity {
    constructor(x, y, pieceIdx) {
        super(x, y, 20, 20);
        this.pieceIdx = pieceIdx;
        this.collected = false;
        this.bob = 0;
        this.bobSpeed = 0.1;
    }

    update() {
        if (this.collected) return;
        this.bob += this.bobSpeed;
    }

    draw(ctx, camera) {
        if (this.collected) return;
        
        const px = this.x - camera.x;
        const py = this.y - camera.y + Math.sin(this.bob) * 5;

        // Draw a glowing puzzle piece icon
        ctx.fillStyle = '#ffd93d';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffd93d';
        
        ctx.beginPath();
        ctx.roundRect(px, py, this.width, this.height, 4);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧩', px + this.width / 2, py + this.height / 1.5);
        
        ctx.shadowBlur = 0;
    }
}
