// ── Surface World — Detailed Village ──
const Surface = {
    map: null,
    npcs: [],
    keyLocations: [],
    keysCollected: [],
    portalLocation: { x: 30, y: 25 },
    townhallDoor: { x: 8, y: 30 },
    playerStart: { x: 8, y: 32 },
    degradation: 0,
    interactables: [],
    returnMode: false,

    init() {
        this.map = createTileMap(60, 50);
        this.buildVillage();
        this.placeKeys();
        this.spawnNPCs();
        this.degradation = 0;
        this.keysCollected = [false, false, false, false, false];
        this.returnMode = false;
    },

    prepareForReturn() {
        this.returnMode = true;
        for (const npc of this.npcs) {
            npc.dialogShown = false;
        }
        if (this.npcs[0]) this.npcs[0].dialog = ['The ground is SHAKING!', 'What have you done?!'];
        if (this.npcs[1]) this.npcs[1].dialog = ['Agent! Something terrible is happening!'];
        if (this.npcs[5]) this.npcs[5].dialog = ['AGENT! THE SEAL! THE TOWNHALL! NOW!!'];

        setTile(this.map, 8, 30, 5);
        setTile(this.map, 9, 30, 5);
        setTile(this.map, 10, 30, 5);
        setTile(this.map, 8, 26, 15);
        setTile(this.map, 10, 26, 15);
        setTile(this.map, 9, 25, 15);
        setTile(this.map, 9, 27, 15);
        setTile(this.map, 9, 26, 13);
    },

    buildVillage() {
        const m = this.map;
        // Fill everything with grass
        fillRect(m, 0, 0, 60, 50, 0);
        // Border walls
        drawRect(m, 0, 0, 60, 50, 1);

        // ═══ ROAD NETWORK ═══
        // Main east-west road
        fillRect(m, 1, 20, 58, 2, 2);
        // Main north-south road
        fillRect(m, 28, 1, 2, 48, 2);
        // Side roads
        fillRect(m, 1, 35, 58, 2, 2);
        fillRect(m, 12, 1, 2, 48, 2);
        fillRect(m, 45, 1, 2, 48, 2);
        // Small paths
        fillRect(m, 6, 28, 1, 7, 2);
        fillRect(m, 7, 28, 5, 1, 2);
        fillRect(m, 35, 10, 8, 1, 2);
        fillRect(m, 18, 38, 10, 1, 2);

        // ═══ TOWNHALL (large building, left side) ═══
        fillRect(m, 4, 23, 14, 10, 4);
        fillRect(m, 4, 22, 14, 2, 7);
        fillRect(m, 5, 24, 12, 8, 15);
        // Wide entrance
        setTile(m, 8, 30, 5);
        setTile(m, 9, 30, 5);
        setTile(m, 10, 30, 5);
        // Windows
        setTile(m, 6, 25, 6);
        setTile(m, 14, 25, 6);
        setTile(m, 6, 28, 6);
        setTile(m, 14, 28, 6);
        // Seal pedestal (center of Townhall)
        setTile(m, 9, 26, 13);
        // Clear around pedestal
        setTile(m, 8, 26, 15);
        setTile(m, 10, 26, 15);
        setTile(m, 9, 25, 15);
        setTile(m, 9, 27, 15);
        this.townhallDoor = { x: 9, y: 30 };
        this.playerStart = { x: 9 * 24, y: 32 * 24 };
        // Lamp posts outside
        setTile(m, 5, 31, 21);
        setTile(m, 13, 31, 21);

        // ═══ MARKET SQUARE (center) ═══
        fillRect(m, 24, 14, 10, 6, 2);
        // Market stalls
        fillRect(m, 25, 15, 3, 3, 4);
        fillRect(m, 26, 15, 1, 2, 15);
        setTile(m, 26, 17, 5);
        fillRect(m, 30, 15, 3, 3, 4);
        fillRect(m, 31, 15, 1, 2, 15);
        setTile(m, 31, 17, 5);
        // Well in market center
        setTile(m, 28, 16, 22);
        // Lamp posts around market
        setTile(m, 24, 14, 21);
        setTile(m, 33, 14, 21);
        setTile(m, 24, 19, 21);

        // ═══ CLOCKTOWER (landmark, center-top) ═══
        fillRect(m, 26, 3, 6, 8, 4);
        fillRect(m, 26, 2, 6, 2, 7);
        fillRect(m, 27, 4, 4, 6, 15);
        setTile(m, 28, 10, 5);
        setTile(m, 28, 5, 6);
        setTile(m, 30, 5, 6);
        // Clock detail
        setTile(m, 29, 3, 6);

        // ═══ CHURCH (bottom-right) ═══
        fillRect(m, 38, 24, 10, 10, 4);
        fillRect(m, 38, 23, 10, 2, 7);
        fillRect(m, 39, 25, 8, 8, 15);
        setTile(m, 42, 33, 5);
        setTile(m, 43, 33, 5);
        setTile(m, 40, 26, 6);
        setTile(m, 45, 26, 6);
        setTile(m, 40, 30, 6);
        setTile(m, 45, 30, 6);
        // Cross on roof
        setTile(m, 42, 22, 24);

        // ═══ HOUSES (many scattered) ═══

        // House 1 — North-west cottage
        fillRect(m, 3, 5, 6, 5, 4);
        fillRect(m, 3, 4, 6, 2, 7);
        fillRect(m, 4, 6, 4, 3, 15);
        setTile(m, 5, 9, 5);
        setTile(m, 4, 6, 6);
        setTile(m, 7, 6, 6);

        // House 2 — North of main road
        fillRect(m, 15, 10, 6, 5, 4);
        fillRect(m, 15, 9, 6, 2, 7);
        fillRect(m, 16, 11, 4, 3, 15);
        setTile(m, 17, 14, 5);
        setTile(m, 16, 11, 6);

        // House 3 — Bakery near market
        fillRect(m, 20, 15, 4, 5, 4);
        fillRect(m, 20, 14, 4, 2, 7);
        fillRect(m, 21, 16, 2, 3, 15);
        setTile(m, 21, 19, 5);
        setTile(m, 22, 16, 6);

        // House 4 — Large house right
        fillRect(m, 48, 5, 7, 6, 4);
        fillRect(m, 48, 4, 7, 2, 7);
        fillRect(m, 49, 6, 5, 4, 15);
        setTile(m, 51, 10, 5);
        setTile(m, 49, 6, 6);
        setTile(m, 53, 6, 6);

        // House 5 — South cottage
        fillRect(m, 15, 38, 5, 5, 4);
        fillRect(m, 15, 37, 5, 2, 7);
        fillRect(m, 16, 39, 3, 3, 15);
        setTile(m, 17, 42, 5);
        setTile(m, 16, 39, 6);

        // House 6 — Fisherman cottage near water
        fillRect(m, 50, 38, 5, 5, 4);
        fillRect(m, 50, 37, 5, 2, 7);
        fillRect(m, 51, 39, 3, 3, 15);
        setTile(m, 52, 42, 5);
        setTile(m, 51, 39, 6);

        // House 7 — Herbalist near park
        fillRect(m, 3, 38, 5, 5, 4);
        fillRect(m, 3, 37, 5, 2, 7);
        fillRect(m, 4, 39, 3, 3, 15);
        setTile(m, 5, 42, 5);

        // House 8 — Blacksmith
        fillRect(m, 35, 5, 6, 5, 4);
        fillRect(m, 35, 4, 6, 2, 7);
        fillRect(m, 36, 6, 4, 3, 15);
        setTile(m, 37, 9, 5);
        setTile(m, 36, 6, 6);
        setTile(m, 39, 6, 6);

        // House 9 — South-east
        fillRect(m, 48, 24, 6, 5, 4);
        fillRect(m, 48, 23, 6, 2, 7);
        fillRect(m, 49, 25, 4, 3, 15);
        setTile(m, 50, 28, 5);
        setTile(m, 49, 25, 6);

        // House 10 — Near clocktower
        fillRect(m, 20, 3, 5, 5, 4);
        fillRect(m, 20, 2, 5, 2, 7);
        fillRect(m, 21, 4, 3, 3, 15);
        setTile(m, 22, 7, 5);
        setTile(m, 21, 4, 6);

        // ═══ WATER FEATURES ═══
        // River flowing east (middle-bottom)
        fillRect(m, 1, 44, 58, 3, 3);
        // Bridges over river
        fillRect(m, 12, 44, 2, 3, 25);
        fillRect(m, 28, 44, 2, 3, 25);
        fillRect(m, 45, 44, 2, 3, 25);
        // Small pond in park
        fillRect(m, 32, 40, 4, 3, 3);
        // Well by church
        setTile(m, 36, 28, 22);

        // ═══ PARK (center-south) ═══
        fillRect(m, 30, 37, 10, 8, 0);
        // Flower beds
        setTile(m, 31, 38, 8);
        setTile(m, 33, 39, 8);
        setTile(m, 35, 38, 8);
        setTile(m, 37, 39, 8);
        setTile(m, 32, 41, 8);
        setTile(m, 36, 41, 8);
        setTile(m, 38, 38, 8);
        // Bench (decorative)
        setTile(m, 34, 42, 24);

        // ═══ TREES — Scattered throughout ═══
        // Forest border (north)
        for (let x = 1; x < 12; x += 2) setTile(m, x, 1, 18);
        for (let x = 33; x < 45; x += 2) setTile(m, x, 1, 18);
        for (let x = 47; x < 58; x += 2) setTile(m, x, 1, 18);
        for (let x = 1; x < 12; x += 3) setTile(m, x, 2, 18);

        // Forest border (south, below river)
        for (let x = 1; x < 58; x += 2) setTile(m, x, 48, 18);

        // Trees along roads
        setTile(m, 10, 18, 18);
        setTile(m, 16, 18, 18);
        setTile(m, 22, 18, 18);
        setTile(m, 34, 18, 18);
        setTile(m, 40, 18, 18);
        setTile(m, 50, 18, 18);

        // Scattered grove (east side)
        setTile(m, 55, 8, 18);
        setTile(m, 57, 10, 18);
        setTile(m, 56, 12, 18);
        setTile(m, 58, 7, 18);
        setTile(m, 53, 14, 18);

        // Trees near buildings
        setTile(m, 2, 10, 18);
        setTile(m, 2, 14, 18);
        setTile(m, 10, 5, 18);
        setTile(m, 10, 8, 18);
        setTile(m, 24, 5, 18);
        setTile(m, 44, 12, 18);
        setTile(m, 56, 30, 18);
        setTile(m, 2, 32, 18);
        setTile(m, 2, 44, 18);

        // Park trees
        setTile(m, 30, 37, 18);
        setTile(m, 39, 37, 18);
        setTile(m, 30, 43, 18);
        setTile(m, 39, 43, 18);

        // ═══ BUSHES — Many scattered ═══
        setTile(m, 3, 12, 19);
        setTile(m, 5, 15, 19);
        setTile(m, 8, 3, 19);
        setTile(m, 11, 14, 19);
        setTile(m, 14, 7, 19);
        setTile(m, 18, 5, 19);
        setTile(m, 33, 8, 19);
        setTile(m, 42, 5, 19);
        setTile(m, 55, 15, 19);
        setTile(m, 50, 20, 19);
        setTile(m, 43, 30, 19);
        setTile(m, 25, 32, 19);
        setTile(m, 20, 42, 19);
        setTile(m, 48, 42, 19);
        setTile(m, 55, 25, 19);
        setTile(m, 7, 44, 19);
        setTile(m, 22, 10, 19);
        setTile(m, 44, 20, 19);
        setTile(m, 38, 42, 19);

        // ═══ FENCES ═══
        // Fence around Townhall garden
        fillRect(m, 3, 32, 15, 1, 20);
        setTile(m, 8, 32, 0); setTile(m, 9, 32, 0); setTile(m, 10, 32, 0); // gate

        // Fence near church
        fillRect(m, 37, 34, 12, 1, 20);
        setTile(m, 42, 34, 0); setTile(m, 43, 34, 0); // gate

        // Farm fence (right side)
        fillRect(m, 48, 14, 1, 8, 20);
        fillRect(m, 48, 14, 8, 1, 20);
        fillRect(m, 55, 14, 1, 8, 20);

        // ═══ TALL GRASS ═══
        setTile(m, 4, 14, 23);
        setTile(m, 6, 16, 23);
        setTile(m, 15, 4, 23);
        setTile(m, 42, 8, 23);
        setTile(m, 50, 32, 23);
        setTile(m, 56, 18, 23);
        setTile(m, 25, 42, 23);
        setTile(m, 3, 33, 23);
        setTile(m, 57, 35, 23);
        setTile(m, 10, 42, 23);
        setTile(m, 40, 42, 23);

        // ═══ LAMP POSTS ═══
        setTile(m, 12, 18, 21);
        setTile(m, 28, 13, 21);
        setTile(m, 45, 18, 21);
        setTile(m, 12, 33, 21);
        setTile(m, 28, 33, 21);
        setTile(m, 45, 33, 21);
        setTile(m, 20, 20, 21);

        // ═══ STONES / ROCKS ═══
        setTile(m, 8, 16, 24);
        setTile(m, 40, 10, 24);
        setTile(m, 52, 35, 24);
        setTile(m, 25, 8, 24);

        // ═══ FLOWERS (many!) ═══
        setTile(m, 7, 12, 8);
        setTile(m, 16, 8, 8);
        setTile(m, 23, 12, 8);
        setTile(m, 34, 6, 8);
        setTile(m, 43, 15, 8);
        setTile(m, 53, 20, 8);
        setTile(m, 18, 32, 8);
        setTile(m, 42, 36, 8);
        setTile(m, 26, 40, 8);
        setTile(m, 8, 40, 8);
        setTile(m, 55, 40, 8);
        setTile(m, 3, 20, 8);
        setTile(m, 56, 20, 8);

        // ═══ PORTAL LOCATION ═══
        this.portalLocation = { x: 30, y: 25 };
        fillRect(m, 29, 24, 4, 4, 2);
        setTile(m, 30, 25, 9);
        setTile(m, 31, 25, 9);
        setTile(m, 30, 26, 9);
        setTile(m, 31, 26, 9);
    },

    placeKeys() {
        this.keyLocations = [
            { x: 22, y: 7, tileX: 22, tileY: 7, hint: 'A faint shimmer near the clocktower...', found: false },
            { x: 50, y: 8, tileX: 50, tileY: 8, hint: 'Something hidden in the eastern house...', found: false },
            { x: 44, y: 28, tileX: 44, tileY: 28, hint: 'A strange glow behind the church...', found: false },
            { x: 5, y: 40, tileX: 5, tileY: 40, hint: 'Something glints near the herbalist hut...', found: false },
            { x: 35, y: 42, tileX: 35, tileY: 42, hint: 'A loose stone in the park...', found: false },
        ];

        for (const key of this.keyLocations) {
            setTile(this.map, key.tileX, key.tileY, 10);
        }
    },

    spawnNPCs() {
        this.npcs = [
            new NPC(14 * 24, 20 * 24, 'villager',
                ['Beautiful day in the village!', '...Though the ground trembled this morning.'],
                [{ x: 14 * 24, y: 20 * 24 }, { x: 20 * 24, y: 20 * 24 }]
            ),
            new NPC(26 * 24, 17 * 24, 'merchant',
                ['Welcome to the market!', 'Found something strange buried under a crate...', 'Take it. I don\'t want anything to do with it.'],
                [{ x: 26 * 24, y: 17 * 24 }, { x: 31 * 24, y: 17 * 24 }]
            ),
            new NPC(42 * 24, 28 * 24, 'elder',
                ['The old stories speak of what lies beneath...', 'A mirror world that breeds catastrophes.', 'I pray you know what you\'re doing, Agent.'],
                [{ x: 42 * 24, y: 28 * 24 }, { x: 42 * 24, y: 32 * 24 }]
            ),
            new NPC(34 * 24, 39 * 24, 'child',
                ['I saw something shiny by the flowers!', 'Also... my dog keeps staring at the ground. Scary.'],
                [{ x: 34 * 24, y: 39 * 24 }, { x: 37 * 24, y: 39 * 24 }]
            ),
            new NPC(37 * 24, 7 * 24, 'merchant',
                ['The blacksmith forge runs hot today.', 'But the metal sings wrong. Something\'s off.'],
                [{ x: 37 * 24, y: 7 * 24 }, { x: 39 * 24, y: 7 * 24 }]
            ),
            new NPC(9 * 24, 31 * 24, 'guard',
                ['Agent. The Townhall awaits your report.', 'The seal pedestal is inside. Find the keys. Time is NOT our friend.'],
                [{ x: 9 * 24, y: 31 * 24 }, { x: 7 * 24, y: 31 * 24 }]
            ),
            new NPC(52 * 24, 40 * 24, 'villager',
                ['The fish aren\'t biting today.', 'The river feels... wrong somehow.'],
                [{ x: 52 * 24, y: 40 * 24 }, { x: 52 * 24, y: 42 * 24 }]
            ),
            new NPC(5 * 24, 40 * 24, 'elder',
                ['These herbs grow differently when the ground stirs.', 'The roots know before we do.'],
                [{ x: 5 * 24, y: 40 * 24 }, { x: 5 * 24, y: 42 * 24 }]
            ),
        ];
    },

    update(dt, gameTimer, totalTime) {
        this.degradation = 1 - (gameTimer / totalTime);

        for (const npc of this.npcs) {
            npc.unease = this.degradation;
            npc.update(dt);
        }

        // Sword placement (highest priority)
        if (Player.hasSword) {
            const sx = 9 * 24;
            const sy = 26 * 24;
            const dist = Math.sqrt((Player.x - sx) ** 2 + (Player.y - sy) ** 2);
            if (dist < 48 && Input.interact) {
                return { type: 'seal_sword' };
            }
        }

        // Key collection
        if (!this.returnMode) {
            for (let i = 0; i < this.keyLocations.length; i++) {
                if (this.keysCollected[i]) continue;
                const key = this.keyLocations[i];
                const kx = key.tileX * 24;
                const ky = key.tileY * 24;
                const dist = Math.sqrt((Player.x - kx) ** 2 + (Player.y - ky) ** 2);

                if (dist < 36 && Input.interact) {
                    this.keysCollected[i] = true;
                    Player.keys++;
                    Audio.keyPickup();
                    Particles.keyPickup(kx + 12, ky + 12);
                    setTile(this.map, key.tileX, key.tileY, 0);
                    if (Player.keys >= 5) {
                        return { type: 'key', index: i, hint: 'ALL 5 KEYS FOUND! The PORTAL in the town square is now active! Go to the glowing purple area and press E!' };
                    }
                    return { type: 'key', index: i, hint: key.hint };
                }
            }
        }

        // NPC interaction
        for (const npc of this.npcs) {
            const near = npc.isNearPlayer(Player, 40);
            npc.showIndicator = near;

            if (near && Input.interact && !npc.dialogShown) {
                npc.dialogShown = true;
                Audio.interact();
                return { type: 'dialog', lines: npc.dialog, npcType: npc.type };
            }
        }

        // Portal — AUTO-TRIGGER when player walks on it with 5 keys
        if (Player.keys >= 5 && !Player.hasSword) {
            const px = this.portalLocation.x * 24;
            const py = this.portalLocation.y * 24;
            const dist = Math.sqrt((Player.x - px) ** 2 + (Player.y - py) ** 2);
            // Auto-enter portal when walking close (no E press needed!)
            if (dist < 48) {
                return { type: 'portal' };
            }
        }

        return null;
    },

    draw(ctx) {
        Renderer.drawMap(ctx, this.map, false);

        // Portal glow
        if (Player.keys >= 5 && !Player.hasSword) {
            const px = this.portalLocation.x * 24;
            const py = this.portalLocation.y * 24;
            ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 300) * 0.2;
            ctx.fillStyle = '#8B5CF6';
            ctx.fillRect(px - 4, py - 4, 24 * 2 + 8, 24 * 2 + 8);
            ctx.globalAlpha = 1;
        }

        // NPCs
        for (const npc of this.npcs) {
            npc.draw(ctx);
        }

        // Sword beacon
        if (Player.hasSword) {
            const sx = 9 * 24;
            const sy = 26 * 24;
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.5;

            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#FCD34D';
            ctx.fillRect(sx - 8, sy - 8, 40, 40);
            ctx.globalAlpha = pulse * 0.3;
            ctx.fillRect(sx - 16, sy - 16, 56, 56);
            ctx.globalAlpha = 1;

            // Arrow
            ctx.fillStyle = '#FCD34D';
            const bob = Math.sin(Date.now() / 300) * 4;
            ctx.beginPath();
            ctx.moveTo(sx + 12, sy - 20 + bob);
            ctx.lineTo(sx + 4, sy - 28 + bob);
            ctx.lineTo(sx + 20, sy - 28 + bob);
            ctx.fill();
        }
    },

    getSolidTiles() {
        return [1, 3, 4, 6, 7, 18, 20, 22];
    }
};
