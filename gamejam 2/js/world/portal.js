// ── Portal & Descent ──
const Portal = {
    keysInserted: 0,
    animationPhase: 0, // 0=inserting, 1=opening, 2=falling
    timer: 0,
    flashTimer: 0,
    fallY: 0,
    fragments: [],
    complete: false,

    init() {
        this.keysInserted = 0;
        this.animationPhase = 0;
        this.timer = 0;
        this.fallY = 0;
        this.complete = false;
        this.fragments = [];
        // Generate random fragments for descent
        for (let i = 0; i < 30; i++) {
            this.fragments.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                size: 10 + Math.random() * 40,
                speed: 1 + Math.random() * 3,
                rotation: Math.random() * Math.PI * 2,
                tile: Math.floor(Math.random() * 8),
                alpha: 0.3 + Math.random() * 0.5,
            });
        }
    },

    startInsertion() {
        this.animationPhase = 0;
        this.keysInserted = 0;
        this.timer = 0;
        Audio.portalOpen();
    },

    update(dt, canvasW, canvasH) {
        this.timer += dt;

        if (this.animationPhase === 0) {
            // Key insertion phase
            if (this.timer > 0.8) {
                this.keysInserted++;
                this.timer = 0;
                Audio.keyInsert();
                Camera.shake(2 + this.keysInserted, 0.3);
                if (this.keysInserted >= 5) {
                    this.animationPhase = 1;
                    this.timer = 0;
                    Camera.shake(8, 1.0);
                    Audio.portalOpen();
                }
            }
        } else if (this.animationPhase === 1) {
            // Portal opening
            if (this.timer > 2.0) {
                this.animationPhase = 2;
                this.timer = 0;
                this.fallY = 0;
            }
        } else if (this.animationPhase === 2) {
            // Falling descent
            this.fallY += dt * 200;
            for (const f of this.fragments) {
                f.y += f.speed * 2;
                f.rotation += dt;
                if (f.y > canvasH + 50) {
                    f.y = -50;
                    f.x = Math.random() * canvasW;
                }
            }
            if (this.timer > 4.0) {
                this.complete = true;
            }
        }
    },

    draw(ctx, canvasW, canvasH) {
        if (this.animationPhase === 0) {
            // Key insertion visualization
            ctx.fillStyle = '#0F0E1A';
            ctx.fillRect(0, 0, canvasW, canvasH);

            // Portal circle
            const cx = canvasW / 2;
            const cy = canvasH / 2;

            // Stone mechanism
            ctx.strokeStyle = '#6B7280';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(cx, cy, 100, 0, Math.PI * 2);
            ctx.stroke();

            // Key slots
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                const kx = cx + Math.cos(angle) * 80;
                const ky = cy + Math.sin(angle) * 80;

                if (i < this.keysInserted) {
                    ctx.fillStyle = '#FCD34D';
                    ctx.fillRect(kx - 8, ky - 8, 16, 16);
                    // Glow
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#FCD34D';
                    ctx.fillRect(kx - 12, ky - 12, 24, 24);
                    ctx.globalAlpha = 1;
                } else {
                    ctx.fillStyle = '#374151';
                    ctx.fillRect(kx - 6, ky - 6, 12, 12);
                }
            }

            // Center glow based on keys inserted
            const glow = this.keysInserted / 5;
            ctx.globalAlpha = glow * 0.5;
            ctx.fillStyle = '#8B5CF6';
            ctx.beginPath();
            ctx.arc(cx, cy, 60 * glow, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Text
            ctx.fillStyle = '#D1D5DB';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`Inserting keys... ${this.keysInserted}/5`, cx, cy + 140);

        } else if (this.animationPhase === 1) {
            // Portal tearing open
            ctx.fillStyle = '#0F0E1A';
            ctx.fillRect(0, 0, canvasW, canvasH);

            const cx = canvasW / 2;
            const cy = canvasH / 2;
            const openProgress = Math.min(1, this.timer / 2.0);
            const radius = openProgress * 200;

            // Swirling purple energy
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + this.timer * 2;
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = ['#8B5CF6', '#6D28D9', '#A78BFA', '#7C3AED'][i % 4];
                const sx = cx + Math.cos(angle) * radius * 0.6;
                const sy = cy + Math.sin(angle) * radius * 0.6;
                ctx.fillRect(sx - 15, sy - 15, 30, 30);
            }
            ctx.globalAlpha = 1;

            // Dark center
            ctx.fillStyle = '#0B0A12';
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Flash
            if (openProgress > 0.8) {
                ctx.globalAlpha = (openProgress - 0.8) * 5;
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvasW, canvasH);
                ctx.globalAlpha = 1;
            }

        } else if (this.animationPhase === 2) {
            // Descent - falling through fragmented images
            ctx.fillStyle = '#0B0A12';
            ctx.fillRect(0, 0, canvasW, canvasH);

            // Streaking lines (speed effect)
            ctx.strokeStyle = '#4338CA';
            ctx.lineWidth = 1;
            for (let i = 0; i < 20; i++) {
                const sx = (i * 47 + this.timer * 100) % canvasW;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx + (Math.random() - 0.5) * 20, canvasH);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            // Fragmented town images
            for (const f of this.fragments) {
                ctx.save();
                ctx.translate(f.x, f.y);
                ctx.rotate(f.rotation);
                ctx.globalAlpha = f.alpha * (1 - this.timer / 4);
                // Draw distorted tile fragments
                const colors = ['#D4A574', '#4ADE80', '#DC2626', '#78716C', '#E5E7EB', '#38BDF8'];
                ctx.fillStyle = colors[f.tile % colors.length];
                ctx.fillRect(-f.size / 2, -f.size / 2, f.size, f.size);
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            // Increasing dark overlay
            const darkness = Math.min(1, this.timer / 3.5);
            ctx.fillStyle = `rgba(11, 10, 18, ${darkness})`;
            ctx.fillRect(0, 0, canvasW, canvasH);

            // Text
            if (this.timer > 1 && this.timer < 3) {
                ctx.globalAlpha = Math.sin((this.timer - 1) * Math.PI / 2);
                ctx.fillStyle = '#D1D5DB';
                ctx.font = 'italic 20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Descending into The Below...', canvasW / 2, canvasH / 2);
                ctx.globalAlpha = 1;
            }
        }
    }
};
