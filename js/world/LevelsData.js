export const THEMES = [
    { sky: '#87CEEB', ground: '#4CAF50', groundDark: '#2E7D32', brick: '#D2691E', brickDark: '#8B4513', coin: '#FFD700', bg1: '#98FB98', bg2: '#228B22' },
    { sky: '#FF6B35', ground: '#FF8C00', groundDark: '#CC6600', brick: '#8B1A1A', brickDark: '#5C1010', coin: '#FFD700', bg1: '#FF4500', bg2: '#8B0000' },
    { sky: '#1a1a4e', ground: '#4040CC', groundDark: '#2020AA', brick: '#8800CC', brickDark: '#550088', coin: '#00FFFF', bg1: '#2200AA', bg2: '#000055' },
    { sky: '#2F4F4F', ground: '#556B2F', groundDark: '#21330F', brick: '#8B4513', brickDark: '#2F1E0E', coin: '#FFD700', bg1: '#6B8E23', bg2: '#556B2F' },
    { sky: '#2C001E', ground: '#6A0C22', groundDark: '#3A0410', brick: '#541212', brickDark: '#320606', coin: '#FFD700', bg1: '#900C3F', bg2: '#581845' }
];

function createBlankMap(cols, rows) {
    const map = [];
    for (let r = 0; r < rows; r++) map.push(new Array(cols).fill(0));
    return map;
}

export function getLevelsData() {
    const levels = [];

    // LEVEL 1 - Forest
    const cols1 = 60, rows1 = 13;
    const map1 = createBlankMap(cols1, rows1);
    for (let c = 0; c < cols1; c++) { map1[12][c] = 1; map1[11][c] = 1; }
    // Gaps
    for (let c = 15; c <= 17; c++) { map1[12][c] = 0; map1[11][c] = 0; }
    for (let c = 32; c <= 34; c++) { map1[12][c] = 0; map1[11][c] = 0; }
    // Platforms
    [[4, 9, 4], [8, 7, 3], [12, 5, 3], [18, 9, 4], [22, 7, 3], [26, 5, 3], [35, 9, 4], [42, 5, 4], [50, 7, 3]].forEach(([c, r, w]) => {
        for (let i = 0; i < w; i++) map1[r][c + i] = 2;
    });
    // Coins & Enemies
    [[5, 8], [9, 6], [19, 8], [23, 6], [43, 4]].forEach(([c, r]) => map1[r][c] = 3);
    [[7, 10], [20, 10], [37, 10], [48, 10]].forEach(([c, r]) => map1[r][c] = 4);
    // Flag
    for (let r = 2; r <= 11; r++) map1[r][57] = 5;
    levels.push({ map: map1, cols: cols1, rows: rows1, timeLimit: 60 });

    // LEVEL 2 - Desert
    const cols2 = 65, rows2 = 13;
    const map2 = createBlankMap(cols2, rows2);
    for (let c = 0; c < cols2; c++) { map2[12][c] = 1; map2[11][c] = 1; }
    for (let c = 10; c <= 13; c++) { map2[12][c] = 0; map2[11][c] = 0; }
    for (let c = 25; c <= 29; c++) { map2[12][c] = 0; map2[11][c] = 0; }
    [[3, 8, 3], [7, 6, 3], [14, 7, 3], [30, 9, 3], [36, 5, 3], [47, 8, 3], [56, 7, 3]].forEach(([c, r, w]) => {
        for (let i = 0; i < w; i++) map2[r][c + i] = 2;
    });
    [[4, 7], [8, 5], [15, 6], [31, 8], [48, 7]].forEach(([c, r]) => map2[r][c] = 3);
    [[6, 10], [18, 10], [35, 10], [50, 10]].forEach(([c, r]) => map2[r][c] = 4);
    for (let r = 2; r <= 11; r++) map2[r][62] = 5;
    levels.push({ map: map2, cols: cols2, rows: rows2, timeLimit: 90 });

    // LEVEL 3 - Castle
    const cols3 = 70, rows3 = 13;
    const map3 = createBlankMap(cols3, rows3);
    for (let c = 0; c < cols3; c++) { map3[12][c] = 1; map3[11][c] = 1; }
    for (let c = 8; c <= 11; c++) { map3[12][c] = 0; map3[11][c] = 0; }
    for (let c = 18; c <= 22; c++) { map3[12][c] = 0; map3[11][c] = 0; }
    for (let c = 30; c <= 34; c++) { map3[12][c] = 0; map3[11][c] = 0; }
    [[3, 9, 3], [12, 8, 2], [23, 8, 2], [31, 10, 2], [39, 4, 2], [49, 8, 2], [60, 8, 2]].forEach(([c, r, w]) => {
        for (let i = 0; i < w; i++) map3[r][c + i] = 2;
    });
    [[4, 8], [13, 7], [24, 7], [32, 9], [40, 3], [50, 7], [61, 7]].forEach(([c, r]) => map3[r][c] = 3);
    [[5, 10], [14, 10], [23, 10], [36, 10], [46, 10], [62, 10]].forEach(([c, r]) => map3[r][c] = 4);
    for (let r = 2; r <= 11; r++) map3[r][67] = 5;
    levels.push({ map: map3, cols: cols3, rows: rows3, timeLimit: 120 });

    // LEVEL 4 - Ruins
    const cols4 = 75, rows4 = 13;
    const map4 = createBlankMap(cols4, rows4);
    for (let c = 0; c < cols4; c++) { map4[12][c] = 1; map4[11][c] = 1; }
    for (let c = 5; c <= 9; c++) { map4[12][c] = 0; map4[11][c] = 0; }
    for (let c = 20; c <= 25; c++) { map4[12][c] = 0; map4[11][c] = 0; }
    for (let c = 40; c <= 45; c++) { map4[12][c] = 0; map4[11][c] = 0; }
    [[5, 8, 2], [14, 6, 3], [22, 5, 2], [32, 8, 3], [42, 6, 2], [52, 9, 3], [64, 7, 3]].forEach(([c, r, w]) => {
        for (let i = 0; i < w; i++) map4[r][c + i] = 2;
    });
    [[6, 7], [15, 5], [23, 4], [33, 7], [43, 5], [53, 8], [65, 6]].forEach(([c, r]) => map4[r][c] = 3);
    [[11, 10], [28, 10], [38, 10], [48, 10], [60, 10], [68, 10]].forEach(([c, r]) => map4[r][c] = 4);
    for (let r = 2; r <= 11; r++) map4[r][72] = 5;
    levels.push({ map: map4, cols: cols4, rows: rows4, timeLimit: 140 });

    // LEVEL 5 - Inferno
    const cols5 = 80, rows5 = 13;
    const map5 = createBlankMap(cols5, rows5);
    for (let c = 0; c < cols5; c++) { map5[12][c] = 1; map5[11][c] = 1; }
    for (let c = 10; c <= 15; c++) { map5[12][c] = 0; map5[11][c] = 0; }
    for (let c = 25; c <= 30; c++) { map5[12][c] = 0; map5[11][c] = 0; }
    for (let c = 45; c <= 50; c++) { map5[12][c] = 0; map5[11][c] = 0; }
    for (let c = 60; c <= 65; c++) { map5[12][c] = 0; map5[11][c] = 0; }
    [[8, 7, 2], [18, 5, 2], [28, 4, 3], [35, 8, 2], [48, 6, 3], [58, 8, 2], [68, 5, 3]].forEach(([c, r, w]) => {
        for (let i = 0; i < w; i++) map5[r][c + i] = 2;
    });
    [[9, 6], [19, 4], [29, 3], [36, 7], [49, 5], [59, 7], [69, 4]].forEach(([c, r]) => map5[r][c] = 3);
    [[5, 10], [20, 10], [40, 10], [55, 10], [70, 10]].forEach(([c, r]) => map5[r][c] = 4);
    for (let r = 2; r <= 11; r++) map5[r][77] = 5;
    levels.push({ map: map5, cols: cols5, rows: rows5, timeLimit: 150 });

    return levels;
}
