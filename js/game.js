import { Input } from './core/input.js';
import { Physics, TILE_SIZE } from './core/physics.js';
import { Renderer } from './core/renderer.js';
import { Player } from './entities/Player.js';
import { Level } from './world/Level.js';
import { getLevelsData, THEMES } from './world/LevelsData.js';
import { HUD } from './ui/HUD.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 480;
        this.height = 300;
        
        this.input = new Input();
        this.renderer = new Renderer(this.ctx, this.width, this.height);
        this.hud = new HUD();
        this.levelsData = getLevelsData();
        
        this.currentLevelIdx = 0;
        this.level = null;
        this.player = null;
        this.physics = null;
        this.camera = { x: 0, y: 0 };
        
        this.lives = 3;
        this.coins = 0;
        this.timer = 60;
        this.initialTimer = 60;
        this.gameState = 'start';
        this.timerInterval = null;
        
        this._initResize();
        this._bindEvents();
        this.hud.updateLevelSelector(this.levelsData);
        
        requestAnimationFrame((ts) => this.loop(ts));
    }

    _initResize() {
        const resize = () => {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    _bindEvents() {
        const levelBtns = document.querySelectorAll('.level-btn');
        levelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lvl = parseInt(e.target.dataset.level);
                document.getElementById('startScreen').style.display = 'none';
                this.start(lvl);
            });
        });
    }

    start(levelIdx = 0) {
        this.currentLevelIdx = levelIdx;
        this.loadLevel(this.currentLevelIdx);
        this.gameState = 'playing';
    }

    loadLevel(idx) {
        const data = this.levelsData[idx];
        const theme = THEMES[idx] || THEMES[0];
        
        this.level = new Level(data, theme);
        this.physics = new Physics(this.level);
        
        // Reset level-specific stats
        this.lives = 3;
        this.coins = 0;
        this.initialTimer = data.timeLimit || 60;
        this.timer = this.initialTimer;
        
        this.player = new Player(TILE_SIZE, 10 * TILE_SIZE);
        this.camera = { x: 0, y: 0 };
        this._startTimer();
        this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer);
    }

    _startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.gameState === 'playing' && !this.player.dead) {
                this.timer--;
                this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer);
                if (this.timer <= 0) this.player.kill();
            }
        }, 1000);
    }

    _saveHighscore() {
        const key = `level_${this.currentLevelIdx}_score`;
        const existing = localStorage.getItem(key);
        const currentData = { score: this.coins, time: this.initialTimer - this.timer };
        
        if (!existing) {
            localStorage.setItem(key, JSON.stringify(currentData));
        } else {
            const best = JSON.parse(existing);
            if (currentData.score > best.score || (currentData.score === best.score && currentData.time < best.time)) {
                localStorage.setItem(key, JSON.stringify(currentData));
            }
        }
        this.hud.updateLevelSelector(this.levelsData);
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.player.update(this.input, this.physics);

        if (this.player.y > this.level.rows * TILE_SIZE) {
            this.player.kill();
        }

        if (this.player.dead) {
            if (this.player.deadTimer <= 0) {
                this.respawn();
            }
            return;
        }

        this.level.enemies.forEach(enemy => enemy.update(this.physics, this.level));
        this.level.coins.forEach(coin => coin.update());

        this.level.coins.forEach(coin => {
            if (!coin.collected && this.physics.checkOverlap(this.player, coin)) {
                coin.collected = true;
                this.coins++;
                this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer);
            }
        });

        if (this.player.invincible <= 0) {
            this.level.enemies.forEach(enemy => {
                if (enemy.alive && this.physics.checkOverlap(this.player, enemy)) {
                    const isStomping = this.player.vy > 0 && this.player.y + this.player.height < enemy.y + enemy.height * 0.5;
                    if (isStomping) {
                        enemy.alive = false;
                        this.player.vy = -7;
                        this.coins += 2;
                        this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer);
                    } else {
                        this.player.kill();
                    }
                }
            });
        }

        if (this.level.flag && !this.level.flag.reached) {
            if (this.physics.checkOverlap(this.player, this.level.flag)) {
                this.level.flag.reached = true;
                this._saveHighscore();
                this.completeLevel();
            }
        }

        const targetX = this.player.x - this.width / 3;
        const maxX = this.level.cols * TILE_SIZE - this.width;
        this.camera.x = Math.max(0, Math.min(targetX, maxX));
    }

    respawn() {
        this.lives--;
        this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer);

        if (this.lives <= 0) {
            this.gameState = 'gameover';
            this.hud.showMessage('GAME OVER', 'Te has quedado sin vidas.', 'MENU', () => {
                document.getElementById('startScreen').style.display = 'flex';
                this.gameState = 'start';
            }, "Suerte para la próxima", () => this.start(this.currentLevelIdx));
        } else {
            // Return to start of level
            this.player.dead = false;
            this.player.x = TILE_SIZE;
            this.player.y = 10 * TILE_SIZE;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.invincible = 60;
            this.timer = this.initialTimer;
        }
    }

    completeLevel() {
        const isLast = this.currentLevelIdx === this.levelsData.length - 1;
        this.gameState = 'transition';
        
        const stats = `Puntos: ${this.coins} 🪙 | Tiempo: ${this.initialTimer - this.timer}s`;
        const title = isLast ? '¡JUEGO COMPLETADO!' : '¡NIVEL SUPERADO!';
        const btnLabel = isLast ? 'MENU' : 'SIGUIENTE';

        this.hud.showMessage(title, isLast ? "Has conquistado todos los mundos." : `Has superado el mundo ${this.currentLevelIdx + 1}`, btnLabel, () => {
            if (isLast) {
                document.getElementById('startScreen').style.display = 'flex';
                this.gameState = 'start';
            } else {
                this.currentLevelIdx++;
                this.loadLevel(this.currentLevelIdx);
                this.gameState = 'playing';
            }
        }, stats, () => this.start(this.currentLevelIdx));
    }

    draw() {
        if (this.gameState === 'start') return;

        this.renderer.drawBackground(this.level.theme, this.camera);
        this.renderer.drawLevel(this.level, this.camera);
        
        this.level.coins.forEach(coin => coin.draw(this.ctx, this.camera, this.level.theme));
        this.renderer.drawFlag(this.level.flag, this.camera, this.player.bobT);
        this.level.enemies.forEach(enemy => enemy.draw(this.ctx, this.camera));
        
        this.player.draw(this.ctx, this.camera);
    }

    loop(timestamp) {
        this.update();
        this.draw();
        requestAnimationFrame((ts) => this.loop(ts));
    }
}

window.game = new Game();
