import { OBJLoader } from "../libs/three/examples/jsm/loaders/OBJLoader.js";

class GamePanel {
    fontLoader = new THREE.FontLoader();
    objectLoader = new OBJLoader();
    constructor(mode, difficult) {
        this.level = 0;
        this.bestLevel = localStorage.bestLevel;
        this.score = 0;
        this.bestScore = localStorage.bestScore;
        this.mode = mode;

        this.panel = this.createPanel();
        this.dynamicsTexts = new THREE.Group();

        // TITILE
        this.addText("SNAKE", new THREE.Color(0x00ff00), 3, new THREE.Vector3(-11, 5, 0.5));

        // CONTROLS
        this.addText("MOVE : ", new THREE.Color(0xffffff), 1, new THREE.Vector3(2, 1, 0.5));
        this.addText("PAUSE : ", new THREE.Color(0xffffff), 1, new THREE.Vector3(2, -3, 0.5));
        this.addArrowsTouch(new THREE.Vector3(9, 0.5, 0.5));
        this.addKeyPTouch(new THREE.Vector3(9, -5, 0.5));

        // SOUNDS
        this.sounds = {
            background: new Audio("../../assets/sounds/backgroundSound.wav"),
            getPoint: new Audio("../../assets/sounds/getPoint.wav"),
            gameover: new Audio("../../assets/sounds/gameover.wav"),
        };
        this.sounds.background.play();
        this.sounds.background.loop = true;
        this.sounds.background.volume = 0.1;

        this.panel.add(this.dynamicsTexts);
        this.reset(this.mode, difficult);
    }

    createPanel() {
        let panel = new THREE.Mesh(new THREE.PlaneGeometry(25, 20), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
        panel.position.set(15, 12, -5);
        panel.name = "panel";

        return panel;
    }

    /**
     * Reset the panel
     */
    reset(mode, difficult) {
        this.mode = mode;
        if (this.mode == "survival") {
            this.panel.remove(this.panel.getObjectByName(`${this.score}`));
            this.updateBestScore();
            this.score = 0;
        } else {
            this.panel.remove(this.panel.getObjectByName(`${this.level}`));
            this.updateBestLevel();
            this.level = 0;
            this.time = this.setCountdown(difficult);
        }
        this.hydrate(difficult);
    }

    /**
     * Hydrate panel
     */
    hydrate(difficult) {
        this.dynamicsTexts.children = [];

        if (this.mode == "survival") {
            // SCORES
            this.addText("SCORE : ", new THREE.Color(0xffffff), 1, new THREE.Vector3(-11, 1, 0.5), null, true);
            this.addText(`${this.score}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-6, 1, 0.5), "score", true);
            this.addText("BEST SCORE : ", new THREE.Color(0xffffff), 1, new THREE.Vector3(-11, -1, 0.5), null, true);
            this.addText(`${this.bestScore}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-3, -1, 0.5), "best-score", true);
        } else {
            // LEVELS
            this.addText("LEVEL : ", new THREE.Color(0xffffff), 1, new THREE.Vector3(-11, 1, 0.5), null, true);
            this.addText(`${this.level}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-6, 1, 0.5), "level", true);
            this.addText("BEST LEVEL : ", new THREE.Color(0xffffff), 1, new THREE.Vector3(-11, -1, 0.5), null, true);
            this.addText(`${this.bestLevel}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-3, -1, 0.5), "best-level", true);
            this.addText("TIME LEFT : ", new THREE.Color(0xffffff), 1, new THREE.Vector3(-11, -3, 0.5), null, true);
            this.setCountdown(difficult);
            this.addText(`${this.time}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-3.5, -3, 0.5), "time", true);
        }

        // MODE
        this.addText("MODE : ", new THREE.Color(0xffffff), 1, new THREE.Vector3(-11, -6, 0.5), null, true);
        this.addText(`${this.mode}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-6, -6, 0.5), null, true);
    }

    /**
     * Add text in the panel
     *
     * @param {String} text text to add
     * @param {THREE.Color} color text color
     * @param {Number} size text size
     * @param {THREE.Vector3} position text position
     * @param {String} name name object
     */
    addText(text, color, size, position, name = null, dynamic = false) {
        let textMesh;
        this.fontLoader.load("../../scripts/libs/three/examples/fonts/gentilis_regular.typeface.json", (font) => {
            let textGeometry = new THREE.TextGeometry(text, {
                font: font,
                size: size,
                height: 0.5,
            });

            let textMaterial = new THREE.MeshBasicMaterial({ color: color });
            textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.name = name;
            textMesh.position.set(position.x, position.y, position.z);

            if (!dynamic) this.panel.add(textMesh);
            else this.dynamicsTexts.add(textMesh);
        });
    }

    /**
     * Add 3d model containing arrows keys
     * @param {THREE.Vector3} position
     */
    addArrowsTouch(position) {
        this.objectLoader.load("../../assets/3dModels/touchesClavier.obj", (object) => {
            object.scale.set(0.01, 0.01, 0.01);
            object.position.set(position.x, position.y, position.z);
            object.rotation.set(0, -33, 0);

            // just color keytouch and not arrows
            for (let i = 2; i < object.children.length; i++) {
                object.children[i].material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                i += 2;
            }
            this.panel.add(object);
        });
    }

    /**
     * Add 3d model containing P key
     * @param {THREE.Vector3} position
     */
    addKeyPTouch(position) {
        this.objectLoader.load("../../assets/3dModels/ptouche.obj", (object) => {
            object.scale.set(0.015, 0.015, 0.015);
            object.position.set(position.x, position.y, position.z);
            object.rotation.set(0, -33, 0);
            object.children[object.children.length - 1].material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            this.panel.add(object);
        });
    }

    /**
     * Increase score and play sound
     */
    addScore() {
        this.dynamicsTexts.remove(this.dynamicsTexts.getObjectByName(`score`));
        this.score++;
        this.addText(`${this.score}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-6, 1, 0.5), "score", true);
        this.sounds.getPoint.play();
    }

    /**
     * Increase level and play sound
     */
    addLevel() {
        this.dynamicsTexts.remove(this.dynamicsTexts.getObjectByName(`level`));
        this.level++;
        this.addText(`${this.level}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-6, 1, 0.5), "level", true);
    }

    /**
     * Check if need to setup new best score or not
     */
    updateBestScore() {
        if (this.score > this.bestScore) {
            localStorage.bestScore = this.score;
            this.bestScore = this.score;
            this.dynamicsTexts.remove(this.dynamicsTexts.getObjectByName(`best-score`));
            this.addText(`${this.bestScore}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-3, -1, 0.5), "best-score", true);
        }
    }

    /**
     * Check if need to setup new best level or not
     */
    updateBestLevel() {
        if (this.level > this.bestLevel) {
            localStorage.bestLevel = this.level;
            this.bestLevel = this.level;
            this.dynamicsTexts.remove(this.dynamicsTexts.getObjectByName(`best-level`));
            this.addText(`${this.bestLevel}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-3, -1, 0.5), "best-level", true);
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
    startCountdown(callBack, difficult) {
        this.time = this.setCountdown(difficult);
        this.dynamicsTexts.remove(this.dynamicsTexts.getObjectByName(`time`));
        let countdown = setInterval(() => {
            this.dynamicsTexts.remove(this.dynamicsTexts.getObjectByName("time"));
            if (this.time == 0) {
                clearInterval(countdown);
                alert("So sick, takes care to time left when you are playing aventure mode");
                this.time = this.setCountdown(this.difficult);
                callBack();
            } else {
                this.time--;
            }
            this.addText(`${this.time}`, new THREE.Color(0xff0000), 1, new THREE.Vector3(-3.5, -3, 0.5), "time", true);
        }, 1000);

        return countdown;
    }

    /**
     * Clear countdown and return id 0
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

export { GamePanel };
