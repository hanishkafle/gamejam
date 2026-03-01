// ── Guardian Entity (Final Chamber) ──
const Guardian = {
    x: 0, y: 0,
    w: 32, h: 32,
    speed: 2.0,
    active: false,
    stunTimer: 0,
    frame: 0,
    animTimer: 0,
    trailTimer: 0,

    init(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
        this.stunTimer = 0;
    },

    update(dt, playerX, playerY) {
        if (!this.active) return;

        // Stunned?
        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            return;
        }

        // Pursue player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            // Accelerate when close to player
            const spMult = dist < 100 ? 1.5 : dist < 200 ? 1.2 : 1.0;
            const spd = this.speed * spMult;
            this.x += (dx / dist) * spd;
            this.y += (dy / dist) * spd;
        }

        // Animation
        this.animTimer += dt;
        if (this.animTimer > 0.1) {
            this.frame = (this.frame + 1) % 8;
            this.animTimer = 0;
        }

        // Particle trail
        this.trailTimer += dt;
        if (this.trailTimer > 0.1) {
            Particles.guardianTrail(this.x + 16, this.y + 16);
            this.trailTimer = 0;
        }
    },

    stun(duration) {
        this.stunTimer = duration;
    },

    draw(ctx) {
        if (!this.active) return;

        const px = Math.round(this.x);
        const py = Math.round(this.y);

        // Dark shadow body
        const pulse = Math.sin(Date.now() / 200) * 3;

        // Outer glow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#6D28D9';
        ctx.fillRect(px - 4 + pulse, py - 4, 40, 40);
        ctx.globalAlpha = 1;

        // Core body
        ctx.fillStyle = this.stunTimer > 0 ? '#4338CA' : '#1E1B4B';
        ctx.fillRect(px + 4, py + 2, 24, 28);

        // "Face" - two glowing eyes
        if (this.stunTimer <= 0) {
            ctx.fillStyle = '#EF4444';
            const eyeBob = Math.sin(this.frame * Math.PI / 4) * 1;
            ctx.fillRect(px + 8, py + 8 + eyeBob, 4, 4);
            ctx.fillRect(px + 20, py + 8 + eyeBob, 4, 4);

            // Glow effect around eyes
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(px + 6, py + 6 + eyeBob, 8, 8);
            ctx.fillRect(px + 18, py + 6 + eyeBob, 8, 8);
            ctx.globalAlpha = 1;
        } else {
            // Stunned - dimmed eyes
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#6B7280';
            ctx.fillRect(px + 8, py + 10, 4, 2);
            ctx.fillRect(px + 20, py + 10, 4, 2);
            ctx.globalAlpha = 1;
        }

        // Tendrils/legs
        ctx.fillStyle = '#1E1B4B';
        const tendril = Math.sin(Date.now() / 150 + px) * 2;
        ctx.fillRect(px + 2, py + 26, 6, 6 + tendril);
        ctx.fillRect(px + 12, py + 28, 6, 4 - tendril);
        ctx.fillRect(px + 22, py + 26, 6, 6 + tendril * 0.7);
    },

    getBounds() {
        return { x: this.x + 4, y: this.y + 2, w: 24, h: 28 };
    },

    touchesPlayer(player) {
        if (!this.active || this.stunTimer > 0) return false;
        return Collision.aabb(this.getBounds(), player.getBounds());
    }
};
