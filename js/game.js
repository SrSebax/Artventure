import { Input } from './core/input.js';
import { Physics, TILE_SIZE } from './core/physics.js';
import { Renderer } from './core/renderer.js';
import { Player } from './entities/Player.js';
import { Level } from './world/Level.js';
import { getLevelsData, THEMES } from './world/LevelsData.js';
import { HUD } from './ui/HUD.js';
import { PuzzleManager } from './puzzle/PuzzleManager.js';
import { PuzzlePiece } from './entities/PuzzlePiece.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 480;
        this.height = 300;
        
        this.input = new Input();
        this.renderer = new Renderer(this.ctx, this.width, this.height);
        this.hud = new HUD();
        this.puzzleManager = new PuzzleManager(this);
        this.levelsData = getLevelsData();
        
        this.currentLevelIdx = 0;
        this.level = null;
        this.artInfo = null;
        
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
        
        this._loadArtInfo();
        
        requestAnimationFrame((ts) => this.loop(ts));
    }

    async _loadArtInfo() {
        const resp = await fetch('js/data/info-obras.json');
        this.artInfo = await resp.json();
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
        // Level Selector
        const levelBtns = document.querySelectorAll('.level-btn');
        levelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lvl = parseInt(e.currentTarget.dataset.level);
                document.getElementById('startScreen').style.display = 'none';
                this.start(lvl);
            });
        });

        // HUD Buttons
        document.getElementById('menuBtn').onclick = () => {
            if (confirm("¿Volver al menú principal? Perderás el progreso del nivel.")) {
                location.reload();
            }
        };

        document.getElementById('retryBtn').onclick = () => {
            if (confirm("¿Reiniciar este nivel?")) {
                this.start(this.currentLevelIdx);
            }
        };
    }

    start(levelIdx = 0) {
        this.currentLevelIdx = levelIdx;
        this.loadLevel(this.currentLevelIdx);
        this.gameState = 'playing';
    }

    loadLevel(idx) {
        const data = this.levelsData[idx];
        const theme = THEMES[idx] || THEMES[0];
        
        this.level = new Level(data, theme, 12);
        this.physics = new Physics(this.level);
        
        // Reset level-specific stats
        this.lives = 3;
        this.coins = 0;
        this.initialTimer = data.timeLimit || 60;
        this.timer = this.initialTimer;
        
        this.player = new Player(TILE_SIZE, 10 * TILE_SIZE);
        this.camera = { x: 0, y: 0 };
        this._startTimer();
        this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer, this.level);
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
        this.level.puzzlePieces.forEach(p => p.update());

        this.level.coins.forEach(coin => {
            if (!coin.collected && this.physics.checkOverlap(this.player, coin)) {
                coin.collected = true;
                this.coins++;
                this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer, this.level);
            }
        });

        this.level.puzzlePieces.forEach(p => {
            if (!p.collected && this.physics.checkOverlap(this.player, p)) {
                p.collected = true;
                this.level.collectedPieceIndices.push(p.pieceIdx);
                this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer, this.level);
            }
        });

        if (this.player.invincible <= 0) {
            this.level.enemies.forEach(enemy => {
                if (enemy.alive && this.physics.checkOverlap(this.player, enemy)) {
                    // Si el jugador cae y su centro está más alto que el centro del enemigo, cuenta como pisotón
                    const isStomping = this.player.vy > 0 && (this.player.y + this.player.height * 0.5 < enemy.y + enemy.height * 0.5);
                    if (isStomping) {
                        enemy.alive = false;
                        this.player.vy = -7;
                        this.coins += 2;
                        
                        // Drop piece if it holds one
                        if (enemy.holdsPiece !== null) {
                            this.level.puzzlePieces.push(new PuzzlePiece(enemy.x, enemy.y, enemy.holdsPiece));
                        }

                        this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer, this.level);
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
                // We'll call completeLevel after some delay or when flag reaches bottom
            }
        }

        if (this.level.flag && this.level.flag.reached) {
            // Flag lowering animation check
            if (this.level.flag.bannerY >= (this.height - TILE_SIZE)) {
                if (this.gameState === 'playing') {
                    this.completeLevel();
                }
            }
        }

        const targetX = this.player.x - this.width / 3;
        const maxX = this.level.cols * TILE_SIZE - this.width;
        this.camera.x = Math.max(0, Math.min(targetX, maxX));
    }

    respawn() {
        this.lives--;
        this.hud.update(this.lives, this.coins, this.currentLevelIdx, this.timer, this.level);

        if (this.lives <= 0) {
            this.gameState = 'gameover';
            this.hud.showMessage('GAME OVER', 'Te has quedado sin vidas.', 'MENU', () => {
                location.reload();
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
        this.gameState = 'puzzle';
        
        const artwork = this.artInfo[this.currentLevelIdx] || this.artInfo[0];
        const allIndices = [...this.level.defaultPieceIndices, ...this.level.collectedPieceIndices];
        
        this.puzzleManager.setup(artwork, allIndices);
    }

    nextLevel() {
        const isLast = this.currentLevelIdx === this.levelsData.length - 1;
        this.gameState = 'transition';
        
        const stats = `Puntos: ${this.coins} 🪙 | Tiempo: ${this.initialTimer - this.timer}s`;
        const title = isLast ? '¡JUEGO COMPLETADO!' : '¡NIVEL SUPERADO!';
        const btnLabel = isLast ? 'MENU' : 'SIGUIENTE';

        this.hud.showMessage(title, isLast ? "Has conquistado todos los mundos." : `Has superado el mundo ${this.currentLevelIdx + 1}`, btnLabel, () => {
            if (isLast) {
                location.reload();
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
        this.level.puzzlePieces.forEach(p => p.draw(this.ctx, this.camera));
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
