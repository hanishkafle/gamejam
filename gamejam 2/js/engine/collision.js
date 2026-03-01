// ── Collision Detection ──
const Collision = {
    // AABB overlap
    aabb(a, b) {
        return a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y;
    },

    // Check if a point is inside a rect
    pointInRect(px, py, rect) {
        return px >= rect.x && px <= rect.x + rect.w &&
            py >= rect.y && py <= rect.y + rect.h;
    },

    // Check tile collision at a world position
    tileAt(worldX, worldY, tileMap, solidTiles) {
        const tx = Math.floor(worldX / tileMap.tileSize);
        const ty = Math.floor(worldY / tileMap.tileSize);
        if (tx < 0 || ty < 0 || tx >= tileMap.width || ty >= tileMap.height) return true;
        const tile = tileMap.data[ty * tileMap.width + tx];
        return solidTiles.includes(tile);
    },

    // Check entity movement against tilemap
    canMove(entity, dx, dy, tileMap, solidTiles) {
        const margin = 2;
        const nx = entity.x + dx;
        const ny = entity.y + dy;
        const w = entity.w - margin * 2;
        const h = entity.h - margin * 2;

        // Check all 4 corners of the entity bounding box
        const corners = [
            { x: nx + margin, y: ny + margin },
            { x: nx + w + margin, y: ny + margin },
            { x: nx + margin, y: ny + h + margin },
            { x: nx + w + margin, y: ny + h + margin },
        ];

        for (const c of corners) {
            if (this.tileAt(c.x, c.y, tileMap, solidTiles)) return false;
        }
        return true;
    },

    // Distance between two entities
    dist(a, b) {
        const dx = (a.x + a.w / 2) - (b.x + b.w / 2);
        const dy = (a.y + a.h / 2) - (b.y + b.h / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }
};
