// ── Main Game — State Machine & Game Loop ──
const Game = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 600,
    state: 'TITLE',
    timer: 420,
    totalTime: 420,
    lastTime: 0,
    briefingPhase: 0,
    briefingNarrated: [false, false, false],
    timerActive: false,
    tickTimer: 0,
    surfaceReturnMode: false,
    deathTimer: 0,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        Input.init();
        Camera.init(this.width, this.height);

        this.state = 'TITLE';
        this.lastTime = performance.now();

        requestAnimationFrame((t) => this.loop(t));
    },

    resize() {
        const ratio = 800 / 600;
        let w = window.innerWidth;
        let h = window.innerHeight;

        if (w / h > ratio) {
            w = h * ratio;
        } else {
            h = w / ratio;
        }

        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.width = 800;
        this.height = 600;
    },

    loop(timestamp) {
        const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        Input.update();
        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    },

    handlePlayerDeath() {
        this.timerActive = false;
        Audio.failureSound();
        Audio.stopDrone();
        Audio.stopSpeaking();
        Camera.shake(10, 1.0);
        Menus.failTimer = 0;
        Menus.failReason = 'death';
        this.changeState('FAIL');
        Audio.speak('The agent fell. No one will come to finish the mission.', 'narrator');
    },

    update(dt) {
        if (this.timerActive) {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.timer = 0;
                this.timerActive = false;
                Menus.failTimer = 0;
                Menus.failReason = 'time';
                this.changeState('FAIL');
                Audio.failureSound();
                Audio.stopDrone();
                Audio.speak('Time ran out. The breach reached the surface.', 'narrator');
                return;
            }

            const urgency = 1 - (this.timer / this.totalTime);
            if (urgency > 0.6) {
                this.tickTimer += dt;
                const interval = urgency > 0.9 ? 0.3 : urgency > 0.8 ? 0.5 : 1.0;
                if (this.tickTimer > interval) {
                    Audio.timerTick(urgency);
                    this.tickTimer = 0;
                }
            }
        }

        Transitions.update(dt);
        Particles.update(dt);
        Dialog.update(dt);

        if (Dialog.active || Transitions.active) {
            if (Dialog.active) return;
            if (Transitions.active) return;
        }

        switch (this.state) {
            case 'TITLE':
                this.updateTitle(dt);
                break;
            case 'BRIEFING':
                this.updateBriefing(dt);
                break;
            case 'SURFACE':
                this.updateSurface(dt);
                break;
            case 'PORTAL':
                this.updatePortal(dt);
                break;
            case 'MAZE':
                this.updateMaze(dt);
                break;
            case 'POND':
                this.updatePond(dt);
                break;
            case 'CHAMBER':
                this.updateChamber(dt);
                break;
            case 'RETURN':
                this.updateReturn(dt);
                break;
            case 'RETURN_SURFACE':
                this.updateReturnSurface(dt);
                break;
            case 'WIN':
                if (Input.any && Menus.winTimer > 11) {
                    this.restartGame();
                }
                break;
            case 'FAIL':
                if (Input.any && Menus.failTimer > 8) {
                    this.restartGame();
                }
                break;
        }
    },

    updateTitle(dt) {
        if (Input.any) {
            Audio.init();
            this.changeState('BRIEFING');
            this.briefingPhase = 0;
            this.briefingNarrated = [false, false, false];
        }
    },

    updateBriefing(dt) {
        this.briefingPhase += dt;

        // Trigger narration at each phase
        if (this.briefingPhase > 1 && !this.briefingNarrated[0]) {
            this.briefingNarrated[0] = true;
            Audio.narrateBriefing('intro');
        }
        if (this.briefingPhase > 7 && !this.briefingNarrated[1]) {
            this.briefingNarrated[1] = true;
            Audio.narrateBriefing('mission');
        }
        if (this.briefingPhase > 14 && !this.briefingNarrated[2]) {
            this.briefingNarrated[2] = true;
            Audio.narrateBriefing('finale');
        }

        // Auto-start game after briefing completes
        if (this.briefingPhase > 22) {
            Audio.stopSpeaking();
            this.startGame();
            return;
        }

        // Any key press after 3 seconds
        if (Input.any && this.briefingPhase > 3) {
            if (this.briefingPhase < 18) {
                // Skip to final phase
                this.briefingPhase = 18.5;
                Audio.stopSpeaking();
            } else {
                // Start game!
                Audio.stopSpeaking();
                this.startGame();
            }
        }
    },

    startGame() {
        this.timer = this.totalTime;
        this.timerActive = true;

        Player.resetFull();
        Surface.init();
        Player.init(Surface.playerStart.x, Surface.playerStart.y);

        Audio.startSurfaceAmbience();

        Transitions.start('fade', 1.5, '#000', () => {
            this.state = 'SURFACE';
        });

        setTimeout(() => {
            Dialog.show([
                'WASD or Arrow Keys to move. E or SPACE to interact.',
                'Find all 5 KEYS hidden across the village.',
                'Look for shimmering gold tiles. Explore every building.',
                'The PORTAL is in the town square. Time is ticking...'
            ], null, 'narrator');
        }, 2000);
    },

    updateSurface(dt) {
        Player.update(dt, Surface.map, Surface.getSolidTiles());
        Camera.follow(Player);
        Camera.clamp(Surface.map.width * 24, Surface.map.height * 24);
        Camera.update(dt);

        const event = Surface.update(dt, this.timer, this.totalTime);
        if (event) {
            switch (event.type) {
                case 'key':
                    Dialog.show([
                        `Key found! (${Player.keys}/5)`,
                        event.hint
                    ], null, 'narrator');
                    Audio.speak(`Key found. ${Player.keys} of 5.`, 'narrator');
                    break;
                case 'dialog':
                    Dialog.show(event.lines, null, event.npcType || 'villager');
                    break;
                case 'portal':
                    Audio.stopSpeaking();
                    this.changeState('PORTAL');
                    Portal.init();
                    Portal.startInsertion();
                    break;
                case 'seal_sword':
                    Audio.stopSpeaking();
                    this.timerActive = false;
                    this.changeState('WIN');
                    Audio.successSound();
                    Audio.stopDrone();
                    Menus.winTimer = 0;
                    Audio.speak('The seal holds. The town is safe. For now.', 'narrator');
                    break;
            }
        }
    },

    updatePortal(dt) {
        Portal.update(dt, this.width, this.height);
        if (Portal.complete) {
            this.changeState('MAZE');
            Maze.init();
            Player.init(Maze.playerStart.x * 24, Maze.playerStart.y * 24);
            Player.health = Player.maxHealth;
            Audio.startBelowDrone();
            Dialog.show([
                'You have entered THE BELOW.',
                'The maze walls shift every 8 seconds. Listen for the warning.',
                'Avoid the green poison puddles.',
                'Reach the GREEN EXIT. Do not stop moving.'
            ], null, 'urgent');
        }
    },

    updateMaze(dt) {
        Player.update(dt, Maze.map, Maze.getSolidTiles());
        Camera.follow(Player);
        Camera.clamp(Maze.map.width * 24, Maze.map.height * 24);
        Camera.update(dt);

        const event = Maze.update(dt);
        if (event) {
            if (event.type === 'maze_complete') {
                Transitions.start('crack', 1.5, '#0B0A12', () => {
                    this.state = 'POND';
                    Pond.init();
                    Player.init(1 * 24, 8 * 24);
                    Player.health = Player.maxHealth;
                    Dialog.show([
                        'TRIAL II: The Poisoned Pond.',
                        'The water is TOXIC — it will kill you fast.',
                        'Jump between platforms. Some move. Some SINK.',
                        'Choose wisely: fast route above, safe route below.'
                    ], null, 'urgent');
                });
            } else if (event.type === 'player_died') {
                this.handlePlayerDeath();
            }
        }
    },

    updatePond(dt) {
        Player.update(dt, Pond.map, Pond.getSolidTiles());
        Camera.follow(Player);
        Camera.clamp(Pond.map.width * 24, Pond.map.height * 24);
        Camera.update(dt);

        const event = Pond.update(dt);
        if (event) {
            if (event.type === 'pond_complete') {
                Transitions.start('crack', 1.5, '#0B0A12', () => {
                    this.state = 'CHAMBER';
                    Chamber.init();
                    Player.init(1 * 24, 10 * 24);
                    Player.health = Player.maxHealth;
                    Dialog.show([
                        'TRIAL III: The Final Chamber.',
                        'The Sword of Seal is sealed at the center.',
                        'Step on all 3 glowing PRESSURE PLATES and press E.',
                        'The GUARDIAN hunts you. Each plate stuns it briefly.',
                        'Move fast. The floor is crumbling beneath you.'
                    ], null, 'urgent');
                });
            } else if (event.type === 'player_died') {
                this.handlePlayerDeath();
            }
        }
    },

    updateChamber(dt) {
        Player.update(dt, Chamber.map, Chamber.getSolidTiles());
        Camera.follow(Player);
        Camera.clamp(Chamber.map.width * 24, Chamber.map.height * 24);
        Camera.update(dt);

        const event = Chamber.update(dt);
        if (event) {
            if (event.type === 'sword_taken') {
                Dialog.show([
                    'THE SWORD OF SEAL IS YOURS!',
                    'The Below is COLLAPSING — find the exit portal!',
                    'Return to the TOWNHALL and PLACE THE SWORD!'
                ], () => {
                    Transitions.start('crack', 1.5, '#0B0A12', () => {
                        this.state = 'RETURN';
                        Return.init();
                        Player.init(1 * 24, 5 * 24);
                    });
                }, 'urgent');
            } else if (event.type === 'player_died') {
                this.handlePlayerDeath();
            }
        }
    },

    updateReturn(dt) {
        Player.update(dt, Return.map, Return.getSolidTiles());
        Camera.follow(Player);
        Camera.clamp(Return.map.width * 24, Return.map.height * 24);
        Camera.update(dt);

        const event = Return.update(dt);
        if (event) {
            if (event.type === 'return_complete') {
                Transitions.start('fade', 1.5, '#fff', () => {
                    this.state = 'RETURN_SURFACE';
                    this.surfaceReturnMode = true;
                    Surface.prepareForReturn();
                    Player.init(9 * 24, 32 * 24);
                    Player.health = Player.maxHealth;
                    Audio.stopDrone();
                    Audio.startSurfaceAmbience();
                    Dialog.show([
                        'THE SURFACE! You\'re back!',
                        'The Townhall is right here — go inside!',
                        'Walk to the GLOWING PEDESTAL and press E!',
                        'HURRY — time is running out!'
                    ], null, 'urgent');
                });
            } else if (event.type === 'player_died') {
                this.handlePlayerDeath();
            }
        }
    },

    updateReturnSurface(dt) {
        Player.update(dt, Surface.map, Surface.getSolidTiles());
        Camera.follow(Player);
        Camera.clamp(Surface.map.width * 24, Surface.map.height * 24);
        Camera.update(dt);

        const event = Surface.update(dt, this.timer, this.totalTime);
        if (event) {
            if (event.type === 'seal_sword') {
                this.timerActive = false;
                this.changeState('WIN');
                Audio.successSound();
                Audio.stopDrone();
                Menus.winTimer = 0;
                Audio.speak('The seal holds. The town is safe. For now. They will never know what you did tonight.', 'narrator');
            } else if (event.type === 'dialog') {
                Dialog.show(event.lines, null, event.npcType || 'guard');
            }
        }
    },

    changeState(newState) {
        this.state = newState;
    },

    restartGame() {
        this.state = 'TITLE';
        this.timer = this.totalTime;
        this.timerActive = false;
        this.surfaceReturnMode = false;
        this.deathTimer = 0;
        Player.resetFull();
        Menus.reset();
        Particles.clear();
        Audio.stopDrone();
        Audio.stopSpeaking();
    },

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = '#0B0A12';
        ctx.fillRect(0, 0, w, h);

        switch (this.state) {
            case 'TITLE':
                Menus.drawTitle(ctx, w, h, 1 / 60);
                break;

            case 'BRIEFING':
                Menus.drawBriefing(ctx, w, h, this.briefingPhase);
                break;

            case 'SURFACE':
            case 'RETURN_SURFACE':
                Camera.apply(ctx);
                Surface.draw(ctx);
                Player.draw(ctx);
                Particles.draw(ctx);
                Camera.restore(ctx);
                Renderer.drawSurfaceOverlay(ctx, w, h, Surface.degradation);
                HUD.draw(ctx, w, h, this.timer, this.totalTime, Player.keys, 5, Player.health, Player.maxHealth, this.state === 'RETURN_SURFACE' ? 'RETURN_SURFACE' : 'SURFACE', Player.hasSword);
                this._drawInteractPrompts(ctx);
                break;

            case 'PORTAL':
                Portal.draw(ctx, w, h);
                HUD.draw(ctx, w, h, this.timer, this.totalTime, Player.keys, 5, Player.health, Player.maxHealth, 'PORTAL', Player.hasSword);
                break;

            case 'MAZE':
                Camera.apply(ctx);
                Maze.draw(ctx);
                Player.draw(ctx);
                Particles.draw(ctx);
                Camera.restore(ctx);
                Renderer.drawBelowOverlay(ctx, w, h);
                HUD.draw(ctx, w, h, this.timer, this.totalTime, Player.keys, 5, Player.health, Player.maxHealth, 'MAZE', Player.hasSword);
                this._drawMazeTimer(ctx, w);
                break;

            case 'POND':
                Camera.apply(ctx);
                Pond.draw(ctx);
                Player.draw(ctx);
                Particles.draw(ctx);
                Camera.restore(ctx);
                Renderer.drawBelowOverlay(ctx, w, h);
                HUD.draw(ctx, w, h, this.timer, this.totalTime, Player.keys, 5, Player.health, Player.maxHealth, 'POND', Player.hasSword);
                break;

            case 'CHAMBER':
                Camera.apply(ctx);
                Chamber.draw(ctx);
                Player.draw(ctx);
                Particles.draw(ctx);
                Camera.restore(ctx);
                Renderer.drawBelowOverlay(ctx, w, h);
                HUD.draw(ctx, w, h, this.timer, this.totalTime, Player.keys, 5, Player.health, Player.maxHealth, 'CHAMBER', Player.hasSword);
                break;

            case 'RETURN':
                Camera.apply(ctx);
                Return.draw(ctx);
                Player.draw(ctx);
                Particles.draw(ctx);
                Camera.restore(ctx);
                Renderer.drawBelowOverlay(ctx, w, h);
                HUD.draw(ctx, w, h, this.timer, this.totalTime, Player.keys, 5, Player.health, Player.maxHealth, 'RETURN', Player.hasSword);
                break;

            case 'WIN':
                Menus.drawWin(ctx, w, h, 1 / 60);
                break;

            case 'FAIL':
                Menus.drawFail(ctx, w, h, 1 / 60);
                break;
        }

        Dialog.draw(ctx, w, h);
        Transitions.draw(ctx, w, h);
    },

    _drawInteractPrompts(ctx) {
        // Keys
        if (Player.keys < 5) {
            for (let i = 0; i < Surface.keyLocations.length; i++) {
                if (Surface.keysCollected[i]) continue;
                const key = Surface.keyLocations[i];
                const kx = key.tileX * 24;
                const ky = key.tileY * 24;
                const dist = Math.sqrt((Player.x - kx) ** 2 + (Player.y - ky) ** 2);
                if (dist < 40) {
                    HUD.drawInteractPrompt(ctx, kx + 12 - Camera.x, ky - 10 - Camera.y, '[E] Pick up key');
                }
            }
        }

        // Portal
        if (Player.keys >= 5 && !Player.hasSword) {
            const px = Surface.portalLocation.x * 24;
            const py = Surface.portalLocation.y * 24;
            const dist = Math.sqrt((Player.x - px) ** 2 + (Player.y - py) ** 2);
            if (dist < 70) {
                const blink = Math.sin(Date.now() / 200) > 0;
                if (blink) {
                    HUD.drawInteractPrompt(ctx, px + 24 - Camera.x, py - 16 - Camera.y, '>>> [E] OPEN PORTAL <<<');
                }
            }
            // Direction arrow to portal if keys complete
            if (dist > 70) {
                const dx = px - Player.x;
                const dy = py - Player.y;
                const angle = Math.atan2(dy, dx);
                const arrowX = 400 + Math.cos(angle) * 120;
                const arrowY = 300 + Math.sin(angle) * 100;
                const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
                ctx.globalAlpha = pulse;
                ctx.fillStyle = '#8B5CF6';
                ctx.save();
                ctx.translate(arrowX, arrowY);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(15, 0);
                ctx.lineTo(-8, -10);
                ctx.lineTo(-8, 10);
                ctx.fill();
                ctx.restore();
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('PORTAL', arrowX, arrowY - 18);
                ctx.globalAlpha = 1;
            }
        }

        // Sword placement
        if (Player.hasSword) {
            const sx = 9 * 24;
            const sy = 26 * 24;
            const dist = Math.sqrt((Player.x - sx) ** 2 + (Player.y - sy) ** 2);
            if (dist < 60) {
                const blink = Math.sin(Date.now() / 200) > 0;
                if (blink) {
                    HUD.drawInteractPrompt(ctx, sx + 12 - Camera.x, sy - 16 - Camera.y, '>>> [E] PLACE SWORD <<<');
                }
            }
        }

        // NPC prompts
        for (const npc of Surface.npcs) {
            if (npc.isNearPlayer(Player, 40)) {
                HUD.drawInteractPrompt(ctx, npc.x + 10 - Camera.x, npc.y - 15 - Camera.y, '[E] Talk');
            }
        }
    },

    _drawMazeTimer(ctx, w) {
        const progress = Maze.shiftTimer / Maze.shiftInterval;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(w / 2 - 70, 48, 140, 18);
        ctx.fillStyle = progress > 0.3 ? '#6D28D9' : '#EF4444';
        ctx.fillRect(w / 2 - 66, 52, 132 * progress, 10);
        ctx.fillStyle = '#D1D5DB';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WALLS SHIFT', w / 2, 46);
    },
};

window.addEventListener('load', () => Game.init());
