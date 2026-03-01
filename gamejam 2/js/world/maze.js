// ── Trial 1: The Shifting Maze ──
const Maze = {
    map: null,
    shiftTimer: 0,
    shiftInterval: 8, // 8 seconds — tighter pressure
    shiftWarning: false,
    warningTimer: 0,
    currentConfig: 0,
    totalConfigs: 3,
    playerStart: { x: 1, y: 1 },
    exitLocation: { x: 13, y: 13 },
    completed: false,
    footprints: [],
    configs: [],
    hazardTimer: 0,
    hazardTiles: [], // tiles that pulse damage

    init() {
        this.map = createTileMap(15, 15, 0);
        this.shiftTimer = this.shiftInterval;
        this.currentConfig = 0;
        this.completed = false;
        this.footprints = [];
        this.warningTimer = 0;
        this.shiftWarning = false;
        this.hazardTiles = [];
        this.hazardTimer = 0;
        this.buildBase();
        this.generateConfigs();
        this.applyConfig(0);
    },

    buildBase() {
        const m = this.map;
        fillRect(m, 0, 0, 15, 15, 0);
        drawRect(m, 0, 0, 15, 15, 1);
        // Landmarks
        setTile(m, 3, 3, 17);
        setTile(m, 7, 7, 17);
        setTile(m, 11, 11, 17);
        // Hazard zones — poison puddles scattered
        this.hazardTiles = [
            { x: 5, y: 5 }, { x: 10, y: 3 }, { x: 2, y: 10 },
            { x: 12, y: 7 }, { x: 8, y: 12 }, { x: 4, y: 8 },
        ];
        for (const h of this.hazardTiles) {
            setTile(m, h.x, h.y, 3);
        }
        // Exit
        setTile(m, 13, 13, 5);
        this.exitLocation = { x: 13, y: 13 };
    },

    generateConfigs() {
        this.configs = [
            [
                { x: 3, y: 3, w: 3, h: 1 },
                { x: 9, y: 3, w: 3, h: 1 },
                { x: 2, y: 6, w: 2, h: 1 },
                { x: 6, y: 6, w: 3, h: 1 },
                { x: 11, y: 6, w: 2, h: 1 },
                { x: 4, y: 9, w: 3, h: 1 },
                { x: 9, y: 9, w: 2, h: 1 },
                { x: 2, y: 12, w: 3, h: 1 },
                { x: 8, y: 12, w: 3, h: 1 },
            ],
            [
                { x: 3, y: 2, w: 1, h: 3 },
                { x: 6, y: 1, w: 1, h: 3 },
                { x: 10, y: 2, w: 1, h: 2 },
                { x: 3, y: 7, w: 1, h: 3 },
                { x: 7, y: 5, w: 1, h: 3 },
                { x: 11, y: 6, w: 1, h: 3 },
                { x: 5, y: 10, w: 1, h: 3 },
                { x: 9, y: 10, w: 1, h: 3 },
                { x: 12, y: 11, w: 1, h: 2 },
            ],
            [
                { x: 2, y: 4, w: 3, h: 1 },
                { x: 4, y: 2, w: 1, h: 2 },
                { x: 8, y: 2, w: 2, h: 1 },
                { x: 11, y: 4, w: 2, h: 1 },
                { x: 6, y: 8, w: 2, h: 1 },
                { x: 3, y: 10, w: 1, h: 2 },
                { x: 9, y: 7, w: 1, h: 2 },
                { x: 10, y: 10, w: 3, h: 1 },
                { x: 6, y: 12, w: 2, h: 1 },
            ],
        ];
    },

    applyConfig(index) {
        for (let y = 1; y < 14; y++) {
            for (let x = 1; x < 14; x++) {
                const current = getTile(this.map, x, y);
                if (current === 12) setTile(this.map, x, y, 0);
            }
        }
        // Restore landmarks
        setTile(this.map, 3, 3, 17);
        setTile(this.map, 7, 7, 17);
        setTile(this.map, 11, 11, 17);
        setTile(this.map, 13, 13, 5);
        // Restore hazards
        for (const h of this.hazardTiles) {
            setTile(this.map, h.x, h.y, 3);
        }

        const config = this.configs[index];
        for (const wall of config) {
            fillRect(this.map, wall.x, wall.y, wall.w, wall.h, 12);
        }

        // Ensure start/exit clear
        setTile(this.map, 1, 1, 0);
        setTile(this.map, 2, 1, 0);
        setTile(this.map, 1, 2, 0);
        setTile(this.map, 2, 2, 0);
        setTile(this.map, 13, 13, 5);
        setTile(this.map, 12, 13, 0);
        setTile(this.map, 13, 12, 0);
        setTile(this.map, 12, 12, 0);
    },

    update(dt) {
        if (this.completed) return null;

        // Track footprints
        const tx = Math.floor(Player.x / 24);
        const ty = Math.floor(Player.y / 24);
        if (!this.footprints.find(f => f.x === tx && f.y === ty)) {
            this.footprints.push({ x: tx, y: ty });
        }

        // Poison damage from hazard tiles
        const ptile = getTile(this.map, tx, ty);
        if (ptile === 3) {
            this.hazardTimer += dt;
            if (this.hazardTimer > 0.4) {
                const dead = Player.takeDamage(1);
                this.hazardTimer = 0;
                Particles.poisonSplash(Player.x + 10, Player.y + 10);
                if (dead) return { type: 'player_died' };
            }
        } else {
            this.hazardTimer = 0;
        }

        // Shift timer
        this.shiftTimer -= dt;

        if (this.shiftTimer <= 2 && !this.shiftWarning) {
            this.shiftWarning = true;
            Audio.mazeWarning();
        }

        if (this.shiftTimer <= 0) {
            this.currentConfig = (this.currentConfig + 1) % this.totalConfigs;
            this.applyConfig(this.currentConfig);
            this.shiftTimer = this.shiftInterval;
            this.shiftWarning = false;
            Audio.mazeShift();
            Camera.shake(4, 0.5);

            // Push player out of walls
            const ptx = Math.floor(Player.x / 24);
            const pty = Math.floor(Player.y / 24);
            if (getTile(this.map, ptx, pty) === 12) {
                let found = false;
                for (let radius = 1; radius <= 5 && !found; radius++) {
                    for (let ddx = -radius; ddx <= radius && !found; ddx++) {
                        for (let ddy = -radius; ddy <= radius && !found; ddy++) {
                            if (Math.abs(ddx) !== radius && Math.abs(ddy) !== radius) continue;
                            const nx = ptx + ddx;
                            const ny = pty + ddy;
                            const t = getTile(this.map, nx, ny);
                            if (t === 0 || t === 17 || t === 5) {
                                Player.x = nx * 24;
                                Player.y = ny * 24;
                                found = true;
                            }
                        }
                    }
                }
                // Wall shift damage
                Player.takeDamage(1);
            }
        }

        // Check exit
        const exitDist = Math.sqrt(
            (Player.x - this.exitLocation.x * 24) ** 2 +
            (Player.y - this.exitLocation.y * 24) ** 2
        );
        if (exitDist < 28) {
            this.completed = true;
            return { type: 'maze_complete' };
        }

        return null;
    },

    draw(ctx) {
        Renderer.drawMap(ctx, this.map, true);

        // Footprints
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#A78BFA';
        for (const fp of this.footprints) {
            ctx.fillRect(fp.x * 24 + 8, fp.y * 24 + 8, 8, 8);
        }
        ctx.globalAlpha = 1;

        // Shift warning
        if (this.shiftWarning) {
            const flash = Math.sin(Date.now() / 100) * 0.15 + 0.15;
            ctx.fillStyle = `rgba(139, 92, 246, ${flash})`;
            ctx.fillRect(0, 0, this.map.width * 24, this.map.height * 24);
        }

        // Exit glow
        const ex = this.exitLocation.x * 24;
        const ey = this.exitLocation.y * 24;
        ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 400) * 0.2;
        ctx.fillStyle = '#4ADE80';
        ctx.fillRect(ex - 2, ey - 2, 28, 28);
        ctx.globalAlpha = 1;
    },

    getSolidTiles() {
        return [1, 12];
    }
};
