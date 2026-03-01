// ── Screen Transitions ──
const Transitions = {
    active: false,
    type: 'fade', // 'fade', 'wipe', 'crack'
    phase: 'in', // 'in' or 'out'
    progress: 0,
    duration: 1.0,
    onMidpoint: null,
    midpointCalled: false,
    color: '#000',

    start(type, duration, color, onMidpoint) {
        this.active = true;
        this.type = type;
        this.phase = 'out'; // fade OUT first
        this.progress = 0;
        this.duration = duration || 1.0;
        this.color = color || '#000';
        this.onMidpoint = onMidpoint;
        this.midpointCalled = false;
    },

    update(dt) {
        if (!this.active) return;

        this.progress += dt / (this.duration / 2);

        if (this.phase === 'out' && this.progress >= 1) {
            // Hit midpoint - call callback
            if (!this.midpointCalled && this.onMidpoint) {
                this.onMidpoint();
                this.midpointCalled = true;
            }
            this.phase = 'in';
            this.progress = 0;
        }

        if (this.phase === 'in' && this.progress >= 1) {
            this.active = false;
        }
    },

    draw(ctx, w, h) {
        if (!this.active) return;

        let alpha;
        if (this.phase === 'out') {
            alpha = Math.min(1, this.progress);
        } else {
            alpha = Math.max(0, 1 - this.progress);
        }

        switch (this.type) {
            case 'fade':
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.fillRect(0, 0, w, h);
                ctx.globalAlpha = 1;
                break;

            case 'wipe':
                ctx.fillStyle = this.color;
                if (this.phase === 'out') {
                    ctx.fillRect(0, 0, w * alpha, h);
                } else {
                    ctx.fillRect(w * (1 - alpha), 0, w * alpha, h);
                }
                break;

            case 'crack':
                // Crack effect for dimension shift
                if (this.phase === 'out') {
                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = alpha * 0.8;
                    ctx.fillRect(0, 0, w, h);
                    // Purple cracks
                    ctx.strokeStyle = '#8B5CF6';
                    ctx.lineWidth = alpha * 4;
                    for (let i = 0; i < 5; i++) {
                        ctx.beginPath();
                        const sx = w / 2 + (i - 2) * 80;
                        ctx.moveTo(sx, h / 2);
                        for (let s = 0; s < alpha * 200; s += 15) {
                            ctx.lineTo(sx + (Math.random() - 0.5) * 40, h / 2 - s);
                            ctx.lineTo(sx + (Math.random() - 0.5) * 40, h / 2 + s);
                        }
                        ctx.stroke();
                    }
                    ctx.globalAlpha = 1;
                } else {
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = this.color;
                    ctx.fillRect(0, 0, w, h);
                    ctx.globalAlpha = 1;
                }
                break;
        }
    }
};
