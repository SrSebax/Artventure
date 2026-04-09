export class HUD {
    constructor() {
        this.livesEl = document.getElementById('livesBar');
        this.coinsEl = document.getElementById('coinsBar');
        this.levelEl = document.getElementById('levelBar');
        this.timerEl = document.getElementById('timerBar');
        this.msgBox = document.getElementById('message');
        this.msgTitle = document.getElementById('msgTitle');
        this.msgText = document.getElementById('msgText');
        this.msgStats = document.getElementById('msgStats');
        this.msgBtn = document.getElementById('msgBtn');
        this.msgRetryBtn = document.getElementById('msgRetryBtn');
    }

    update(lives, coins, levelIdx, timer) {
        this.livesEl.textContent = `❤️ x${lives}`;
        this.coinsEl.textContent = `🪙 ${coins}`;
        this.levelEl.textContent = `Mundo ${levelIdx + 1}`;
        this.timerEl.textContent = `⏱ ${timer}`;
    }

    showMessage(title, text, btnLabel, callback, stats = "", onRetry = null) {
        this.msgTitle.textContent = title;
        this.msgText.textContent = text;
        this.msgStats.textContent = stats;
        this.msgBtn.textContent = btnLabel;
        
        this.msgBox.style.display = 'block';
        
        if (onRetry) {
            this.msgRetryBtn.style.display = 'block';
            this.msgRetryBtn.onclick = () => {
                this.msgBox.style.display = 'none';
                onRetry();
            };
        } else {
            this.msgRetryBtn.style.display = 'none';
        }

        this.msgBtn.onclick = () => {
            this.msgBox.style.display = 'none';
            if (callback) callback();
        };
    }

    updateLevelSelector(levelsData) {
        levelsData.forEach((_, i) => {
            const data = localStorage.getItem(`level_${i}_score`);
            const label = document.getElementById(`best-${i}`);
            if (data && label) {
                const { score, time } = JSON.parse(data);
                label.textContent = `Puntuación: ${score} 🪙 | ${60 - time}s`;
            }
        });
    }
}
