import { OrbitControls } from "../libs/three/examples/jsm/controls/OrbitControls.js";
import { Snake } from "./Snake.js";
import { GamePanel } from "./GamePanel.js";
import { getRandomInt } from "../functions.js";

class GameBoard {
    // THREEJS OBJECTS
    _scene = new THREE.Scene();
    _camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    _renderer = new THREE.WebGLRenderer();
    _controls = new OrbitControls(this._camera, this._renderer.domElement);

    constructor(cols, rows, cellSize) {
        // GROUND PARAMETERS
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;

        // GAME PARAMETERS
        this.timestamp = 0;
        this.isCountingDown = 0;
        this.isPlaying = false;
        this.difficulty = localStorage.difficulty;
        this.gameMode = localStorage.gameMode;

        this._scene.background = new THREE.Color(0xffffff);

        // GAMEPANEL
        this.gamePanel = new GamePanel(this.gameMode, this.difficulty);

        // FOOD
        this.foods = new THREE.Group();
        this.food = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({ color: 0xf6fc2d }));

        // CAMERA
        this._camera.position.set(16, 20, 36);
        this._camera.rotation.set(0.15, 0, 0);
        this._camera.lookAt(this.cols / 2, 0, this.rows / 2);

        // RENDERER
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._renderer.domElement);

        // GUI
        this.addGui();

        // GAME
        this.resetGame();

        // CONTROLS CAMERA
        this._controls.update();

        // KEY CONTROLLER
        this.keyListenerController();

        // ANIMATION
        requestAnimationFrame(this.anim.bind(this));
    }

    /**
     * Prepare the scene with all elements to can play
     */
    resetGame() {
        this.isPlaying = false;
        this.setGameDifficulty();
        // CLEAR SCENE
        this._scene.clear();

        // GAMEPANEL
        this.gamePanel.reset(this.gameMode, this.difficulty);
        this._scene.add(this.gamePanel.panel);

        // GROUND
        this.ground = new THREE.Group();
        this.makeGround();
        this._scene.add(this.ground);

        // STONES
        this.stones = new THREE.Group();
        this.makeStones(this.nbStones);
        this._scene.add(this.stones);

        // FOOD
        this.spawnFood();
        this._scene.add(this.foods);

        // SNAKE PLAYER
        this.playerSnake = new Snake(4, this.cellSize, this.cols - 1, this.rows - 1, new THREE.Color(0xfe9a01));
        this.playerSnake.hydrateSnake(this);
        this._scene.add(this.playerSnake.snake);

        // IA SNAKES
        this.snakes = {
            objects: new THREE.Group(),
            instances: [],
        };
        this.makeSnakes(this.nbSnakes);
    }

    /**
     * Set game parameters dependes on difficult
     */
    setGameDifficulty() {
        if (this.difficulty == "easy") {
            this.nbStones = (this.cols + this.rows) / 5;
            this.nbSnakes = 1;
            this.gameSpeed = 5;
        } else if (this.difficulty == "medium") {
            this.nbStones = (this.cols + this.rows) / 3;
            this.nbSnakes = 2;
            this.gameSpeed = 10;
        } else if (this.difficulty == "hard") {
            this.nbStones = (this.cols + this.rows) / 2;
            this.nbSnakes = 3;
            this.gameSpeed = 15;
        }
    }

    /**
     * Create grid for ground
     */
    makeGround() {
        let state;
        let color;
        let object;
        for (let col = 0; col <= this.cols - 1; col++) {
            for (let row = 0; row <= this.rows - 1; row++) {
                if (col == 0 || col == this.cols - 1 || row == 0 || row == this.rows - 1) {
                    state = 2;

                    color = new THREE.Color(0xff0000);
                    object = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: color }));
                    object.position.set(col, 0.5, row);
                } else {
                    state = 0;

                    color = new THREE.Color(0x000000);
                    const cube = new THREE.BoxGeometry(this.cellSize, 0, this.cellSize);
                    const edges = new THREE.EdgesGeometry(cube);
                    object = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: color }));
                    object.position.set(col, 0, row);
                }
                object.userData.index = row * this.rows + col;
                object.userData.state = state;

                this.ground.add(object);
            }
        }
        this.ground.name = "ground";
    }

    /**
     * create stones to add into ground
     *
     * @param {Number} nbStones stones number to generate
     */
    makeStones(nbStones) {
        this.stones.children = [];
        const nbOfCells = this.ground.children.length - 1;
        while (nbStones > 0) {
            const cell = this.ground.children[getRandomInt(0, nbOfCells)];
            if (cell.position.x != 1 && cell.position.x != this.cols - 2 && cell.position.z != 1 && cell.position.z != this.rows - 2) {
                if (cell.userData.state == 0) {
                    // check if another stone is close to cell
                    let isAlone = true;
                    for (let i = 0; i <= this.stones.children.length - 1; i++) {
                        if (
                            this.stones.children[i].position.x == cell.position.x + 1 ||
                            this.stones.children[i].position.z == cell.position.z + 1 ||
                            this.stones.children[i].position.x == cell.position.x - 1 ||
                            this.stones.children[i].position.z == cell.position.z - 1
                        ) {
                            isAlone = false;
                        }
                        if (!isAlone) break;
                    }
                    if (isAlone) {
                        cell.userData.state = 1;

                        let stone = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x000000 }));
                        stone.position.set(cell.position.x, 0.5, cell.position.z);
                        this.stones.add(stone);
                        nbStones--;
                    }
                }
            }
        }
    }

    /**
     *  Set food position
     */
    spawnFood(foodsNumber) {
        this.foods.children = [];
        let foods = foodsNumber || 1;
        while (foods > 0) {
            let randomCell = this.ground.children[getRandomInt(0, this.ground.children.length - 1)];
            if (randomCell.userData.state == 0) {
                let isAlone = true;
                for (let i = 0; i < this.foods.children.length; i++) {
                    let otherFood = this.foods.children[i];
                    if (randomCell.position.x == otherFood.position.x && randomCell.position.z == otherFood.position.z) {
                        isAlone = false;
                    }
                    if (!isAlone) break;
                }
                if (isAlone) {
                    let food = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({ color: 0xf6fc2d }));
                    food.position.set(randomCell.position.x, 0.5, randomCell.position.z);
                    this.foods.add(food);
                    foods--;
                }
            }
        }
    }

    /**
     * when player get food, can call callback to do something
     * @param {Object} food object containing food coordinates
     * @param {CallableFunction} callBack
     */
    getFood(food, callBack) {
        if (this.gameMode == "survival") {
            this.gamePanel.addScore();
            callBack();
        } else if (this.gameMode == "aventure") {
            this.foods.remove(food);
            if (this.foods.children.length == 0) {
                this.spawnFood(this.gamePanel.level + 1);
                this.isCountingDown = this.gamePanel.pauseCountdown(this.isCountingDown);
                this.gamePanel.addLevel();
                callBack();
            }
        }
        this.playerSnake.addRing();
    }

    /**
     * Create several snakes
     *
     * @param {Number} n
     */
    makeSnakes(n = 3) {
        for (let i = 0; i < n; i++) {
            let snake = new Snake(getRandomInt(4, 8), this.cellSize, this.cols - 1, this.rows - 1, new THREE.Color(0x2d8020));
            snake.hydrateSnake(this);
            this.snakes.instances = [...this.snakes.instances, snake];
            snake.direction = getRandomInt(0, 3);
            this.snakes.objects.add(snake.snake);
            this._scene.add(this.snakes.objects);
        }
    }

    /**
     * Update the position of the snake and set states of cells where snake is
     * @param {Snake} snake snake to update
     */
    updateSnake(snake, object) {
        let lastCell = {
            col: snake.snake.children[snake.snake.children.length - 1].position.x,
            row: snake.snake.children[snake.snake.children.length - 1].position.z,
        };

        // if player we just update position
        if (snake == this.playerSnake) {
            snake.update(this.ground);
        } else {
            // else AI snake check next cell state
            let cell = snake.head.read(snake.direction);
            let state = this.getCellState(cell.col, cell.row);
            snake.move(this.ground, state);
        }
        this.updateStateCell(object ? object : snake.snake, lastCell);
    }

    /**
     * Update state of cell in coordinates (col, line)
     *
     * @param {Number} col cell column
     * @param {Number} row cell row
     * @param {Number} state new cell state (0 || 1 || 2)
     */
    setCellState(col, row, state) {
        let isUpdated = false;
        let groundLength = this.ground.children.length - 1;
        for (let i = 0; i <= groundLength; i++) {
            if (this.ground.children[i].position.x == col && this.ground.children[i].position.z == row) {
                this.ground.children[i].userData.state = state;

                isUpdated = true;
            }

            if (isUpdated) break;
        }
    }

    /**
     * Return the state of the cell at coordinate col, row
     *
     * @param {Number} col cell column
     * @param {Number} row cell row
     * @return {Number}
     */
    getCellState(col, row) {
        let state;
        for (let i = 0; i < this.ground.children.length; i++) {
            let cell = this.ground.children[i];
            if (cell.position.x == col && cell.position.z == row) {
                if (cell.userData.state == 0) state = 0;
                else if (cell.userData.state == 1) state = 1;
                else if (cell.userData.state == 2) state = 2;

                return state;
            }
        }
    }

    /**
     * Set state of specific cellule
     *
     * @param {THREE.Group} group
     */
    updateStateCell(group, lastCell) {
        this.setCellState(lastCell.col, lastCell.row, 0);
        let childrenLength = group.children.length - 1;
        for (let i = childrenLength; i >= 0; i--) {
            this.setCellState(group.children[i].position.x, group.children[i].position.z, 2);
        }
    }

    /**
     * Add GUI to control game options
     */
    addGui() {
        this.gui = {};
        this.gui.controlObject = {
            difficulty: this.difficulty,
            mode: this.gameMode,
            speed: this.gameSpeed,
            sound: true,
        };
        this.gui.UI = new dat.GUI();

        this.gui.UI.gameOptions = this.gui.UI.addFolder("game options");
        this.gui.UI.gameOptions
            .add(this.gui.controlObject, "difficulty", ["easy", "medium", "hard"])
            .name("game difficulty")
            .setValue(`${localStorage.difficulty}`)
            .onChange((value) => {
                this.difficulty = value;
                localStorage.difficulty = value;
                this.setGameDifficulty();
                this.resetGame();
            });
        this.gui.UI.gameOptions
            .add(this.gui.controlObject, "mode", ["survival", "aventure"])
            .name("game mode")
            .setValue(`${localStorage.gameMode}`)
            .onChange((value) => {
                this.gameMode = value;
                localStorage.gameMode = value;
                this.resetGame();
            });
        this.gui.UI.gameOptions
            .add(this.gui.controlObject, "sound")
            .name("sound")
            .setValue(true)
            .onChange(() => {
                this.gamePanel.toggleSounds();
            });
    }

    /**
     * listen keydown event to control snake and start/pause the game and mute/unmute sounds
     */
    keyListenerController() {
        window.addEventListener("keydown", (e) => {
            if (e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "ArrowUp" || e.key == "ArrowDown") {
                // start Countdown if game mode is adventure
                if (this.isCountingDown == 0 && this.gameMode == "aventure") {
                    this.isCountingDown = this.gamePanel.startCountdown(this.resetGame.bind(this), this.difficulty);
                }
                // play
                this.playerSnake.control(e);
                this.isPlaying = true;
            }
            if (e.key == "p") {
                // pause
                this.isPlaying = false;
                if (this.isCountingDown != 0 && this.gameMode == "aventure") {
                    // desactive Countdown if game mode is aventure
                    this.isCountingDown = this.gamePanel.pauseCountdown(this.isCountingDown);
                }
            }
            if (e.key == "m") this.gamePanel.toggleSounds();
        });
        window.addEventListener("focus", () => {
            this.gamePanel.sounds.background.play();
        });
        window.addEventListener("blur", () => {
            this.gamePanel.sounds.background.pause();
        });
    }

    anim(currentTime) {
        requestAnimationFrame(this.anim.bind(this));

        // RENDER
        this._renderer.render(this._scene, this._camera);

        // RESIZE RENDER AND CAMERA
        window.addEventListener("resize", () => {
            this._renderer.setSize(window.innerWidth, window.innerHeight);
            this._camera.aspect = window.innerWidth / window.innerHeight;
            this._camera.updateProjectionMatrix();
        });

        const fpsSinceLastRender = (currentTime - this.timestamp) / 1000;
        if (fpsSinceLastRender < 1 / this.gameSpeed) return;
        this.timestamp = currentTime;

        if (this.isPlaying) {
            // PLAYER SNAKE MOUVEMENT
            this.updateSnake(this.playerSnake);

            //PLAYER SNAKE AUTO-COLLISION
            for (let ring = 1; ring < this.playerSnake.snake.children.length; ring++) {
                this.playerSnake.checkCollision(this.playerSnake.snake.children[ring], () => {
                    this.resetGame();
                });
            }

            // AI SNAKES MOUVEMENT
            for (let i = 0; i < this.snakes.objects.children.length; i++) {
                this.updateSnake(this.snakes.instances[i], this.snakes.objects.children[i]);
                for (const ring of this.snakes.objects.children[i].children) {
                    this.playerSnake.checkCollision(ring, () => this.resetGame());
                }
            }

            //STONES COLLISION
            this.stones.children.forEach((stone) => {
                this.playerSnake.checkCollision(stone, () => this.resetGame());
            });

            // FOOD COLLISION
            for (const food of this.foods.children) {
                this.playerSnake.checkCollision(food, () => {
                    if (this.gameMode == "survival") {
                        this.getFood(food, this.spawnFood.bind(this));
                    } else if (this.gameMode == "aventure") {
                        this.getFood(food, () => {
                            this.isCountingDown = this.gamePanel.startCountdown(this.resetGame.bind(this), this.difficulty);
                        });
                    }
                });
            }

            // PLAYER SNAKE / AI SNAKES COLLISION
            this.snakes.objects.children.forEach((snake) => {
                snake.children.forEach((ring) => {
                    this.playerSnake.checkCollision(ring, () => {
                        this.resetGame();
                    });
                });
            });
        }

        // stop countdown if not playing
        if (!this.isPlaying) {
            if (this.isCountingDown != 0 && this.gameMode == "aventure") {
                this.isCountingDown = this.gamePanel.pauseCountdown(this.isCountingDown);
            }
        }
        this.playerSnake.checkBounds(this.cols, this.rows, () => this.resetGame.bind(this));
    }
}

export { GameBoard };
