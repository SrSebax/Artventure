import { TILE_SIZE } from '../core/physics.js';
import { Enemy } from '../entities/Enemy.js';
import { Coin } from '../entities/Coin.js';

export class Level {
    constructor(data, theme) {
        this.map = data.map;
        this.cols = data.cols;
        this.rows = data.rows;
        this.theme = theme;
        
        this.enemies = [];
        this.coins = [];
        this.flag = null;

        this._parseMap();
    }

    _parseMap() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.map[r][c];
                // 3: Coin, 4: Enemy, 5: Flag
                if (t === 3) {
                    this.coins.push(new Coin(c * TILE_SIZE + TILE_SIZE / 2 - 6, r * TILE_SIZE));
                } else if (t === 4) {
                    this.enemies.push(new Enemy(c * TILE_SIZE, (r - 1) * TILE_SIZE));
                } else if (t === 5 && !this.flag) {
                    this.flag = { x: c * TILE_SIZE, y: 0, width: TILE_SIZE, height: this.rows * TILE_SIZE, reached: false };
                }
            }
        }
    }

    getTile(col, row) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return 0;
        return this.map[row][col];
    }
}
