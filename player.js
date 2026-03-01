// ── Player Entity ──
const Player = {
    x: 0, y: 0,
    w: 20, h: 20,
    speed: 3.5,
    dir: 0, // 0=down,1=left,2=right,3=up
    frame: 0,
    animTimer: 0,
    moving: false,
    health: 3,
    maxHealth: 3,
    keys: 0,
    hasSword: false,
    invulnerable: 0,
    stepTimer: 0,

    init(x, y) {
        this.x = x;
        this.y = y;
        this.health = this.maxHealth;
        this.invulnerable = 0;
        this.dir = 0;
        this.frame = 0;
        this.moving = false;
    },

    resetFull() {
        this.health = this.maxHealth;
        this.keys = 0;
        this.hasSword = false;
        this.invulnerable = 0;
    },

    update(dt, tileMap, solidTiles) {
        let dx = 0, dy = 0;
        this.moving = false;

        if (Input.left) { dx = -this.speed; this.dir = 1; this.moving = true; }
        if (Input.right) { dx = this.speed; this.dir = 2; this.moving = true; }
        if (Input.up) { dy = -this.speed; this.dir = 3; this.moving = true; }
        if (Input.down) { dy = this.speed; this.dir = 0; this.moving = true; }

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Move with collision
        if (dx !== 0 && Collision.canMove(this, dx, 0, tileMap, solidTiles)) {
            this.x += dx;
        }
        if (dy !== 0 && Collision.canMove(this, 0, dy, tileMap, solidTiles)) {
            this.y += dy;
        }

        // Animation
        if (this.moving) {
            this.animTimer += dt;
            if (this.animTimer > 0.15) {
                this.frame = (this.frame + 1) % 4;
                this.animTimer = 0;
            }
            this.stepTimer += dt;
            if (this.stepTimer > 0.3) {
                Audio.step();
                this.stepTimer = 0;
            }
        } else {
            this.frame = 0;
        }

        // Invulnerability
        if (this.invulnerable > 0) {
            this.invulnerable -= dt;
        }
    },

    takeDamage(amount) {
        if (this.invulnerable > 0) return false;
        this.health -= amount;
        this.invulnerable = 1.0;
        Audio.damage();
        Camera.shake(4, 0.3);
        if (this.health <= 0) {
            this.health = 0;
            return true; // dead
        }
        return false;
    },

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    },

    draw(ctx) {
        const T = 24;
        const px = Math.round(this.x);
        const py = Math.round(this.y);

        // Flash when invulnerable
        if (this.invulnerable > 0 && Math.floor(this.invulnerable * 10) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        // Body
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(px + 4, py + 6, 12, 14);

        // Head
        ctx.fillStyle = '#FBBF24';
        ctx.fillRect(px + 6, py + 1, 8, 8);

        // Eyes
        ctx.fillStyle = '#1E1B4B';
        if (this.dir === 0) { // down
            ctx.fillRect(px + 7, py + 5, 2, 2);
            ctx.fillRect(px + 11, py + 5, 2, 2);
        } else if (this.dir === 3) { // up
            ctx.fillRect(px + 7, py + 3, 2, 2);
            ctx.fillRect(px + 11, py + 3, 2, 2);
        } else if (this.dir === 1) { // left
            ctx.fillRect(px + 6, py + 4, 2, 2);
            ctx.fillRect(px + 6, py + 4, 2, 2);
        } else { // right
            ctx.fillRect(px + 12, py + 4, 2, 2);
        }

        // Legs - animate walking
        ctx.fillStyle = '#1E40AF';
        if (this.moving) {
            const legOffset = Math.sin(this.frame * Math.PI / 2) * 3;
            ctx.fillRect(px + 5, py + 18 + legOffset, 4, 4);
            ctx.fillRect(px + 11, py + 18 - legOffset, 4, 4);
        } else {
            ctx.fillRect(px + 5, py + 18, 4, 4);
            ctx.fillRect(px + 11, py + 18, 4, 4);
        }

        // Sword effect if carrying
        if (this.hasSword) {
            ctx.fillStyle = '#FCD34D';
            const swordGlow = Math.sin(Date.now() / 300) * 2;
            ctx.fillRect(px + 17, py + 4 + swordGlow, 3, 12);
            ctx.fillRect(px + 15, py + 8 + swordGlow, 7, 2);
        }

        // Health indicator - character color shifts
        if (this.health === 2) {
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(px + 4, py + 6, 12, 14);
        } else if (this.health === 1) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(px + 4, py + 6, 12, 14);
        }

        ctx.globalAlpha = 1;
    },

    // Interaction zone (in front of player)
    getInteractRect() {
        const range = 10;
        switch (this.dir) {
            case 0: return { x: this.x, y: this.y + this.h, w: this.w, h: range };
            case 3: return { x: this.x, y: this.y - range, w: this.w, h: range };
            case 1: return { x: this.x - range, y: this.y, w: range, h: this.h };
            case 2: return { x: this.x + this.w, y: this.y, w: range, h: this.h };
        }
    },

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
};
