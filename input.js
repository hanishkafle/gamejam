// ── Input Manager ──
const Input = {
    keys: {},
    justPressed: {},
    _prev: {},

    init() {
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
    },

    update() {
        for (const k in this.keys) {
            this.justPressed[k] = this.keys[k] && !this._prev[k];
        }
        Object.assign(this._prev, this.keys);
    },

    isDown(code) { return !!this.keys[code]; },
    isPressed(code) { return !!this.justPressed[code]; },

    get up() { return this.isDown('ArrowUp') || this.isDown('KeyW'); },
    get down() { return this.isDown('ArrowDown') || this.isDown('KeyS'); },
    get left() { return this.isDown('ArrowLeft') || this.isDown('KeyA'); },
    get right() { return this.isDown('ArrowRight') || this.isDown('KeyD'); },
    get interact() { return this.isPressed('KeyE') || this.isPressed('Space'); },
    get any() { return this.isPressed('KeyE') || this.isPressed('Space') || this.isPressed('Enter'); },
};
