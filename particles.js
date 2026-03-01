// ── Particle Effects System ──
class Particle {
    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.vx = opts.vx || (Math.random() - 0.5) * 2;
        this.vy = opts.vy || (Math.random() - 0.5) * 2;
        this.life = opts.life || 1;
        this.maxLife = this.life;
        this.size = opts.size || 3;
        this.color = opts.color || '#fff';
        this.gravity = opts.gravity || 0;
        this.friction = opts.friction || 0.98;
        this.fadeOut = opts.fadeOut !== false;
    }

    update(dt) {
        this.vy += this.gravity * dt;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= dt;
    }

    draw(ctx) {
        const alpha = this.fadeOut ? Math.max(0, this.life / this.maxLife) : 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        const s = this.size * (0.5 + 0.5 * (this.life / this.maxLife));
        ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
        ctx.globalAlpha = 1;
    }
}

const Particles = {
    particles: [],

    emit(x, y, count, opts) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, {
                ...opts,
                vx: (opts?.vx || 0) + (Math.random() - 0.5) * (opts?.spread || 3),
                vy: (opts?.vy || 0) + (Math.random() - 0.5) * (opts?.spread || 3),
            }));
        }
    },

    // Key pickup sparkle
    keyPickup(x, y) {
        this.emit(x, y, 20, {
            color: '#FFD700',
            life: 0.8,
            size: 4,
            spread: 4,
            gravity: -0.5,
        });
    },

    // Portal energy
    portalEnergy(x, y) {
        this.emit(x, y, 3, {
            color: ['#8B5CF6', '#6D28D9', '#A78BFA'][Math.floor(Math.random() * 3)],
            life: 1.2,
            size: 3,
            spread: 2,
            vy: -1,
        });
    },

    // Poison splash
    poisonSplash(x, y) {
        this.emit(x, y, 10, {
            color: '#22C55E',
            life: 0.5,
            size: 3,
            spread: 3,
            gravity: 2,
        });
    },

    // Guardian trail
    guardianTrail(x, y) {
        this.emit(x, y, 2, {
            color: '#1E1B4B',
            life: 0.6,
            size: 5,
            spread: 1,
        });
    },

    // Collapse debris
    collapse(x, y) {
        this.emit(x, y, 5, {
            color: '#6B7280',
            life: 1.0,
            size: 4,
            spread: 2,
            gravity: 3,
        });
    },

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    },

    clear() {
        this.particles = [];
    }
};
