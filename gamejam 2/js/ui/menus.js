// ── Menus & Screens ──
const Menus = {
    titleTimer: 0,
    selectedOption: 0,
    failTimer: 0,
    winTimer: 0,
    failReason: 'time', // 'time' or 'death'
    images: {},
    imagesLoaded: false,

    loadImages() {
        if (this.imagesLoaded) return;
        const imgs = ['briefing_town', 'briefing_portal', 'briefing_sword'];
        for (const name of imgs) {
            const img = new Image();
            img.src = `assets/${name}.png`;
            this.images[name] = img;
        }
        this.imagesLoaded = true;
    },

    // ── Title Screen ──
    drawTitle(ctx, w, h, dt) {
        this.loadImages();
        this.titleTimer += dt;
        ctx.fillStyle = '#050409';
        ctx.fillRect(0, 0, w, h);

        // Animated grid
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 24) {
            const offset = Math.sin(this.titleTimer + i * 0.01) * 5;
            ctx.beginPath();
            ctx.moveTo(i, h / 2 + offset);
            ctx.lineTo(i, h);
            ctx.stroke();
        }
        for (let j = Math.floor(h / 2); j < h; j += 24) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(w, j);
            ctx.stroke();
        }

        // Town silhouette (top half)
        const buildings = [
            { x: 60, w: 50, h: 70 },
            { x: 130, w: 35, h: 90 },
            { x: 180, w: 70, h: 60 },
            { x: 270, w: 40, h: 110 },
            { x: 330, w: 60, h: 80 },
            { x: 410, w: 75, h: 95 },
            { x: 500, w: 45, h: 70 },
            { x: 560, w: 65, h: 105 },
            { x: 640, w: 55, h: 75 },
            { x: 710, w: 40, h: 85 },
        ];

        // Surface buildings (warm)
        for (const b of buildings) {
            ctx.fillStyle = '#1C1917';
            ctx.fillRect(b.x, h / 2 - b.h, b.w, b.h);
            // Warm windows
            ctx.fillStyle = '#FCD34D';
            for (let wy = 15; wy < b.h - 10; wy += 18) {
                ctx.globalAlpha = 0.5 + Math.sin(this.titleTimer * 2 + b.x + wy) * 0.3;
                ctx.fillRect(b.x + 6, h / 2 - b.h + wy, 5, 5);
                if (b.w > 40) ctx.fillRect(b.x + b.w - 11, h / 2 - b.h + wy, 5, 5);
            }
            ctx.globalAlpha = 1;
        }

        // Ground line
        ctx.fillStyle = '#312E81';
        ctx.fillRect(0, h / 2 - 2, w, 4);

        // Mirror below (distorted)
        ctx.globalAlpha = 0.25;
        for (const b of buildings) {
            const distort = Math.sin(this.titleTimer * 0.5 + b.x * 0.01) * 5;
            ctx.fillStyle = '#1E1B4B';
            ctx.fillRect(b.x + distort, h / 2, b.w, b.h * 0.6);
        }
        ctx.globalAlpha = 1;

        // Crack line
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#8B5CF6';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 10) {
            const crack = Math.sin(x * 0.05 + this.titleTimer) * 3;
            ctx.lineTo(x, h / 2 + crack);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Title with glow
        ctx.shadowColor = '#8B5CF6';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#F5F5F5';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BENEATH', w / 2, h / 2 - 150);
        ctx.fillText('THE SURFACE', w / 2, h / 2 - 100);
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.globalAlpha = 0.5 + Math.sin(this.titleTimer * 2) * 0.3;
        ctx.fillStyle = '#A78BFA';
        ctx.font = 'italic 14px monospace';
        ctx.fillText('"Every disaster leaves a warning. Most people never see it."', w / 2, h / 2 - 65);
        ctx.globalAlpha = 1;

        // Genre tag
        ctx.fillStyle = '#6B7280';
        ctx.font = '11px monospace';
        ctx.fillText('2D Top-Down Adventure / Puzzle-Survival', w / 2, h / 2 - 45);

        // Start prompt
        const blink = Math.sin(this.titleTimer * 3) > 0;
        if (blink) {
            ctx.fillStyle = '#FCD34D';
            ctx.font = 'bold 18px monospace';
            ctx.fillText('[ Press ENTER or SPACE to begin ]', w / 2, h - 60);
        }

        // Credits
        ctx.fillStyle = '#374151';
        ctx.font = '10px monospace';
        ctx.fillText('Game Jam Edition • 7 Minutes of Tension', w / 2, h - 30);
    },

    // ── Briefing Screen with AI Art ──
    drawBriefing(ctx, w, h, phase) {
        ctx.fillStyle = '#050409';
        ctx.fillRect(0, 0, w, h);

        // Three-phase cinematic briefing
        if (phase < 7) {
            // Phase 1: The Town
            const img = this.images['briefing_town'];
            if (img && img.complete) {
                const imgAlpha = Math.min(1, phase / 2);
                ctx.globalAlpha = imgAlpha * 0.6;
                // Draw centered and cropped
                const aspect = img.width / img.height;
                const drawW = w;
                const drawH = w / aspect;
                ctx.drawImage(img, 0, (h - drawH) / 2, drawW, drawH);
                ctx.globalAlpha = 1;
            }
            // Overlay text
            const textAlpha = Math.min(1, Math.max(0, phase - 0.5));
            ctx.globalAlpha = textAlpha;
            // Dark gradient at bottom
            const grad = ctx.createLinearGradient(0, h * 0.5, 0, h);
            grad.addColorStop(0, 'rgba(5,4,9,0)');
            grad.addColorStop(1, 'rgba(5,4,9,1)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#FCD34D';
            ctx.font = 'bold 22px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Agent.', w / 2, h * 0.55);

            if (phase > 2) {
                ctx.fillStyle = '#D1D5DB';
                ctx.font = '14px monospace';
                ctx.fillText('Something stirs beneath this town.', w / 2, h * 0.63);
            }
            if (phase > 3.5) {
                ctx.fillText('A breach in the dimensional fault is widening.', w / 2, h * 0.70);
            }
            if (phase > 5) {
                ctx.fillStyle = '#EF4444';
                ctx.font = 'bold 14px monospace';
                ctx.fillText('If it reaches the surface, the town will not survive.', w / 2, h * 0.77);
            }
            ctx.globalAlpha = 1;

        } else if (phase < 14) {
            // Phase 2: The Portal & Keys
            const img = this.images['briefing_portal'];
            if (img && img.complete) {
                const imgAlpha = Math.min(1, (phase - 7) / 1.5);
                ctx.globalAlpha = imgAlpha * 0.5;
                const aspect = img.width / img.height;
                const drawW = w;
                const drawH = w / aspect;
                ctx.drawImage(img, 0, (h - drawH) / 2, drawW, drawH);
                ctx.globalAlpha = 1;
            }

            const grad = ctx.createLinearGradient(0, h * 0.4, 0, h);
            grad.addColorStop(0, 'rgba(5,4,9,0.3)');
            grad.addColorStop(1, 'rgba(5,4,9,1)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const tp = phase - 7;
            ctx.textAlign = 'center';
            if (tp > 0.5) {
                ctx.fillStyle = '#FCD34D';
                ctx.font = 'bold 16px monospace';
                ctx.fillText('YOUR MISSION:', w / 2, h * 0.50);
            }
            if (tp > 2) {
                ctx.fillStyle = '#D1D5DB';
                ctx.font = '14px monospace';
                ctx.fillText('Find 5 Dimensional Keys hidden in the town.', w / 2, h * 0.58);
            }
            if (tp > 3.5) {
                ctx.fillText('Use them to open the portal to The Below.', w / 2, h * 0.65);
            }
            if (tp > 5) {
                ctx.fillText('Navigate three deadly trials.', w / 2, h * 0.72);
            }
            if (tp > 6) {
                ctx.fillStyle = '#FCD34D';
                ctx.fillText('Retrieve the Sword of Seal.', w / 2, h * 0.79);
            }

        } else {
            // Phase 3: The Sword
            const img = this.images['briefing_sword'];
            if (img && img.complete) {
                const imgAlpha = Math.min(1, (phase - 14) / 1.5);
                ctx.globalAlpha = imgAlpha * 0.5;
                const aspect = img.width / img.height;
                const drawW = w;
                const drawH = w / aspect;
                ctx.drawImage(img, 0, (h - drawH) / 2, drawW, drawH);
                ctx.globalAlpha = 1;
            }

            const grad = ctx.createLinearGradient(0, h * 0.4, 0, h);
            grad.addColorStop(0, 'rgba(5,4,9,0.3)');
            grad.addColorStop(1, 'rgba(5,4,9,1)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const tp = phase - 14;
            ctx.textAlign = 'center';
            if (tp > 0.5) {
                ctx.fillStyle = '#D1D5DB';
                ctx.font = '14px monospace';
                ctx.fillText('Return the Sword to the Townhall before time runs out.', w / 2, h * 0.55);
            }
            if (tp > 2) {
                ctx.fillStyle = '#9CA3AF';
                ctx.font = 'italic 13px monospace';
                ctx.fillText('The town doesn\'t know what you\'re about to do.', w / 2, h * 0.64);
            }
            if (tp > 3) {
                ctx.fillText('They never will.', w / 2, h * 0.71);
            }
            if (tp > 4) {
                ctx.fillStyle = '#FCD34D';
                ctx.font = 'bold 16px monospace';
                ctx.fillText('Good luck, Agent.', w / 2, h * 0.80);
            }

            // Continue prompt
            if (tp > 4) {
                const blink = Math.sin(Date.now() / 300) > 0;
                if (blink) {
                    ctx.fillStyle = '#A78BFA';
                    ctx.font = '14px monospace';
                    ctx.fillText('[ Press SPACE to accept mission ]', w / 2, h - 40);
                }
            }
        }

        return 18;
    },

    // ── Win Screen ──
    drawWin(ctx, w, h, dt) {
        this.winTimer += dt;
        ctx.fillStyle = '#050409';
        ctx.fillRect(0, 0, w, h);

        const fade = Math.min(1, this.winTimer / 2);
        ctx.globalAlpha = fade;

        // Night sky with stars
        ctx.fillStyle = '#0A1628';
        ctx.fillRect(0, 0, w, h * 0.55);

        // Stars
        for (let i = 0; i < 40; i++) {
            const sx = (i * 97 + 23) % w;
            const sy = (i * 67 + 11) % (h * 0.5);
            const twinkle = Math.sin(this.winTimer * 2 + i) * 0.3 + 0.7;
            ctx.globalAlpha = fade * twinkle;
            ctx.fillStyle = '#FFF';
            ctx.fillRect(sx, sy, 2, 2);
        }
        ctx.globalAlpha = fade;

        // Moon
        ctx.fillStyle = '#FCD34D';
        ctx.globalAlpha = fade * 0.6;
        ctx.beginPath();
        ctx.arc(w * 0.8, 60, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = fade;

        // Ground
        ctx.fillStyle = '#16A34A';
        ctx.fillRect(0, h * 0.55, w, h * 0.05);
        ctx.fillStyle = '#92400E';
        ctx.fillRect(0, h * 0.6, w, h * 0.4);

        // Town buildings (warm and safe again)
        const blds = [
            { x: 80, w: 55, h: 70 },
            { x: 160, w: 65, h: 85 },
            { x: 260, w: 50, h: 65 },
            { x: 340, w: 75, h: 95 },
            { x: 450, w: 60, h: 80 },
            { x: 540, w: 50, h: 70 },
            { x: 620, w: 70, h: 90 },
            { x: 720, w: 45, h: 60 },
        ];
        for (const b of blds) {
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(b.x, h * 0.55 - b.h, b.w, b.h);
            // Roofs
            ctx.fillStyle = '#DC2626';
            ctx.fillRect(b.x - 3, h * 0.55 - b.h - 8, b.w + 6, 10);
            // Windows
            ctx.fillStyle = '#FCD34D';
            for (let wy = 15; wy < b.h - 15; wy += 18) {
                ctx.globalAlpha = fade * (0.5 + Math.sin(this.winTimer + b.x + wy) * 0.3);
                ctx.fillRect(b.x + 8, h * 0.55 - b.h + wy, 6, 6);
                if (b.w > 45) ctx.fillRect(b.x + b.w - 14, h * 0.55 - b.h + wy, 6, 6);
            }
            ctx.globalAlpha = fade;
        }

        // Text
        if (this.winTimer > 3) {
            ctx.shadowColor = '#FCD34D';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#F5F5F5';
            ctx.font = 'bold 32px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('The seal holds.', w / 2, 80);
            ctx.shadowBlur = 0;
        }
        if (this.winTimer > 5) {
            ctx.fillStyle = '#D1D5DB';
            ctx.font = '16px monospace';
            ctx.fillText('The town is safe. For now.', w / 2, 120);
        }
        if (this.winTimer > 7) {
            ctx.fillStyle = '#9CA3AF';
            ctx.font = 'italic 13px monospace';
            ctx.fillText('They will never know what you did tonight.', w / 2, 155);
            ctx.fillText('That is the price of being the Agent.', w / 2, 175);
        }

        // Crack hint
        if (this.winTimer > 9) {
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = '#8B5CF6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w / 2 - 25, h * 0.58);
            ctx.lineTo(w / 2 - 5, h * 0.63);
            ctx.lineTo(w / 2 + 20, h * 0.61);
            ctx.stroke();
            ctx.globalAlpha = fade;
        }

        if (this.winTimer > 11) {
            const blink = Math.sin(this.winTimer * 3) > 0;
            if (blink) {
                ctx.fillStyle = '#A78BFA';
                ctx.font = '14px monospace';
                ctx.fillText('[ Press SPACE to return to title ]', w / 2, h - 35);
            }
        }

        ctx.globalAlpha = 1;
    },

    // ── Fail Screen ──
    drawFail(ctx, w, h, dt) {
        this.failTimer += dt;

        // Phase 1: Screen cracks
        if (this.failTimer < 2) {
            ctx.fillStyle = '#050409';
            ctx.fillRect(0, 0, w, h);

            const progress = this.failTimer / 2;
            ctx.strokeStyle = '#8B5CF6';
            ctx.lineWidth = 2 + progress * 4;
            ctx.shadowColor = '#8B5CF6';
            ctx.shadowBlur = 10;
            for (let i = 0; i < 10; i++) {
                const sx = (i + 1) * w / 11;
                ctx.beginPath();
                ctx.moveTo(sx, h);
                const crackH = h * progress;
                let cx = sx;
                for (let y = h; y > h - crackH; y -= 15) {
                    cx += (Math.sin(i * 3 + y * 0.1) * 15);
                    ctx.lineTo(cx, y);
                }
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            Camera.shake(progress * 8, 0.1);
        }

        // Phase 2: Town lights out
        if (this.failTimer >= 2 && this.failTimer < 5) {
            ctx.fillStyle = '#050409';
            ctx.fillRect(0, 0, w, h);

            const phase = (this.failTimer - 2) / 3;
            ctx.fillStyle = '#1E1B4B';
            const blds = [
                { x: 60, w: 55, h: 75 },
                { x: 140, w: 40, h: 95 },
                { x: 210, w: 75, h: 65 },
                { x: 310, w: 45, h: 115 },
                { x: 390, w: 65, h: 85 },
                { x: 480, w: 55, h: 70 },
                { x: 560, w: 40, h: 105 },
                { x: 640, w: 60, h: 80 },
            ];
            for (const b of blds) {
                ctx.fillRect(b.x, h / 2 - b.h, b.w, b.h);
            }

            // Lights flicker out left to right
            for (let i = 0; i < blds.length; i++) {
                const b = blds[i];
                const lightPhase = i / blds.length;
                if (lightPhase > phase) {
                    ctx.fillStyle = '#FCD34D';
                    ctx.globalAlpha = 0.5 * Math.random();
                    ctx.fillRect(b.x + 8, h / 2 - b.h + 12, 5, 5);
                    if (b.w > 45) ctx.fillRect(b.x + b.w - 13, h / 2 - b.h + 12, 5, 5);
                    ctx.globalAlpha = 1;
                }
            }
        }

        // Phase 3: The message
        if (this.failTimer >= 5) {
            ctx.fillStyle = '#050409';
            ctx.fillRect(0, 0, w, h);

            const textFade = Math.min(1, (this.failTimer - 5) / 2);
            ctx.globalAlpha = textFade;
            ctx.textAlign = 'center';

            if (this.failReason === 'death') {
                ctx.fillStyle = '#EF4444';
                ctx.font = 'bold 26px monospace';
                ctx.fillText('The agent fell.', w / 2, h / 2 - 40);
                ctx.fillStyle = '#9CA3AF';
                ctx.font = '14px monospace';
                ctx.fillText('No one will come to finish the mission.', w / 2, h / 2);
                ctx.fillStyle = '#6B7280';
                ctx.font = 'italic 13px monospace';
                ctx.fillText('The echo became an event.', w / 2, h / 2 + 30);
            } else {
                ctx.fillStyle = '#EF4444';
                ctx.font = 'bold 26px monospace';
                ctx.fillText('Time ran out.', w / 2, h / 2 - 40);
                ctx.fillStyle = '#9CA3AF';
                ctx.font = '14px monospace';
                ctx.fillText('The breach reached the surface.', w / 2, h / 2);
                ctx.fillStyle = '#6B7280';
                ctx.font = 'italic 13px monospace';
                ctx.fillText('The echo became an event.', w / 2, h / 2 + 30);
            }

            ctx.globalAlpha = 1;
        }

        // Retry
        if (this.failTimer >= 8) {
            const blink = Math.sin(this.failTimer * 3) > 0;
            if (blink) {
                ctx.fillStyle = '#D1D5DB';
                ctx.font = '16px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('[ Press SPACE to try again ]', w / 2, h / 2 + 80);
            }
        }
    },

    reset() {
        this.titleTimer = 0;
        this.failTimer = 0;
        this.winTimer = 0;
        this.failReason = 'time';
    }
};
