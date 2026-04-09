export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.alive = true;
    }

    update() {
        // Base update logic
    }

    draw(ctx, camera) {
        // Base draw logic
    }
}
