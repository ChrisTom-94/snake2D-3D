class GamePanel {
    /**
     *
     * @param {String} mode game mode
     * @param {String} difficult game difficult
     */
    constructor(mode, difficult) {
        this.panel = document.createElement("div");
        this.panel.classList = "panel";
        this.score = 0;
        this.bestScore = localStorage.bestScore;
        this.level = 0;
        this.bestLevel = localStorage.bestLevel;
        this.mode = mode;

        this.sounds = {
            background: new Audio("../../assets/sounds/backgroundSound.wav"),
            getPoint: new Audio("../../assets/sounds/getPoint.wav"),
            gameover: new Audio("../../assets/sounds/gameover.wav"),
        };

        window.addEventListener("mouseleave", () => {
            if (this.sounds.background.paused == false) {
                this.sounds.background.play();
                this.sounds.background.volume = 0.1;
                this.sounds.background.loop = true;
            }
        });

        this.reset(this.mode, difficult);
        document.body.prepend(this.panel);
    }

    /**
     * Reset the panel and set the rights informations dependes on the game mode and difficult
     *
     * @param {String} mode game mode
     * @param {String} difficult game difficult
     */
    reset(mode, difficult) {
        this.mode = mode;
        if (this.mode == "survival") {
            this.updateBestScore();
            this.score = 0;
        } else {
            this.updateBestLevel();
            this.level = 0;
            this.time = this.setCountdown(difficult);
        }
        this.hydrate();
        this.addText();
    }

    /**
     * Hydrate panel
     */
    hydrate() {
        this.text = {};
        this.text = {
            title: "<h1 class='panel__title'>SNAKE</h1>",
            pause: `<p class= 'panel__option'>PAUSE : <span class='hot'> (P)</span></p>`,
            controls: `<p class='panel__option'>CONTROLS : <i>↑</i><i>↓</i><i>→</i><i>←</i></p>`,
            score: `<p class= 'panel__option'>SCORE : <span class='hot'>${this.score}</span></p>`,
            bestScore: `<p class= 'panel__option'>BEST SCORE : <span class='hot'>${this.bestScore}</span></p>`,
            level: `<p class= "panel__option">LEVEL : <span class="hot">${this.level}</span></p>`,
            bestLevel: `<p class= "panel__option">BEST LEVEL : <span class="hot">${this.bestLevel}</span></p>`,
            mode: `<p class= 'panel__option'>MODE : <span class='hot'>${this.mode}</span></p>`,
            time: `<p class= 'panel__option'>TIME LEFT: <span class='hot'>${this.time}</span></p>`,
            screen: '<p class= "panel__option">FULLSCREEN / NORMAL : <span class="hot"> (F)</span></p>',
            sound: '<p class= "panel__option">MUTE / UNMUTE : <span class="hot"> (M)</span></p>',
        };
    }

    /**
     * Add the text in the panel
     */
    addText() {
        this.panel.innerHTML = "";
        for (const text in this.text) {
            let add = true;
            if (this.mode == "survival") {
                if (text == "level" || text == "bestLevel" || text == "time") {
                    add = false;
                }
            }
            if (this.mode == "aventure") {
                if (text == "score" || text == "bestScore") {
                    add = false;
                }
            }
            if (add) this.panel.innerHTML += this.text[text];
        }
    }

    /**
     * Add a score and rehydrate the panel
     */
    addScore() {
        this.score++;
        this.sounds.getPoint.play();
        this.hydrate();
        this.addText();
    }

    /**
     * Add a level and rehydrate the panel
     */
    addLevel() {
        this.level++;
        this.hydrate();
        this.addText();
    }

    /**
     * Check if need to setup new best score or not
     */
    updateBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.bestScore = this.score;
        }
    }

    /**
     * Check if need to setup new best level or not
     */
    updateBestLevel() {
        if (this.level > this.bestLevel) {
            this.bestLevel = this.level;
            localStorage.bestLevel = this.level;
        }
    }

    /**
     * Set Countdown depends on game difficult (in seconds)
     *
     * @param {String} difficult game difficult
     * @return {Number}
     */
    setCountdown(difficult) {
        let seconds;
        if (difficult == "easy") seconds = 40;
        else if (difficult == "medium") seconds = 30;
        else if (difficult == "hard") seconds = 20;
        return seconds;
    }

    /**
     * Start Countdown for adventure mode
     * can use a callback to when Countdown is = 0
     * @param {CallableFunction} callBack
     * @param {String} difficulty
     */
    startCountdown(callBack, difficulty) {
        this.time = this.setCountdown(difficulty);
        let countdown = setInterval(() => {
            if (this.time == 0) {
                clearInterval(countdown);
                this.time = this.setCountdown(this.difficult);
                callBack();
            } else {
                this.time--;
            }
            this.hydrate();
            this.addText();
        }, 1000);

        return countdown;
    }

    /**
     * Clear Countdown
     * @param {Number} id interval id
     */
    pauseCountdown(id) {
        clearInterval(id);
        id = 0;
        return id;
    }

    /**
     * Switch between muted or not
     */
    toggleSounds() {
        for (const sound in this.sounds) {
            if (!this.sounds[sound].muted) {
                this.sounds[sound].muted = true;
                if (sound == "background") this.sounds[sound].loop = false;
            } else {
                this.sounds[sound].muted = false;
                if (sound == "background") this.sounds[sound].loop = true;
            }
        }
    }
}

export default GamePanel;
