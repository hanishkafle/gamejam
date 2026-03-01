// ── NPC Entity ──
class NPC {
    constructor(x, y, type, dialog, patrol) {
        this.x = x;
        this.y = y;
        this.w = 20;
        this.h = 20;
        this.type = type; // 'villager', 'merchant', 'elder', 'child', 'guard'
        this.dialog = dialog;
        this.patrol = patrol || []; // [{x,y},...] patrol points
        this.patrolIndex = 0;
        this.speed = 0.5;
        this.dir = 0;
        this.frame = 0;
        this.animTimer = 0;
        this.moving = false;
        this.waitTimer = 0;
        this.unease = 0; // 0-1 how uneasy they appear
        this.dialogShown = false;
    }

    update(dt) {
        // Patrol movement
        if (this.patrol.length > 0 && this.waitTimer <= 0) {
            const target = this.patrol[this.patrolIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 3) {
                this.patrolIndex = (this.patrolIndex + 1) % this.patrol.length;
                this.waitTimer = 2 + Math.random() * 3;
                this.moving = false;
            } else {
                const mx = (dx / dist) * this.speed;
                const my = (dy / dist) * this.speed;
                this.x += mx;
                this.y += my;
                this.moving = true;
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.dir = dx > 0 ? 2 : 1;
                } else {
                    this.dir = dy > 0 ? 0 : 3;
                }
            }
        } else {
            this.waitTimer -= dt;
        }

        // Animate
        if (this.moving) {
            this.animTimer += dt;
            if (this.animTimer > 0.2) {
                this.frame = (this.frame + 1) % 4;
                this.animTimer = 0;
            }
        }
    }

    draw(ctx) {
        const px = Math.round(this.x);
        const py = Math.round(this.y);
        const colors = this.getColors();

        // Body
        ctx.fillStyle = colors.body;
        ctx.fillRect(px + 4, py + 6, 12, 14);

        // Head
        ctx.fillStyle = colors.skin;
        ctx.fillRect(px + 6, py + 1, 8, 8);

        // Hair/hat
        ctx.fillStyle = colors.hair;
        ctx.fillRect(px + 5, py, 10, 3);

        // Eyes
        ctx.fillStyle = '#1E1B4B';
        if (this.unease > 0.5) {
            // Looking down (uneasy)
            ctx.fillRect(px + 7, py + 6, 2, 2);
            ctx.fillRect(px + 11, py + 6, 2, 2);
        } else {
            ctx.fillRect(px + 7, py + 4, 2, 2);
            ctx.fillRect(px + 11, py + 4, 2, 2);
        }

        // Legs
        ctx.fillStyle = colors.legs;
        if (this.moving) {
            const off = Math.sin(this.frame * Math.PI / 2) * 2;
            ctx.fillRect(px + 5, py + 18 + off, 4, 4);
            ctx.fillRect(px + 11, py + 18 - off, 4, 4);
        } else {
            ctx.fillRect(px + 5, py + 18, 4, 4);
            ctx.fillRect(px + 11, py + 18, 4, 4);
        }

        // Unease visual - slight trembling
        if (this.unease > 0.3) {
            const shake = Math.sin(Date.now() / 100) * this.unease;
            ctx.fillStyle = colors.body;
            ctx.fillRect(px + 4 + shake, py + 6, 12, 14);
        }

        // Interaction indicator
        if (this._showIndicator) {
            ctx.fillStyle = '#FCD34D';
            ctx.fillRect(px + 8, py - 8, 4, 4);
            ctx.fillStyle = '#FCD34D';
            ctx.fillRect(px + 9, py - 3, 2, 2);
        }
    }

    getColors() {
        switch (this.type) {
            case 'merchant': return { body: '#92400E', skin: '#FBBF24', hair: '#78350F', legs: '#6B2F0A' };
            case 'elder': return { body: '#6B21A8', skin: '#FDE68A', hair: '#D1D5DB', legs: '#581C87' };
            case 'child': return { body: '#F472B6', skin: '#FDE68A', hair: '#92400E', legs: '#EC4899' };
            case 'guard': return { body: '#6B7280', skin: '#FBBF24', hair: '#374151', legs: '#4B5563' };
            default: return { body: '#22C55E', skin: '#FDE68A', hair: '#78350F', legs: '#16A34A' };
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    isNearPlayer(player, range = 30) {
        return Collision.dist(this, player) < range;
    }

    set showIndicator(v) { this._showIndicator = v; }
}
