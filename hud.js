// ── HUD (Heads-Up Display) ──
const HUD = {
    draw(ctx, w, h, timer, totalTime, keys, maxKeys, health, maxHealth, phase, hasSword) {
        // === Timer (top-right) ===
        const minutes = Math.floor(timer / 60);
        const seconds = Math.floor(timer % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const urgency = 1 - (timer / totalTime);

        // Timer background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(w - 120, 8, 112, 36);
        ctx.strokeStyle = urgency > 0.7 ? '#EF4444' : urgency > 0.4 ? '#F59E0B' : '#4ADE80';
        ctx.lineWidth = 1;
        ctx.strokeRect(w - 120, 8, 112, 36);

        // Timer icon
        ctx.fillStyle = urgency > 0.7 ? '#EF4444' : '#D1D5DB';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('⏱', w - 114, 22);

        // Timer text
        ctx.fillStyle = urgency > 0.7 ? '#EF4444' : urgency > 0.4 ? '#FCD34D' : '#F5F5F5';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, w - 64, 36);

        // Timer pulsing when critical
        if (urgency > 0.85) {
            const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.3;
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(w - 120, 8, 112, 36);
            ctx.globalAlpha = 1;
        }

        // === Key Slots (top-left) ===
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(8, 8, maxKeys * 28 + 12, 36);
        ctx.strokeStyle = '#4B5563';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, maxKeys * 28 + 12, 36);

        for (let i = 0; i < maxKeys; i++) {
            const kx = 16 + i * 28;
            const ky = 16;

            if (i < keys) {
                // Collected key — glowing gold
                ctx.shadowColor = '#FCD34D';
                ctx.shadowBlur = 6;
                ctx.fillStyle = '#FCD34D';
                ctx.fillRect(kx + 2, ky, 8, 4);
                ctx.fillRect(kx + 4, ky + 4, 4, 14);
                ctx.fillRect(kx + 2, ky + 10, 8, 3);
                ctx.fillRect(kx + 2, ky + 14, 6, 3);
                ctx.shadowBlur = 0;
            } else {
                // Empty slot
                ctx.fillStyle = '#374151';
                ctx.fillRect(kx + 2, ky, 8, 4);
                ctx.fillRect(kx + 4, ky + 4, 4, 14);
                ctx.fillRect(kx + 2, ky + 10, 8, 3);
            }
        }

        // === Health (below keys) ===
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(8, 50, maxHealth * 24 + 12, 24);

        for (let i = 0; i < maxHealth; i++) {
            const hx = 14 + i * 24;
            const hy = 56;

            if (i < health) {
                // Full heart — red pixel art
                ctx.fillStyle = '#EF4444';
                ctx.fillRect(hx + 1, hy, 4, 4);
                ctx.fillRect(hx + 9, hy, 4, 4);
                ctx.fillRect(hx, hy + 3, 14, 6);
                ctx.fillRect(hx + 2, hy + 8, 10, 3);
                ctx.fillRect(hx + 4, hy + 10, 6, 2);
                // Shine
                ctx.fillStyle = '#FCA5A5';
                ctx.fillRect(hx + 2, hy + 1, 2, 2);
            } else {
                // Empty heart — dark outline
                ctx.fillStyle = '#374151';
                ctx.fillRect(hx + 1, hy, 4, 4);
                ctx.fillRect(hx + 9, hy, 4, 4);
                ctx.fillRect(hx, hy + 3, 14, 6);
                ctx.fillRect(hx + 2, hy + 8, 10, 3);
                ctx.fillRect(hx + 4, hy + 10, 6, 2);
            }
        }

        // === Phase Indicator (bottom-center) ===
        const phaseNames = {
            'SURFACE': 'The Surface',
            'PORTAL': 'The Portal',
            'MAZE': 'Trial I — Shifting Maze',
            'POND': 'Trial II — Poisoned Pond',
            'CHAMBER': 'Trial III — Final Chamber',
            'RETURN': 'ESCAPE — The Below',
            'RETURN_SURFACE': '⚡ GET TO THE TOWNHALL ⚡',
        };
        const phaseName = phaseNames[phase] || phase;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        const tw = ctx.measureText ? 200 : 200;
        ctx.fillRect(w / 2 - 120, h - 28, 240, 22);

        ctx.fillStyle = phase === 'RETURN_SURFACE' ? '#FCD34D' : '#A78BFA';
        ctx.font = phase === 'RETURN_SURFACE' ? 'bold 12px monospace' : '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(phaseName, w / 2, h - 12);

        // === Sword Indicator (below health when carrying) ===
        if (hasSword) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(8, 80, 80, 22);

            const swordPulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
            ctx.globalAlpha = swordPulse;
            ctx.fillStyle = '#FCD34D';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('⚔ SWORD', 16, 95);
            ctx.globalAlpha = 1;
        }

        // === Health Warning Flash ===
        if (health === 1) {
            const flash = Math.sin(Date.now() / 200) * 0.08 + 0.08;
            ctx.globalAlpha = flash;
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 1;
        }
    },

    drawInteractPrompt(ctx, x, y, text) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        const textW = text.length * 7 + 16;
        ctx.fillRect(x - textW / 2, y - 8, textW, 18);
        ctx.strokeStyle = '#FCD34D';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - textW / 2, y - 8, textW, 18);
        ctx.fillStyle = '#FCD34D';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y + 5);
    }
};
