export const TILE_SIZE = 24;
export const GRAVITY = 0.45;

export class Physics {
    constructor(level) {
        this.level = level;
    }

    isSolid(tile) {
        // 1: Floor, 2: Brick
        return tile === 1 || tile === 2;
    }

    collideWorld(entity) {
        const left = Math.floor(entity.x / TILE_SIZE);
        const right = Math.floor((entity.x + entity.width - 1) / TILE_SIZE);
        const top = Math.floor(entity.y / TILE_SIZE);
        const bottom = Math.floor((entity.y + entity.height - 1) / TILE_SIZE);

        entity.onGround = false;

        // Vertical Collision
        if (entity.vy >= 0) { // Falling or moving down
            const footY = entity.y + entity.height;
            const tileRow = Math.floor(footY / TILE_SIZE);
            if (this.isSolid(this.level.getTile(left, tileRow)) || 
                this.isSolid(this.level.getTile(right, tileRow))) {
                entity.y = tileRow * TILE_SIZE - entity.height;
                entity.vy = 0;
                entity.onGround = true;
            }
        } else { // Jumping or moving up
            const headY = entity.y;
            const tileRow = Math.floor(headY / TILE_SIZE);
            if (this.isSolid(this.level.getTile(left, tileRow)) || 
                this.isSolid(this.level.getTile(right, tileRow))) {
                entity.y = (tileRow + 1) * TILE_SIZE;
                entity.vy = 0;
            }
        }

        // Horizontal Collision
        if (entity.vx > 0) { // Moving right
            const edgeX = entity.x + entity.width;
            const tileCol = Math.floor(edgeX / TILE_SIZE);
            const topRow = Math.floor(entity.y / TILE_SIZE);
            const bottomRow = Math.floor((entity.y + entity.height - 1) / TILE_SIZE);
            if (this.isSolid(this.level.getTile(tileCol, topRow)) || 
                this.isSolid(this.level.getTile(tileCol, bottomRow))) {
                entity.x = tileCol * TILE_SIZE - entity.width;
                entity.vx = 0;
            }
        } else if (entity.vx < 0) { // Moving left
            const edgeX = entity.x;
            const tileCol = Math.floor(edgeX / TILE_SIZE);
            const topRow = Math.floor(entity.y / TILE_SIZE);
            const bottomRow = Math.floor((entity.y + entity.height - 1) / TILE_SIZE);
            if (this.isSolid(this.level.getTile(tileCol, topRow)) || 
                this.isSolid(this.level.getTile(tileCol, bottomRow))) {
                entity.x = (tileCol + 1) * TILE_SIZE;
                entity.vx = 0;
            }
        }
    }

    checkOverlap(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
}
