import { Snake } from "./Snake.js";
import { GamePanel } from "./GamePanel.js";
import { getRandomInt } from "../functions.js";

class GameBoard {
    _canvas = document.createElement("canvas");
    _ctx = this._canvas.getContext("2d");
    constructor(cols, rows, cellSize) {
        // BOARD PROPERTIES
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;

        // GAME PROPERTIES
        this.timestamp = 0;
        this.isCountingDown = 0;
        this.isPlaying = false;
        this.difficulty = localStorage.difficulty;
        this.gameMode = localStorage.gameMode;

        // GAME PANEL
        this.gamePanel = new GamePanel(this.gameMode, this.difficulty);

        // SET CANVAS
        this._canvas.width = cellSize * cols;
        this._canvas.height = cellSize * rows;
        this._canvas.classList = "canvas";
        document.body.append(this._canvas);

        // SET UP GAMES
        this.resetGame();

        // CONTROL GAME OPTIONS
        this.addGui();

        // KEY CONTROLLER
        this.keyListenerController();

        requestAnimationFrame(this.anim.bind(this));
    }

    /**
     * Prepare the game with all confingurations neededs (difficulty, mode)
     */
    resetGame() {
        this.isPlaying = false;
        this.setGameDifficulty();
        this.gamePanel.reset(this.gameMode, this.difficulty);

        // GROUND
        this.ground = [];
        this.stones = [];
        this.makeGround();

        // FOOD
        this.foods = [];
        if (this.gameMode == "survival") this.spawnFood();
        else if (this.gameMode == "aventure") this.spawnFood(this.gamePanel.level + 1);

        // PLAYER SNAKE
        this.playerSnake = new Snake(4, this.cellSize, this.cols - 1, this.rows - 1, "orange");
        this.playerSnake.hydrate(this);
        this.playerSnake.draw(this._ctx);

        // AI SNAKES
        this.snakes = [];
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
     * Hydrate the ground and add stones
     * each cell will get a state, index and coordinates ;
     */
    makeGround() {
        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                let state;
                row == 0 || row == this.rows - 1 || col == 0 || col == this.cols - 1 ? (state = 2) : (state = 0);

                let cell = {
                    coordinate: {
                        col: col,
                        row: row,
                    },
                    index: row * (this.cols - 1) + col,
                    state: state,
                };
                this.ground = [...this.ground, cell];
            }
        }
        this.makeStones(this.nbStones);
        this.drawGround();
    }

    /**
     * Generate stones in the ground
     */
    makeStones(nbOfStones) {
        const nbOfCells = this.ground.length - 1;
        while (nbOfStones > 0) {
            let random = getRandomInt(0, nbOfCells);
            let cell = this.ground[random];
            if (
                cell.coordinate.col != 1 &&
                cell.coordinate.col != this.cols - 2 &&
                cell.coordinate.row != 1 &&
                cell.coordinate.col != this.rows - 2
            ) {
                if (cell.state == 0) {
                    let isAlone = true;
                    for (let i = 0; i < this.stones.length; i++) {
                        if (
                            this.stones[i].coordinate.col == cell.coordinate.col + 1 ||
                            this.stones[i].coordinate.row == cell.coordinate.row + 1 ||
                            this.stones[i].coordinate.col == cell.coordinate.col - 1 ||
                            this.stones[i].coordinate.row == cell.coordinate.row - 1
                        ) {
                            isAlone = false;
                        }
                        if (!isAlone) break;
                    }
                    if (isAlone) {
                        cell.state = 1;
                        this.stones = [...this.stones, cell];
                        nbOfStones--;
                    }
                }
            }
        }
    }

    /**
     * Draw the ground in canvas
     */
    drawGround() {
        this._ctx.beginPath();
        for (const cell of this.ground) {
            if (cell.state == 1) {
                this._ctx.fillStyle = "rgba(0, 0, 0, 1)";
            } else if (cell.state == 0) {
                this._ctx.fillStyle = "rgba(255, 255, 255, 1)";
            } else if (cell.state == 2) {
                if (
                    cell.coordinate.col == 0 ||
                    cell.coordinate.row == 0 ||
                    cell.coordinate.col == this.cols - 1 ||
                    cell.coordinate.row == this.rows - 1
                ) {
                    this._ctx.fillStyle = "rgba(255, 0, 0, 1)";
                } else {
                    this._ctx.fillStyle = "rgba(255, 255, 255, 1)";
                }
            }
            this._ctx.fillRect(cell.coordinate.col * this.cellSize, cell.coordinate.row * this.cellSize, this.cellSize, this.cellSize);
            this._ctx.strokeRect(cell.coordinate.col * this.cellSize, cell.coordinate.row * this.cellSize, this.cellSize, this.cellSize);
        }
    }

    /**
     * Create several snakes
     *
     * @param {Number} n number of mob snake in the ground
     */
    makeSnakes(n = 3) {
        for (let i = 0; i < n; i++) {
            this.snakes = [...this.snakes, new Snake(getRandomInt(3, 6), this.cellSize, this.cols - 1, this.rows - 1, "green")];

            this.snakes[i].hydrate(this);
            this.snakes[i].draw(this._ctx, this.cellSize);
            this.snakes[i].direction = getRandomInt(0, 3);
        }
    }

    /**
     * Update the position of the snake and set states of cells where snake is
     * @param {Snake} snake snake to update
     */
    updateSnake(snake) {
        let lastCell = {
            col: snake.snake[snake.snake.length - 1].col,
            row: snake.snake[snake.snake.length - 1].row,
        };

        // if player juste update position
        if (snake == this.playerSnake) {
            snake.update();
        } else {
            // else AI snake check next cell state
            let nextCell = snake.head.read(snake.direction);
            let state = this.getCellState(nextCell.col, nextCell.row);
            snake.move(state);
        }
        this.updateStateCell(snake.snake, lastCell);
    }

    /**
     * Draw the food
     */
    drawFood(food) {
        this._ctx.beginPath();
        this._ctx.arc(food.col * this.cellSize + this.cellSize / 2, food.row * this.cellSize + this.cellSize / 2, this.cellSize / 2, 0, Math.PI * 2);
        this._ctx.fillStyle = "orange";
        this._ctx.fill();
        this._ctx.closePath();
    }

    /**
     *  Draw food randomly in the ground
     * @param {Number} foodNumber number of food to spawn
     */
    spawnFood(foodNumber) {
        this.foods = [];
        let foods = foodNumber || 1;
        while (foods > 0) {
            let cell = this.ground[getRandomInt(0, this.ground.length - 1)];
            if (cell.state == 0) {
                let food = {
                    col: cell.coordinate.col,
                    row: cell.coordinate.row,
                };
                let isAlone = true;
                for (const food in this.foods) {
                    if (this.foods[food].col == cell.coordinate.col && this.foods[food].row == cell.coordinate.row) {
                        isAlone = false;
                    }
                    if (!isAlone) break;
                }
                if (isAlone) {
                    this.foods = [...this.foods, food];
                    this.drawFood(food);
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
            let index = this.foods.indexOf(this.foods[food]);
            this.foods.splice(index, 1);
            if (this.foods.length == 0) {
                this.spawnFood(this.gamePanel.level + 1);
                this.isCountingDown = this.gamePanel.pauseCountdown(this.isCountingDown);
                this.gamePanel.addLevel();
                callBack();
            }
        }
        this.playerSnake.addRing();
    }

    /**
     * Update ground cells where snakes moved; put cell in state 2 if snake move on, and 0 when tile is passed
     *
     * @param {Snake[Array]} snake
     * @param {Object} lastCell coordinates of the last cell where the snake tile were
     */
    updateStateCell(snake, lastCell) {
        this.setCellState(lastCell.col, lastCell.row, 0);
        for (let i = snake.length - 1; i >= 0; i--) {
            this.setCellState(snake[i].col, snake[i].row, 2);
        }
    }

    /**
     * Check cellule in coordinates (col, line) and return cell state
     *
     * @param {Number} col cell column
     * @param {Number} row cell row
     * @return {Number} cell state
     */
    getCellState(col, row) {
        for (const cell in this.ground) {
            let index = row * (this.cols - 1) + col;
            if (this.ground[cell].index == index) {
                return this.ground[cell].state;
            }
        }
    }

    /**
     * Update state of cell in coordinates (col, line)
     *
     * @param {Number} col cell column
     * @param {Number} row cell row
     * @param {Number} state new cell state (0 || 1 || 2)
     */
    setCellState(col, row, state) {
        for (const cell in this.ground) {
            if (this.ground[cell].index == row * (this.cols - 1) + col) {
                this.ground[cell].state = state;
            }
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
    }

    /**
     * listen keydown event to control snake and start/pause the game and mute/unmute sounds
     */
    keyListenerController() {
        window.addEventListener("keydown", (e) => {
            if (e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "ArrowUp" || e.key == "ArrowDown") {
                // start countdown if game mode is adventure
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
                    // desactive countdwon if game mode is aventure
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

        const fpsSinceLastRender = (currentTime - this.timestamp) / 1000;
        if (fpsSinceLastRender < 1 / this.gameSpeed) return;

        this.timestamp = currentTime;

        //clear context
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        if (this.isPlaying) {
            // PLAYER SNAKE COLLISION & MOUVEMENT
            this.updateSnake(this.playerSnake);
            this.playerSnake.checkBounds(this.cols, this.rows, this.resetGame.bind(this));
            for (let ring = 1; ring < this.playerSnake.snake.length; ring++) {
                this.playerSnake.checkCollision(this.playerSnake.snake[ring], () => {
                    this.resetGame();
                });
            }

            // AI SNAKES COLLISION & MOUVEMENT
            for (const snake of this.snakes) {
                this.updateSnake(snake);
                for (const ring of snake.snake) {
                    this.playerSnake.checkCollision(ring, () => {
                        this.gamePanel.sounds.gameover.play();
                        this.resetGame();
                    });
                }
            }

            // FOOD COLLISION
            for (const food of this.foods) {
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

            // STONES COLLISION
            for (const stone of this.stones) {
                this.playerSnake.checkCollision(stone.coordinate, () => {
                    this.gamePanel.sounds.gameover.play();
                    this.resetGame();
                });
            }
        }

        // stop countdown if not playing
        if (!this.isPlaying) {
            if (this.isCountingDown != 0 && this.gameMode == "aventure") {
                this.isCountingDown = this.gamePanel.pauseCountdown(this.isCountingDown);
            }
        }

        // GROUND
        this.drawGround();

        // FOODS
        for (const food of this.foods) {
            this.drawFood(food);
        }

        // SNAKES
        for (const snake of this.snakes) {
            snake.draw(this._ctx, this.cellSize);
        }
        this.playerSnake.draw(this._ctx);
    }
}

export { GameBoard };
