// ── Phase 4: The Return ──
const Return = {
    map: null,
    completed: false,
    instability: 0,
    collapseTimer: 0,
    portalLocation: { x: 14, y: 5 },
    playerStart: { x: 1, y: 10 },
    exitReached: false,
    shakeTimer: 0,

    init() {
        this.map = createTileMap(16, 12, 0);
        this.completed = false;
        this.instability = 0;
        this.collapseTimer = 0;
        this.exitReached = false;
        this.shakeTimer = 0;
        this.buildLevel();
        Audio.startReturnMusic();
    },

    buildLevel() {
        const m = this.map;
        fillRect(m, 0, 0, 16, 12, 0);
        drawRect(m, 0, 0, 16, 12, 1);

        // A collapsing corridor leading to an exit portal
        // Start from left, navigate through debris to portal on right

        // Debris walls (narrower than normal)
        fillRect(m, 3, 1, 1, 4, 12);
        fillRect(m, 3, 7, 1, 4, 12);
        fillRect(m, 6, 2, 1, 3, 12);
        fillRect(m, 6, 8, 1, 3, 12);
        fillRect(m, 9, 1, 1, 4, 12);
        fillRect(m, 9, 7, 1, 4, 12);
        fillRect(m, 12, 3, 1, 2, 12);
        fillRect(m, 12, 8, 1, 3, 12);

        // Small gaps of poison (hazards)
        setTile(m, 5, 5, 3);
        setTile(m, 5, 6, 3);
        setTile(m, 8, 5, 3);
        setTile(m, 8, 6, 3);
        setTile(m, 11, 5, 3);

        // Exit portal
        setTile(m, 14, 5, 9);
        setTile(m, 14, 6, 9);
        this.portalLocation = { x: 14, y: 5 };
    },

    update(dt) {
        if (this.completed) return null;

        // Increasing instability
        this.instability += dt * 0.05;

        // Screen shake increasing
        this.shakeTimer += dt;
        if (this.shakeTimer > 0.5) {
            Camera.shake(this.instability * 3, 0.3);
            this.shakeTimer = 0;
        }

        // Collapse debris
        this.collapseTimer += dt;
        if (this.collapseTimer > 0.3 / (1 + this.instability)) {
            // Random collapse particles
            const rx = Math.random() * this.map.width * 24;
            const ry = Math.random() * this.map.height * 24;
            Particles.collapse(rx, ry);
            this.collapseTimer = 0;
        }

        // Poison damage
        const ptx = Math.floor(Player.x / 24);
        const pty = Math.floor(Player.y / 24);
        if (getTile(this.map, ptx, pty) === 3) {
            const dead = Player.takeDamage(1);
            if (dead) return { type: 'player_died' };
        }

        // Check exit portal
        const portalDist = Math.sqrt(
            (Player.x - this.portalLocation.x * 24) ** 2 +
            (Player.y - this.portalLocation.y * 24) ** 2
        );
        if (portalDist < 30) {
            this.completed = true;
            this.exitReached = true;
            return { type: 'return_complete' };
        }

        return null;
    },

    draw(ctx) {
        Renderer.drawMap(ctx, this.map, true);

        // Exit portal glow
        const px = this.portalLocation.x * 24;
        const py = this.portalLocation.y * 24;
        const glow = Math.sin(Date.now() / 200) * 0.3 + 0.5;
        ctx.globalAlpha = glow;
        ctx.fillStyle = '#8B5CF6';
        ctx.fillRect(px - 6, py - 6, 36, 60);
        ctx.globalAlpha = 1;

        // Instability cracks
        ctx.strokeStyle = `rgba(139, 92, 246, ${this.instability * 0.5})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < Math.floor(this.instability * 10); i++) {
            const cx = ((i * 137 + 42) % (this.map.width * 24));
            const cy = ((i * 89 + 17) % (this.map.height * 24));
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + 20, cy + 15);
            ctx.lineTo(cx + 5, cy + 30);
            ctx.stroke();
        }
    },

    getSolidTiles() {
        return [1, 12];
    }
};
