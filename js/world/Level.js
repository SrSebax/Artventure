import { TILE_SIZE } from '../core/physics.js';
import { Enemy } from '../entities/Enemy.js';
import { Coin } from '../entities/Coin.js';
import { PuzzlePiece } from '../entities/PuzzlePiece.js';

export class Level {
    constructor(data, theme, totalPieces = 12) {
        this.map = data.map;
        this.cols = data.cols;
        this.rows = data.rows;
        this.theme = theme;
        
        this.enemies = [];
        this.coins = [];
        this.puzzlePieces = [];
        this.collectedPieceIndices = []; 
        this.defaultPieceIndices = [];   
        this.remainingPieceIndices = [];
        
        this.flag = null;

        this._setupPuzzle(totalPieces);
        this._parseMap();
    }

    _setupPuzzle(total) {
        // Decide 5-6 default pieces
        const countDefault = Math.floor(Math.random() * 2) + 5; // 5 or 6
        const allIndices = Array.from({length: total}, (_, i) => i);
        allIndices.sort(() => Math.random() - 0.5);
        
        this.defaultPieceIndices = allIndices.slice(0, countDefault);
        this.remainingPieceIndices = allIndices.slice(countDefault);
    }

    _parseMap() {
        const remainingClone = [...this.remainingPieceIndices];
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.map[r][c];
                // 3: Coin, 4: Enemy, 5: Flag
                if (t === 3) {
                    this.coins.push(new Coin(c * TILE_SIZE + TILE_SIZE / 2 - 6, r * TILE_SIZE));
                } else if (t === 4) {
                    const enemy = new Enemy(c * TILE_SIZE, (r - 1) * TILE_SIZE);
                    // Assign a piece to some enemies (50% chance if pieces remain)
                    if (remainingClone.length > 0 && Math.random() > 0.5) {
                        enemy.holdsPiece = remainingClone.pop();
                    }
                    this.enemies.push(enemy);
                } else if (t === 5 && !this.flag) {
                    this.flag = { 
                        x: c * TILE_SIZE, 
                        y: 0, 
                        width: TILE_SIZE, 
                        height: this.rows * TILE_SIZE, 
                        reached: false,
                        bannerY: 20 // Starting banner Y
                    };
                }
            }
        }

        // If pieces still remain, place them floating in the world
        while (remainingClone.length > 0) {
            let placed = false;
            while (!placed) {
                const rc = Math.floor(Math.random() * this.cols);
                const rr = Math.floor(Math.random() * (this.rows - 4)) + 2;
                if (this.map[rr][rc] === 0) {
                    this.puzzlePieces.push(new PuzzlePiece(rc * TILE_SIZE, rr * TILE_SIZE, remainingClone.pop()));
                    placed = true;
                }
            }
        }
    }

    getTile(col, row) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return 0;
        return this.map[row][col];
    }
}
