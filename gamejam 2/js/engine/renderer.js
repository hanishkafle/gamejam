// ── Tile Renderer ──
const Renderer = {
    TILE: 24,

    palette: {
        surface: {
            grass: ['#4ADE80', '#22C55E', '#16A34A'],
            path: ['#D4A574', '#C4956A', '#B8855A'],
            wall: ['#78716C', '#6B6560', '#5E5955'],
            roof: ['#DC2626', '#B91C1C', '#991B1B'],
            wood: ['#92400E', '#78350F', '#6B2F0A'],
            water: ['#38BDF8', '#0EA5E9', '#0284C7'],
            door: ['#B45309', '#A8440D', '#8B3A0E'],
            window: ['#BFDBFE', '#93C5FD', '#60A5FA'],
            flower: ['#F472B6', '#FB923C', '#FBBF24', '#A78BFA'],
        },
        below: {
            ground: ['#1E1B4B', '#1E1B3B', '#2D2A5E'],
            wall: ['#312E81', '#3730A3', '#4338CA'],
            hazard: ['#22C55E', '#16A34A', '#15803D'],
            glow: ['#8B5CF6', '#7C3AED', '#6D28D9'],
            dark: ['#0F0E1A', '#0D0C15', '#0B0A12'],
        }
    },

    drawTile(ctx, tileId, x, y, isBelow) {
        const T = this.TILE;
        const px = x * T;
        const py = y * T;
        const pal = isBelow ? this.palette.below : this.palette.surface;

        switch (tileId) {
            case 0:
                this._drawGround(ctx, px, py, T, isBelow ? pal.ground : pal.grass);
                break;
            case 1:
                this._drawWall(ctx, px, py, T, pal.wall || pal.wall);
                break;
            case 2:
                ctx.fillStyle = pal.path ? pal.path[0] : pal.ground[0];
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = pal.path ? pal.path[1] : pal.ground[1];
                for (let i = 0; i < 3; i++) {
                    const sx = px + ((i * 8 + 3) % T);
                    const sy = py + ((i * 7 + 2) % T);
                    ctx.fillRect(sx, sy, 4, 3);
                }
                break;
            case 3:
                this._drawWater(ctx, px, py, T, isBelow);
                break;
            case 4:
                ctx.fillStyle = '#E5E7EB';
                ctx.fillRect(px, py, T, T);
                ctx.strokeStyle = '#D1D5DB';
                ctx.strokeRect(px, py, T, T);
                break;
            case 5:
                ctx.fillStyle = pal.door ? pal.door[0] : '#B45309';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#FCD34D';
                ctx.fillRect(px + T - 6, py + T / 2 - 1, 2, 2);
                break;
            case 6:
                ctx.fillStyle = '#E5E7EB';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = pal.window ? pal.window[0] : '#93C5FD';
                ctx.fillRect(px + 4, py + 4, T - 8, T - 8);
                ctx.strokeStyle = '#78716C';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px + T / 2, py + 4);
                ctx.lineTo(px + T / 2, py + T - 4);
                ctx.moveTo(px + 4, py + T / 2);
                ctx.lineTo(px + T - 4, py + T / 2);
                ctx.stroke();
                break;
            case 7:
                ctx.fillStyle = pal.roof ? pal.roof[0] : '#DC2626';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = pal.roof ? pal.roof[1] : '#B91C1C';
                ctx.fillRect(px, py + T / 2, T, T / 2);
                break;
            case 8:
                this._drawGround(ctx, px, py, T, pal.grass || pal.ground);
                const fc = (pal.flower || ['#F472B6']);
                ctx.fillStyle = fc[Math.floor(((x * 13 + y * 7) % fc.length))];
                ctx.fillRect(px + 4, py + 8, 4, 4);
                ctx.fillRect(px + 14, py + 4, 4, 4);
                ctx.fillRect(px + 8, py + 16, 4, 4);
                // Stems
                ctx.fillStyle = '#15803D';
                ctx.fillRect(px + 5, py + 12, 2, 4);
                ctx.fillRect(px + 15, py + 8, 2, 5);
                ctx.fillRect(px + 9, py + 20, 2, 3);
                break;
            case 9:
                ctx.fillStyle = '#1E1B4B';
                ctx.fillRect(px, py, T, T);
                const glow = Math.sin(Date.now() / 300) * 0.3 + 0.5;
                ctx.globalAlpha = glow;
                ctx.fillStyle = '#8B5CF6';
                ctx.fillRect(px + 2, py + 2, T - 4, T - 4);
                ctx.globalAlpha = 1;
                break;
            case 10:
                this._drawGround(ctx, px, py, T, isBelow ? pal.ground : pal.grass);
                const shimmer = Math.sin(Date.now() / 500 + x + y) * 0.4 + 0.5;
                ctx.globalAlpha = shimmer;
                ctx.fillStyle = '#FCD34D';
                ctx.fillRect(px + 8, py + 8, 8, 8);
                ctx.globalAlpha = 1;
                break;
            case 11:
                ctx.fillStyle = '#78716C';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#6B6560';
                ctx.fillRect(px + 1, py + 1, T - 2, 2);
                break;
            case 12:
                ctx.fillStyle = '#312E81';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#4338CA';
                ctx.fillRect(px + 2, py + 2, 4, 4);
                ctx.fillRect(px + T - 6, py + T - 6, 4, 4);
                break;
            case 13:
                ctx.fillStyle = '#1E1B4B';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#8B5CF6';
                ctx.fillRect(px + 4, py + 4, T - 8, T - 8);
                ctx.fillStyle = '#FCD34D';
                ctx.fillRect(px + 8, py + 8, T - 16, T - 16);
                break;
            case 14:
                ctx.fillStyle = pal.ground ? pal.ground[0] : '#1E1B4B';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#6B7280';
                ctx.fillRect(px + 3, py + 3, T - 6, T - 6);
                ctx.fillStyle = '#9CA3AF';
                ctx.fillRect(px + 5, py + 5, T - 10, T - 10);
                break;
            case 15:
                ctx.fillStyle = '#F5F0E6';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#E8E0D0';
                if ((x + y) % 2 === 0) ctx.fillRect(px, py, T, T);
                break;
            case 16:
                const sinkGlow = Math.sin(Date.now() / 800) * 0.2 + 0.8;
                ctx.globalAlpha = sinkGlow;
                ctx.fillStyle = '#92400E';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#78350F';
                ctx.fillRect(px + 2, py + 2, T - 4, 2);
                ctx.globalAlpha = 1;
                break;
            case 17:
                ctx.fillStyle = '#312E81';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#A78BFA';
                ctx.fillRect(px + 6, py + 6, T - 12, T - 12);
                break;

            // ═══ NEW ENVIRONMENT TILES ═══

            case 18: // Tree (solid) — leafy green tree top
                this._drawGround(ctx, px, py, T, pal.grass || pal.ground);
                // Trunk
                ctx.fillStyle = '#78350F';
                ctx.fillRect(px + 9, py + 14, 6, 10);
                // Canopy layers
                ctx.fillStyle = '#15803D';
                ctx.fillRect(px + 2, py + 2, 20, 14);
                ctx.fillStyle = '#16A34A';
                ctx.fillRect(px + 4, py, 16, 8);
                ctx.fillStyle = '#22C55E';
                ctx.fillRect(px + 6, py + 1, 12, 5);
                // Highlight
                ctx.fillStyle = '#4ADE80';
                ctx.fillRect(px + 8, py + 2, 4, 3);
                break;

            case 19: // Bush (walkable)
                this._drawGround(ctx, px, py, T, pal.grass || pal.ground);
                ctx.fillStyle = '#16A34A';
                ctx.fillRect(px + 3, py + 8, 18, 14);
                ctx.fillStyle = '#22C55E';
                ctx.fillRect(px + 5, py + 6, 14, 10);
                ctx.fillStyle = '#4ADE80';
                ctx.fillRect(px + 7, py + 7, 4, 4);
                // Small berries
                if ((x + y) % 3 === 0) {
                    ctx.fillStyle = '#EF4444';
                    ctx.fillRect(px + 14, py + 10, 3, 3);
                    ctx.fillRect(px + 8, py + 14, 3, 3);
                }
                break;

            case 20: // Fence (solid)
                this._drawGround(ctx, px, py, T, pal.grass || pal.ground);
                ctx.fillStyle = '#92400E';
                // Vertical posts
                ctx.fillRect(px + 2, py + 4, 4, 18);
                ctx.fillRect(px + 18, py + 4, 4, 18);
                // Horizontal rails
                ctx.fillStyle = '#B45309';
                ctx.fillRect(px, py + 7, T, 3);
                ctx.fillRect(px, py + 16, T, 3);
                break;

            case 21: // Lamp post (walkable)
                this._drawGround(ctx, px, py, T, pal.grass || pal.ground);
                // Pole
                ctx.fillStyle = '#6B7280';
                ctx.fillRect(px + 10, py + 6, 4, 18);
                // Lamp top
                ctx.fillStyle = '#374151';
                ctx.fillRect(px + 6, py + 2, 12, 6);
                // Light glow
                const lampGl = Math.sin(Date.now() / 700 + x) * 0.2 + 0.7;
                ctx.globalAlpha = lampGl;
                ctx.fillStyle = '#FCD34D';
                ctx.fillRect(px + 8, py + 3, 8, 4);
                // Ground glow
                ctx.globalAlpha = lampGl * 0.15;
                ctx.fillStyle = '#FCD34D';
                ctx.beginPath();
                ctx.arc(px + 12, py + 22, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                break;

            case 22: // Well (solid)
                this._drawGround(ctx, px, py, T, pal.grass || pal.ground);
                // Stone base
                ctx.fillStyle = '#78716C';
                ctx.fillRect(px + 2, py + 8, 20, 14);
                ctx.fillStyle = '#9CA3AF';
                ctx.fillRect(px + 4, py + 10, 16, 10);
                // Water inside
                ctx.fillStyle = '#0EA5E9';
                ctx.fillRect(px + 6, py + 12, 12, 6);
                // Roof frame
                ctx.fillStyle = '#78350F';
                ctx.fillRect(px + 3, py + 4, 3, 8);
                ctx.fillRect(px + 18, py + 4, 3, 8);
                ctx.fillStyle = '#92400E';
                ctx.fillRect(px + 2, py + 2, 20, 4);
                break;

            case 23: // Tall grass (decorative, walkable)
                this._drawGround(ctx, px, py, T, pal.grass || pal.ground);
                const sway = Math.sin(Date.now() / 800 + x * 3 + y * 5) * 2;
                ctx.fillStyle = '#22C55E';
                ctx.fillRect(px + 3 + sway, py + 2, 2, 12);
                ctx.fillRect(px + 8 - sway, py + 4, 2, 10);
                ctx.fillRect(px + 13 + sway, py + 1, 2, 14);
                ctx.fillRect(px + 18 - sway, py + 3, 2, 11);
                ctx.fillStyle = '#16A34A';
                ctx.fillRect(px + 6 + sway, py + 6, 2, 8);
                ctx.fillRect(px + 16 - sway, py + 5, 2, 9);
                break;

            case 24: // Stone/rock (walkable decoration)
                this._drawGround(ctx, px, py, T, pal.grass || pal.ground);
                ctx.fillStyle = '#6B7280';
                ctx.fillRect(px + 6, py + 10, 12, 10);
                ctx.fillStyle = '#9CA3AF';
                ctx.fillRect(px + 8, py + 8, 10, 8);
                ctx.fillStyle = '#D1D5DB';
                ctx.fillRect(px + 10, py + 9, 4, 3);
                break;

            case 25: // Bridge (walkable path over water)
                ctx.fillStyle = '#0EA5E9';
                ctx.fillRect(px, py, T, T);
                ctx.fillStyle = '#92400E';
                ctx.fillRect(px + 2, py, T - 4, T);
                ctx.fillStyle = '#B45309';
                ctx.fillRect(px + 4, py + 2, T - 8, 3);
                ctx.fillRect(px + 4, py + T - 5, T - 8, 3);
                // Planks
                ctx.fillStyle = '#A3730D';
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(px + 3, py + i * 6 + 1, T - 6, 1);
                }
                break;

            default:
                ctx.fillStyle = '#333';
                ctx.fillRect(px, py, T, T);
        }
    },

    _drawGround(ctx, px, py, T, colors) {
        ctx.fillStyle = colors[(Math.floor(px / T) + Math.floor(py / T)) % colors.length];
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = colors[(Math.floor(px / T) * 3 + Math.floor(py / T) * 7) % colors.length];
        ctx.fillRect(px + 4, py + 6, 2, 3);
        ctx.fillRect(px + 14, py + 12, 2, 3);
    },

    _drawWall(ctx, px, py, T, colors) {
        ctx.fillStyle = colors[0];
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = colors[1];
        const brickH = 6;
        for (let row = 0; row < T / brickH; row++) {
            const offset = (row % 2) * 8;
            for (let col = -1; col < T / 12 + 1; col++) {
                ctx.strokeStyle = colors[2];
                ctx.lineWidth = 0.5;
                ctx.strokeRect(px + col * 12 + offset, py + row * brickH, 12, brickH);
            }
        }
    },

    _drawWater(ctx, px, py, T, isBelow) {
        const base = isBelow ? '#22C55E' : '#0EA5E9';
        const wave = isBelow ? '#16A34A' : '#0284C7';
        ctx.fillStyle = base;
        ctx.fillRect(px, py, T, T);
        const offset = Math.sin(Date.now() / 600 + px * 0.1) * 3;
        ctx.fillStyle = wave;
        ctx.fillRect(px, py + 8 + offset, T, 3);
        ctx.fillRect(px, py + 18 + offset * 0.7, T, 2);
        if (isBelow) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#4ADE80';
            ctx.fillRect(px, py, T, T);
            ctx.globalAlpha = 1;
        }
    },

    drawMap(ctx, tileMap, isBelow) {
        const startX = Math.max(0, Math.floor(Camera.x / this.TILE) - 1);
        const startY = Math.max(0, Math.floor(Camera.y / this.TILE) - 1);
        const endX = Math.min(tileMap.width, Math.ceil((Camera.x + Camera.width) / this.TILE) + 1);
        const endY = Math.min(tileMap.height, Math.ceil((Camera.y + Camera.height) / this.TILE) + 1);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = tileMap.data[y * tileMap.width + x];
                this.drawTile(ctx, tile, x, y, isBelow);
            }
        }
    },

    drawBelowOverlay(ctx, width, height) {
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.3,
            width / 2, height / 2, width * 0.8
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const warp = Math.sin(Date.now() / 2000) * 2;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
        ctx.lineWidth = warp + 2;
        ctx.strokeRect(warp, warp, width - warp * 2, height - warp * 2);
    },

    drawSurfaceOverlay(ctx, width, height, degradation) {
        if (degradation > 0) {
            ctx.fillStyle = `rgba(30, 27, 75, ${degradation * 0.15})`;
            ctx.fillRect(0, 0, width, height);
            if (degradation > 0.5 && Math.random() < degradation * 0.05) {
                ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.2})`;
                ctx.fillRect(0, 0, width, height);
            }
        }
    }
};
