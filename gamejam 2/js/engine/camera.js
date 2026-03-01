// ── Camera System ──
const Camera = {
    x: 0, y: 0,
    targetX: 0, targetY: 0,
    width: 0, height: 0,
    shakeX: 0, shakeY: 0,
    shakeDuration: 0,
    shakeIntensity: 0,
    smoothing: 0.08,

    init(w, h) {
        this.width = w;
        this.height = h;
    },

    follow(entity) {
        this.targetX = entity.x - this.width / 2 + 12;
        this.targetY = entity.y - this.height / 2 + 12;
    },

    clamp(mapW, mapH) {
        this.targetX = Math.max(0, Math.min(this.targetX, mapW - this.width));
        this.targetY = Math.max(0, Math.min(this.targetY, mapH - this.height));
    },

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    },

    update(dt) {
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;

        if (this.shakeDuration > 0) {
            this.shakeDuration -= dt;
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    },

    apply(ctx) {
        ctx.save();
        ctx.translate(
            -Math.round(this.x + this.shakeX),
            -Math.round(this.y + this.shakeY)
        );
    },

    restore(ctx) {
        ctx.restore();
    }
};
