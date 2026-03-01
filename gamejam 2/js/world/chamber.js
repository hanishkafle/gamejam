// ── Trial 3: The Final Chamber (Convergence) ──
const Chamber = {
    map: null,
    completed: false,
    puzzleParts: [],
    puzzlesSolved: 0,
    totalPuzzles: 3,
    swordTaken: false,
    swordLocation: { x: 10, y: 10 },
    playerStart: { x: 1, y: 10 },
    deterioration: 0,
    crumblingTiles: [],
    pressurePlates: [],

    init() {
        this.map = createTileMap(21, 21, 0);
        this.completed = false;
        this.puzzlesSolved = 0;
        this.swordTaken = false;
        this.deterioration = 0;
        this.crumblingTiles = [];
        this.buildLevel();
        this.setupPuzzles();
        Guardian.init(18 * 24, 2 * 24);
    },

    buildLevel() {
        const m = this.map;
        fillRect(m, 0, 0, 21, 21, 0);
        drawRect(m, 0, 0, 21, 21, 1);

        // Central sword pedestal
        fillRect(m, 9, 9, 3, 3, 13);
        this.swordLocation = { x: 10, y: 10 };

        // Inner ring walls (broken)
        drawRect(m, 5, 5, 11, 11, 1);
        // Openings in inner ring
        setTile(m, 10, 5, 0);  // North
        setTile(m, 10, 15, 0); // South
        setTile(m, 5, 10, 0);  // West
        setTile(m, 15, 10, 0); // East

        // Entrance
        setTile(m, 0, 10, 0);
        setTile(m, 1, 10, 0);

        // Puzzle rooms in corners
        // NE room
        fillRect(m, 16, 1, 4, 4, 0);
        // NW room
        fillRect(m, 1, 1, 4, 4, 0);
        // SE room
        fillRect(m, 16, 16, 4, 4, 0);

        // Corridors to puzzle rooms
        fillRect(m, 16, 5, 2, 1, 0); // NE corridor
        fillRect(m, 1, 5, 2, 1, 0);  // NW corridor
        fillRect(m, 16, 15, 2, 1, 0); // SE corridor

        // Additional corridors
        fillRect(m, 2, 6, 3, 1, 0);
        fillRect(m, 16, 6, 3, 1, 0);
        fillRect(m, 2, 14, 3, 1, 0);
        fillRect(m, 16, 14, 3, 1, 0);
    },

    setupPuzzles() {
        // 3 pressure plate puzzles in the corner rooms
        this.pressurePlates = [
            // NE puzzle
            { x: 17, y: 2, active: false, solved: false, room: 'NE' },
            // NW puzzle
            { x: 2, y: 2, active: false, solved: false, room: 'NW' },
            // SE puzzle
            { x: 17, y: 17, active: false, solved: false, room: 'SE' },
        ];

        // Place pressure plate tiles
        for (const pp of this.pressurePlates) {
            setTile(this.map, pp.x, pp.y, 14);
        }
    },

    update(dt) {
        if (this.completed) return null;

        // Deterioration increases over time
        this.deterioration += dt * 0.02;

        // Randomly crumble floor tiles
        if (Math.random() < this.deterioration * 0.01) {
            const rx = 1 + Math.floor(Math.random() * 19);
            const ry = 1 + Math.floor(Math.random() * 19);
            if (getTile(this.map, rx, ry) === 0 && !this.crumblingTiles.find(c => c.x === rx && c.y === ry)) {
                this.crumblingTiles.push({ x: rx, y: ry, timer: 3 });
            }
        }

        // Update crumbling tiles
        for (let i = this.crumblingTiles.length - 1; i >= 0; i--) {
            this.crumblingTiles[i].timer -= dt;
            if (this.crumblingTiles[i].timer <= 0) {
                Particles.collapse(
                    this.crumblingTiles[i].x * 24 + 12,
                    this.crumblingTiles[i].y * 24 + 12
                );
                this.crumblingTiles.splice(i, 1);
            }
        }

        // Update Guardian
        if (!this.swordTaken) {
            Guardian.update(dt, Player.x, Player.y);
            // Check if guardian touches player
            if (Guardian.touchesPlayer(Player)) {
                const dead = Player.takeDamage(1);
                if (dead) return { type: 'player_died' };
            }
        }

        // Check pressure plates
        for (const pp of this.pressurePlates) {
            if (pp.solved) continue;

            const playerOnPlate =
                Math.floor(Player.x / 24) === pp.x &&
                Math.floor(Player.y / 24) === pp.y;

            if (playerOnPlate && Input.interact && !pp.active) {
                pp.active = true;
                pp.solved = true;
                this.puzzlesSolved++;
                Audio.keyInsert();
                Camera.shake(3, 0.3);

                // Stun guardian when puzzle solved
                Guardian.stun(3.0);

                // Change plate appearance
                setTile(this.map, pp.x, pp.y, 17);

                // When all puzzles solved, unlock sword
                if (this.puzzlesSolved >= this.totalPuzzles) {
                    // Clear the seal around the sword
                    fillRect(this.map, 9, 9, 3, 3, 0);
                    setTile(this.map, 10, 10, 13);
                }
            }
        }

        // Check sword retrieval
        if (this.puzzlesSolved >= this.totalPuzzles && !this.swordTaken) {
            const swordDist = Math.sqrt(
                (Player.x - this.swordLocation.x * 24) ** 2 +
                (Player.y - this.swordLocation.y * 24) ** 2
            );
            if (swordDist < 24 && Input.interact) {
                this.swordTaken = true;
                Player.hasSword = true;
                Guardian.active = false;
                Audio.swordRetrieved();
                Camera.shake(6, 1.0);
                Particles.keyPickup(this.swordLocation.x * 24 + 12, this.swordLocation.y * 24 + 12);
                setTile(this.map, 10, 10, 0);
                this.completed = true;
                return { type: 'sword_taken' };
            }
        }

        return null;
    },

    draw(ctx) {
        Renderer.drawMap(ctx, this.map, true);

        // Draw crumbling tile warnings
        for (const ct of this.crumblingTiles) {
            const flash = Math.sin(ct.timer * 5) * 0.3 + 0.3;
            ctx.globalAlpha = flash;
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(ct.x * 24, ct.y * 24, 24, 24);
            ctx.globalAlpha = 1;
        }

        // Draw puzzle status indicators
        for (const pp of this.pressurePlates) {
            if (!pp.solved) {
                const glow = Math.sin(Date.now() / 500) * 0.2 + 0.4;
                ctx.globalAlpha = glow;
                ctx.fillStyle = '#FCD34D';
                ctx.fillRect(pp.x * 24 - 2, pp.y * 24 - 2, 28, 28);
                ctx.globalAlpha = 1;
            }
        }

        // Draw sword if still there
        if (!this.swordTaken && this.puzzlesSolved >= this.totalPuzzles) {
            const sx = this.swordLocation.x * 24;
            const sy = this.swordLocation.y * 24;
            const bob = Math.sin(Date.now() / 300) * 3;

            // Glow
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#FCD34D';
            ctx.fillRect(sx - 4, sy - 4 + bob, 32, 32);
            ctx.globalAlpha = 1;

            // Sword
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(sx + 10, sy + 2 + bob, 4, 16);
            ctx.fillStyle = '#78716C';
            ctx.fillRect(sx + 6, sy + 14 + bob, 12, 3);
            ctx.fillStyle = '#92400E';
            ctx.fillRect(sx + 9, sy + 16 + bob, 6, 6);
        } else if (!this.swordTaken) {
            // Sword still sealed
            const sx = this.swordLocation.x * 24;
            const sy = this.swordLocation.y * 24;
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#6B7280';
            ctx.fillRect(sx + 10, sy + 2, 4, 16);
            ctx.fillRect(sx + 6, sy + 14, 12, 3);
            ctx.globalAlpha = 1;
        }

        // Draw guardian
        Guardian.draw(ctx);

        // Puzzle progress indicator at top
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for UI
        ctx.restore();
    },

    getSolidTiles() {
        return [1, 13];
    }
};
