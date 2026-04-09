import { Entity } from './Entity.js';
import { GRAVITY } from '../core/physics.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 18, 22);
        this.speed = 2.8;
        this.jumpForce = -9.5;
        this.dir = 1;
        this.frame = 0;
        this.frameTimer = 0;
        this.dead = false;
        this.deadTimer = 0;
        this.invincible = 0;
        this.jumpPressed = false;
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.bobT = 0;
    }

    update(input, physics) {
        if (this.dead) {
            this.vy += GRAVITY * 0.5;
            this.y += this.vy;
            this.deadTimer--;
            return;
        }

        this.bobT += 0.05;

        // X Movement
        if (input.isLeft()) {
            this.vx = -this.speed;
            this.dir = -1;
        } else if (input.isRight()) {
            this.vx = this.speed;
            this.dir = 1;
        } else {
            this.vx *= 0.8; // Friction
        }

        // Y Movement (Jump)
        if (this.onGround) {
            this.jumpCount = 0;
        }

        const jumpNow = input.isJump();
        
        if (jumpNow && !this.jumpPressed) {
            if (this.onGround || this.jumpCount < this.maxJumps) {
                this.vy = this.jumpForce;
                // El segundo salto es un poco menos potente
                if (this.jumpCount > 0) {
                    this.vy = this.jumpForce * 0.9; 
                }
                this.jumpPressed = true;
                this.jumpCount++;
            }
        }
        
        if (!jumpNow) this.jumpPressed = false;

        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        physics.collideWorld(this);

        // Invincibility flicker
        if (this.invincible > 0) this.invincible--;

        // Animation
        if (Math.abs(this.vx) > 0.1 && this.onGround) {
            this.frameTimer++;
            if (this.frameTimer > 6) {
                this.frame = (this.frame + 1) % 4;
                this.frameTimer = 0;
            }
        } else {
            this.frame = 0;
        }
    }

    kill() {
        if (this.invincible > 0 || this.dead) return;
        this.dead = true;
        this.deadTimer = 80;
        this.vy = -8;
    }

    draw(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) return;

        ctx.save();
        if (this.dead) {
            ctx.translate(sx + this.width / 2, sy + this.height / 2);
            ctx.rotate(Math.PI);
            ctx.translate(-(sx + this.width / 2), -(sy + this.height / 2));
        }

        this._drawSprite(ctx, sx, sy);
        ctx.restore();
    }

    _drawSprite(ctx, sx, sy) {
        // Body (Red Suit)
        ctx.fillStyle = '#E74C3C';
        this._roundRect(ctx, sx + 2, sy + 10, this.width - 4, this.height - 10, 3);
        ctx.fill();

        // Head (Skin tone)
        ctx.fillStyle = '#FFCC99';
        this._roundRect(ctx, sx + 2, sy + 1, this.width - 4, 12, 4);
        ctx.fill();

        // Hat
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(sx + 1, sy - 2, this.width - 2, 6);
        ctx.fillRect(sx + 4, sy - 5, this.width - 8, 5);

        // Eyes
        ctx.fillStyle = '#000';
        const ex = this.dir > 0 ? sx + 10 : sx + 3;
        ctx.fillRect(ex, sy + 4, 3, 3);

        // Legs/Feet logic
        const legOff = this.onGround && Math.abs(this.vx) > 0.1 
            ? [Math.sin(this.bobT * 8) * 3, Math.sin(this.bobT * 8 + Math.PI) * 3] 
            : [0, 0];

        ctx.fillStyle = '#1565C0'; // Overalls
        ctx.fillRect(sx + 3, sy + this.height - 8 + legOff[0], 6, 8);
        ctx.fillRect(sx + this.width - 9, sy + this.height - 8 + legOff[1], 6, 8);
        
        ctx.fillStyle = '#4A2500'; // Shoes
        ctx.fillRect(sx + 2, sy + this.height - 3 + legOff[0], 7, 4);
        ctx.fillRect(sx + this.width - 9, sy + this.height - 3 + legOff[1], 7, 4);
    }

    _roundRect(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
}
