import { Ring } from "./Ring.js";
import { GameBoard } from "./Gameboard.js";
import { getRandomInt } from "../functions.js";

class Snake {
    constructor(snakeSize, cellSize, colsMax, rowsMax, headColor) {
        this.snakeSize = snakeSize;
        this.cellSize = cellSize;
        this.direction = null;
        this.snake = new THREE.Group();
        this.head = this.head = new Ring(getRandomInt(1, colsMax - 2), getRandomInt(1, rowsMax - 2), headColor, this.cellSize);
        this.snake.add(this.head.ring);
    }

    /**
     * hydrate snake and put color in each ring
     *
     * @param {GameBoard} gameboard the snake that you want to hydrate
     */
    hydrateSnake(gameboard) {
        for (let i = 1; i < this.snakeSize; i++) {
            let color;
            i == this.snakeSize - 1 ? (color = new THREE.Color(0xb6fc85)) : (color = new THREE.Color(0x63e509));

            let previousRing = this.snake.children[i - 1];
            let ring = new Ring(previousRing.position.x, previousRing.position.z, color, this.cellSize);
            let isAlone = false;
            for (let d = 0; d < 4; d++) {
                let cell = ring.read(d);
                let stateCell = gameboard.getCellState(cell.col, cell.row);
                if (stateCell == 0) {
                    gameboard.setCellState(cell.col, cell.row, 2);
                    ring.ring.position.x = cell.col;
                    ring.ring.position.z = cell.row;
                    this.snake.add(ring.ring);
                    isAlone = true;
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
        this.snake.children[this.snake.children.length - 1].material.color = new THREE.Color(0x63e509);
        let newRing = new Ring(
            this.snake.children[this.snake.children.length - 1].position.x,
            this.snake.children[this.snake.children.length - 1].position.z,
            new THREE.Color(0xb6fc85),
            this.cellSize
        );
        this.snake.add(newRing.ring);
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
     *
     * @param {THREE.Object3D} ground object containing all cellules forming the ground
     * @param {Number} colsMax higher column
     * @param {Number} rowsMax higher row
     */
    update(ground) {
        for (let i = this.snake.children.length - 1; i >= 1; i--) {
            this.snake.children[i].position.set(this.snake.children[i - 1].position.x, 0.5, this.snake.children[i - 1].position.z);
        }
        this.head.move(this.direction, ground);
    }

    /**
     * Move the snake depending on the cell state
     * @param {Number} state next cell state
     */
    move(ground, state) {
        let canMove = this.readCellState(state);
        if (canMove) {
            this.update(ground);
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
        random < 3 ? (this.direction = getRandomInt(0, 3)) : null;
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
                this.direction >= 3 ? (this.direction = 0) : (this.direction += 1);
            } else if (state == 2) {
                let oldDirection = this.direction;
                this.direction = getRandomInt(0, 3);

                if (Math.abs(oldDirection - this.direction) == 2) {
                    this.direction = oldDirection;
                    this.readCellState(2);
                }
            }
            return false;
        }
    }

    /**
     * Check if head get border of the ground
     * @param {Number} colsMax
     * @param {Number} rowssMax
     * @param {CallableFunction} callback
     */
    checkBounds(colsMax, rowsMax, callback) {
        for (const ring of this.snake.children) {
            if (ring.position.x == 0 || ring.position.x == colsMax - 1 || ring.position.z == 0 || ring.position.z == rowsMax - 1) {
                callback();
            }
        }
    }

    /**
     * Return true if distance between snake rings and collider is < 0
     *
     * @param {THREE.Object3D} collider
     * @param {CallableFunction} callback
     * @return {Boolean}
     */
    checkCollision(collider, callback) {
        if (this.head.ring.position.distanceTo(collider.position) <= 0) {
            callback();
            return true;
        } else {
            return false;
        }
    }
}

export default Snake;
