import { Ring } from "./Ring.js";
import { getRandomInt } from "../functions.js";

class Snake {
    /**
     *
     * @param {Number} size snake size (numbers of rings)
     * @param {Number} colMax last column index
     * @param {Number} rowMax last row index
     * @param {Number} direction where to snake move
     */
    constructor(snakeSize, cellSize, colMax, rowMax, color) {
        this.snakeSize = snakeSize;
        this.cellSize = cellSize;
        this.head = new Ring(getRandomInt(1, colMax - 1), getRandomInt(1, rowMax - 1), color);
        this.snake = [this.head];
    }

    /**
     * hydrate snake and put color in each ring
     *
     * @param {GameBoard} gameboard the snake that you want to hydrate
     */
    hydrate(gameboard) {
        for (let i = 1; i < this.snakeSize; i++) {
            let color;
            i == this.snakeSize - 1 ? (color = "blue") : (color = "lightGreen");

            let previousRing = this.snake[i - 1];
            let ring = Ring.copy(previousRing, color);
            let isAlone = false;
            for (let d = 0; d < 4; d++) {
                let cell = ring.read(d);
                let stateCell = gameboard.getCellState(cell.col, cell.row);
                if (stateCell == 0) {
                    ring.col = cell.col;
                    ring.row = cell.row;
                    this.snake = [...this.snake, ring];
                    isAlone = true;
                    gameboard.setCellState(cell.col, cell.row, 2);
                }
                if (isAlone) break;
                if (d == 3 && !isAlone) {
                    return new Snake(this.snakeSize, this.cellSize, gameboard.colsMax, gameboard.rowsMax);
                }
            }
        }
    }

    /**
     * add new ring in snake
     */
    addRing() {
        this.snake[this.snake.length - 1].color = "lightgreen";
        this.snake = [...this.snake, Ring.copy(this.snake[this.snake.length - 1], "blue")];
    }

    /**
     * Draw the snake
     * @param {CanvasRenderingContext2D} ctx canvas context
     */
    draw(ctx) {
        for (const ring in this.snake) {
            this.snake[ring].draw(ctx, this.cellSize);
        }
    }

    /**
     * Update snake position
     */
    update() {
        for (let i = this.snake.length - 1; i >= 1; --i) {
            this.snake[i] = Ring.copy(this.snake[i - 1], this.snake[i].color);
        }
        this.head.move(this.direction);
    }

    /**
     * Move the snake depending on the cell state
     * @param {Number} state next cell state
     */
    move(state) {
        let canMove = this.readCellState(state);
        if (canMove) {
            this.update();
        }
        this.randomMove();
    }

    /**
     * Get a random number between 0 and 10
     * and if this number is <= 3, we change snake direction randomly
     */
    randomMove() {
        let random = getRandomInt(0, 10);
        let oldDirection = this.direction;
        random <= 3 ? (this.direction = getRandomInt(0, 3)) : null;
        if (Math.abs(oldDirection - this.direction) == 2) {
            this.randomMove();
        }
    }

    /**
     * Modify snake direction depending on the cell state
     * @param {Number} state cell state
     * @returns {Boolean}
     */
    readCellState(state) {
        if (state == 0) {
            return true;
        } else {
            if (state == 1) {
                this.direction == 3 ? (this.direction = 0) : (this.direction += 1);
            } else if (state == 2) {
                let oldDirection = this.direction;
                this.direction = getRandomInt(0, 3);

                if (Math.abs(oldDirection - this.direction) == 2) {
                    this.readCellState(2);
                }
            }
            return false;
        }
    }

    /**
     * allow to control snake with keypad
     *
     * @param {Event} e keydown event
     */
    control(e) {
        if (e.key == "ArrowUp" && this.direction !== 2) this.direction = 0;
        else if (e.key == "ArrowRight" && this.direction !== 3) this.direction = 1;
        else if (e.key == "ArrowDown" && this.direction !== 0) this.direction = 2;
        else if (e.key == "ArrowLeft" && this.direction !== 1) this.direction = 3;
    }

    /**
     * Check if head get border of the ground
     * @param {Number} colsMax
     * @param {Number} rowssMax
     * @param {CallableFunction} callback
     */
    checkBounds(colsMax, rowsMax, callback) {
        if (this.head.col == 0 || this.head.col == colsMax - 1 || this.head.row == 0 || this.head.row == rowsMax - 1) {
            callback();
        }
    }
    /**
     * Return true and use a callback if distance between snake rings and collider is < 0
     *
     * @param {Object} coordinates collider
     * @param {CallableFunction} callback
     * @return {Boolean}
     */
    checkCollision(coordinates, callback) {
        if (this.head.col == coordinates.col && this.head.row == coordinates.row) {
            callback();
            return true;
        } else {
            return false;
        }
    }
}

export default Snake;
