// ── Tilemap Data Structure ──
function createTileMap(width, height, fill = 0) {
    return {
        width,
        height,
        tileSize: 24,
        data: new Array(width * height).fill(fill),
    };
}

function setTile(map, x, y, val) {
    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
        map.data[y * map.width + x] = val;
    }
}

function getTile(map, x, y) {
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) return 1;
    return map.data[y * map.width + x];
}

function fillRect(map, x, y, w, h, val) {
    for (let iy = y; iy < y + h; iy++) {
        for (let ix = x; ix < x + w; ix++) {
            setTile(map, ix, iy, val);
        }
    }
}

function drawRect(map, x, y, w, h, val) {
    for (let ix = x; ix < x + w; ix++) {
        setTile(map, ix, y, val);
        setTile(map, ix, y + h - 1, val);
    }
    for (let iy = y; iy < y + h; iy++) {
        setTile(map, x, iy, val);
        setTile(map, x + w - 1, iy, val);
    }
}

// Tile IDs reference:
// 0  = grass/ground
// 1  = wall (solid)
// 2  = path/cobblestone
// 3  = water/poison
// 4  = building wall (solid)
// 5  = door
// 6  = window
// 7  = roof
// 8  = flowers
// 9  = portal
// 10 = key shimmer
// 11 = platform (solid)
// 12 = maze wall (solid, shifts)
// 13 = seal/pedestal
// 14 = pressure plate
// 15 = townhall floor
// 16 = sinking platform
// 17 = landmark tile
// 18 = tree (solid)
// 19 = bush
// 20 = fence (solid)
// 21 = lamp post
// 22 = well (solid)
// 23 = tall grass (decorative)
// 24 = stone
// 25 = bridge
