// ── Trial 2: The Poisoned Pond ──
const Pond = {
    map: null,
    platforms: [],
    movingPlatforms: [],
    sinkingPlatforms: [],
    completed: false,
    playerStart: { x: 1, y: 8 },
    exitLocation: { x: 23, y: 8 },
    submergedObjects: [],
    damageTimer: 0,

    init() {
        this.map = createTileMap(25, 17, 3); // Fill with poison water
        this.platforms = [];
        this.movingPlatforms = [];
        this.sinkingPlatforms = [];
        this.completed = false;
        this.damageTimer = 0;
        this.buildLevel();
    },

    buildLevel() {
        const m = this.map;

        // Border walls
        drawRect(m, 0, 0, 25, 17, 1);

        // Starting bank (left)
        fillRect(m, 0, 5, 3, 7, 0);
        fillRect(m, 0, 0, 3, 5, 1);
        fillRect(m, 0, 12, 3, 5, 1);

        // Exit bank (right)
        fillRect(m, 22, 5, 3, 7, 0);
        fillRect(m, 22, 0, 3, 5, 1);
        fillRect(m, 22, 12, 3, 5, 1);
        setTile(m, 23, 8, 5); // Exit door
        this.exitLocation = { x: 23, y: 8 };

        // === SAFE ROUTE (lower, slower) ===
        // Step 1: Static platform near start
        this._addStaticPlatform(4, 9, 2, 2);
        // Step 2
        this._addStaticPlatform(7, 10, 2, 2);
        // Step 3: Sinking platform
        this._addSinkingPlatform(10, 11, 2, 2);
        // Step 4
        this._addStaticPlatform(13, 10, 2, 2);
        // Step 5: Moving platform
        this._addMovingPlatform(16, 10, 2, 2, 0, -4, 3);
        // Step 6
        this._addStaticPlatform(19, 9, 2, 2);

        // === FAST ROUTE (upper, more dangerous) ===
        // Step 1
        this._addStaticPlatform(4, 5, 2, 1);
        // Step 2: Moving platform (faster)
        this._addMovingPlatform(7, 4, 2, 1, 0, 3, 2);
        // Step 3: Sinking platform
        this._addSinkingPlatform(10, 5, 1, 1);
        // Step 4: Trap platform (looks safe, slightly different)
        this._addStaticPlatform(12, 4, 2, 1);
        // Step 5: Moving platform
        this._addMovingPlatform(15, 5, 2, 1, 0, -2, 1.5);
        // Step 6
        this._addStaticPlatform(18, 4, 2, 1);
        // Step 7
        this._addStaticPlatform(20, 5, 2, 2);

        // Middle connecting platforms
        this._addStaticPlatform(11, 7, 2, 2);
        this._addSinkingPlatform(14, 7, 2, 1);
        this._addStaticPlatform(17, 7, 2, 1);

        // Submerged objects (storytelling)
        this.submergedObjects = [
            { x: 6 * 24, y: 7 * 24, type: 'toy', text: 'A child\'s toy floats motionless...' },
            { x: 9 * 24, y: 13 * 24, type: 'sign', text: 'A broken shop sign, half-submerged...' },
            { x: 15 * 24, y: 3 * 24, type: 'chair', text: 'A familiar chair from the surface...' },
            { x: 20 * 24, y: 12 * 24, type: 'lamp', text: 'A streetlamp, still faintly glowing...' },
        ];
    },

    _addStaticPlatform(x, y, w, h) {
        fillRect(this.map, x, y, w, h, 11);
        this.platforms.push({ x, y, w, h, type: 'static' });
    },

    _addSinkingPlatform(x, y, w, h) {
        fillRect(this.map, x, y, w, h, 16);
        this.sinkingPlatforms.push({
            x, y, w, h,
            sinkTimer: 0,
            maxSink: 1.5, // seconds before sinking — tight!
            sunk: false,
            resetTimer: 0,
        });
    },

    _addMovingPlatform(x, y, w, h, dx, dy, period) {
        this.movingPlatforms.push({
            baseX: x, baseY: y, w, h,
            x, y,
            dx, dy,
            period,
            timer: Math.random() * period, // randomize start
        });
    },

    update(dt) {
        if (this.completed) return null;

        // Update moving platforms
        for (const mp of this.movingPlatforms) {
            // Clear old position
            fillRect(this.map, Math.round(mp.x), Math.round(mp.y), mp.w, mp.h, 3);

            mp.timer += dt;
            const t = Math.sin(mp.timer * Math.PI * 2 / mp.period);
            mp.x = mp.baseX + mp.dx * t;
            mp.y = mp.baseY + mp.dy * t;

            // Set new position
            fillRect(this.map, Math.round(mp.x), Math.round(mp.y), mp.w, mp.h, 11);
        }

        // Update sinking platforms
        for (const sp of this.sinkingPlatforms) {
            if (sp.sunk) {
                sp.resetTimer += dt;
                if (sp.resetTimer > 3.0) {
                    sp.sunk = false;
                    sp.sinkTimer = 0;
                    sp.resetTimer = 0;
                    fillRect(this.map, sp.x, sp.y, sp.w, sp.h, 16);
                }
                continue;
            }

            // Check if player is standing on it
            const ptx = Math.floor(Player.x / 24);
            const pty = Math.floor(Player.y / 24);
            const onPlatform = ptx >= sp.x && ptx < sp.x + sp.w &&
                pty >= sp.y && pty < sp.y + sp.h;

            if (onPlatform) {
                sp.sinkTimer += dt;
                if (sp.sinkTimer >= sp.maxSink) {
                    sp.sunk = true;
                    fillRect(this.map, sp.x, sp.y, sp.w, sp.h, 3);
                    Particles.poisonSplash(sp.x * 24 + 12, sp.y * 24 + 12);
                }
            }
        }

        // Check if player is in poison
        const ptx = Math.floor(Player.x / 24);
        const pty = Math.floor(Player.y / 24);
        const ptx2 = Math.floor((Player.x + Player.w) / 24);
        const pty2 = Math.floor((Player.y + Player.h) / 24);
        const inPoison = getTile(this.map, ptx, pty) === 3 ||
            getTile(this.map, ptx2, pty) === 3 ||
            getTile(this.map, ptx, pty2) === 3 ||
            getTile(this.map, ptx2, pty2) === 3;

        if (inPoison) {
            this.damageTimer += dt;
            if (this.damageTimer > 0.3) {
                const dead = Player.takeDamage(1);
                this.damageTimer = 0;
                Particles.poisonSplash(Player.x + 10, Player.y + 10);
                if (dead) return { type: 'player_died' };
            }
        } else {
            this.damageTimer = 0;
        }

        // Check exit
        const exitDist = Math.sqrt(
            (Player.x - this.exitLocation.x * 24) ** 2 +
            (Player.y - this.exitLocation.y * 24) ** 2
        );
        if (exitDist < 24) {
            this.completed = true;
            return { type: 'pond_complete' };
        }

        return null;
    },

    draw(ctx) {
        Renderer.drawMap(ctx, this.map, true);

        // Draw submerged objects
        for (const obj of this.submergedObjects) {
            ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 1000 + obj.x) * 0.1;
            ctx.fillStyle = '#9CA3AF';
            switch (obj.type) {
                case 'toy':
                    ctx.fillRect(obj.x + 4, obj.y + 4, 12, 8);
                    ctx.fillStyle = '#F472B6';
                    ctx.fillRect(obj.x + 6, obj.y + 2, 8, 4);
                    break;
                case 'sign':
                    ctx.fillRect(obj.x, obj.y + 4, 20, 12);
                    ctx.fillStyle = '#78350F';
                    ctx.fillRect(obj.x + 8, obj.y + 14, 4, 8);
                    break;
                case 'chair':
                    ctx.fillRect(obj.x + 4, obj.y + 6, 14, 10);
                    ctx.fillRect(obj.x + 4, obj.y, 3, 16);
                    break;
                case 'lamp':
                    ctx.fillStyle = '#6B7280';
                    ctx.fillRect(obj.x + 8, obj.y, 4, 20);
                    const lampGlow = Math.sin(Date.now() / 600) * 0.2 + 0.3;
                    ctx.globalAlpha = lampGlow;
                    ctx.fillStyle = '#FCD34D';
                    ctx.fillRect(obj.x + 4, obj.y - 4, 12, 8);
                    break;
            }
            ctx.globalAlpha = 1;
        }

        // Draw sinking platform indicators
        for (const sp of this.sinkingPlatforms) {
            if (!sp.sunk && sp.sinkTimer > 0) {
                const progress = sp.sinkTimer / sp.maxSink;
                ctx.globalAlpha = progress * 0.5;
                ctx.fillStyle = '#22C55E';
                ctx.fillRect(sp.x * 24, sp.y * 24, sp.w * 24, sp.h * 24);
                ctx.globalAlpha = 1;
            }
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
        return [1];
    }
};
