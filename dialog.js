// ── Dialog System with Voice-Over ──
const Dialog = {
    active: false,
    lines: [],
    currentLine: 0,
    charIndex: 0,
    charTimer: 0,
    charSpeed: 0.03,
    displayedText: '',
    onComplete: null,
    voiceType: 'narrator',
    lastSpoken: -1,

    show(lines, onComplete, voiceType) {
        this.active = true;
        this.lines = lines;
        this.currentLine = 0;
        this.charIndex = 0;
        this.charTimer = 0;
        this.displayedText = '';
        this.onComplete = onComplete || null;
        this.voiceType = voiceType || 'narrator';
        this.lastSpoken = -1;
        // Speak first line
        this._speakCurrentLine();
    },

    _speakCurrentLine() {
        if (this.currentLine !== this.lastSpoken && this.currentLine < this.lines.length) {
            this.lastSpoken = this.currentLine;
            Audio.speak(this.lines[this.currentLine], this.voiceType);
        }
    },

    update(dt) {
        if (!this.active) return;

        const currentText = this.lines[this.currentLine];

        if (this.charIndex < currentText.length) {
            this.charTimer += dt;
            if (this.charTimer >= this.charSpeed) {
                this.charIndex++;
                this.displayedText = currentText.substring(0, this.charIndex);
                this.charTimer = 0;
            }

            if (Input.interact) {
                this.charIndex = currentText.length;
                this.displayedText = currentText;
            }
        } else {
            if (Input.interact) {
                this.currentLine++;
                Audio.stopSpeaking();
                if (this.currentLine >= this.lines.length) {
                    this.active = false;
                    if (this.onComplete) this.onComplete();
                } else {
                    this.charIndex = 0;
                    this.charTimer = 0;
                    this.displayedText = '';
                    this._speakCurrentLine();
                }
            }
        }
    },

    draw(ctx, canvasW, canvasH) {
        if (!this.active) return;

        const boxH = 90;
        const boxY = canvasH - boxH - 10;
        const boxX = 20;
        const boxW = canvasW - 40;

        // Background with more depth
        ctx.fillStyle = 'rgba(10, 8, 20, 0.94)';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Glow border
        ctx.shadowColor = '#6D28D9';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.shadowBlur = 0;

        // Top accent
        ctx.fillStyle = '#8B5CF6';
        ctx.fillRect(boxX, boxY, boxW, 2);

        // Voice type label
        ctx.fillStyle = '#6B7280';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        const labels = { narrator: '🎙 NARRATOR', villager: '🏠 VILLAGER', merchant: '🛒 MERCHANT', elder: '👴 ELDER', child: '👶 CHILD', guard: '⚔ GUARD', urgent: '⚡ URGENT' };
        ctx.fillText(labels[this.voiceType] || '🎙 NARRATOR', boxX + 15, boxY + 14);

        // Text
        ctx.fillStyle = '#E5E7EB';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';

        const maxWidth = boxW - 30;
        const words = this.displayedText.split(' ');
        let line = '';
        let y = boxY + 35;

        for (const word of words) {
            const testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > maxWidth) {
                ctx.fillText(line, boxX + 15, y);
                line = word + ' ';
                y += 20;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, boxX + 15, y);

        // Continue prompt
        if (this.charIndex >= this.lines[this.currentLine].length) {
            const blink = Math.sin(Date.now() / 300) > 0;
            if (blink) {
                ctx.fillStyle = '#FCD34D';
                ctx.fillText('▼', boxX + boxW - 30, boxY + boxH - 12);
            }
            ctx.fillStyle = '#6B7280';
            ctx.font = '10px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${this.currentLine + 1}/${this.lines.length}`, boxX + boxW - 15, boxY + 14);
        }

        // Speaking indicator
        if (Audio.voiceSynth && Audio.voiceSynth.speaking) {
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#4ADE80';
            ctx.fillRect(boxX + boxW - 50, boxY + 6, 6, 6);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#6B7280';
            ctx.font = '8px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('🔊', boxX + boxW - 55, boxY + 14);
        }
    }
};
