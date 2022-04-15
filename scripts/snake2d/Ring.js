class Ring {
    /**
     *
     * @param {Number} col coordinate colounm
     * @param {Number} row coordinate row
     * @param {String} color ring color
     */
    constructor(col, row, color) {
        this.col = col;
        this.row = row;
        this.color = color;
    }

    /**
     * Draw ring in contexte
     * @param {CanvasRenderingContext2D} ctx canvas context
     * @param {Number} celluleSize size of the ring
     */
    draw(ctx, celluleSize) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.col * celluleSize, this.row * celluleSize, celluleSize, celluleSize);
    }

    /**
     * Check which cell the ring have to look depending on him direction
     * @param {Number} direction value of ring direction
     * @returns {Array} coordinates column/row depending on the ring direction
     */
    read(direction) {
        let cell;
        if (direction == 0) return (cell = { col: this.col, row: this.row - 1 });
        if (direction == 1) return (cell = { col: this.col + 1, row: this.row });
        if (direction == 2) return (cell = { col: this.col, row: this.row + 1 });
        if (direction == 3) return (cell = { col: this.col - 1, row: this.row });
    }

    /**
     * move ring depending on the direction
     * @param {Number} direction where to move ring
     */
    move(direction) {
        if (direction == 0) this.row--;
        if (direction == 1) this.col++;
        if (direction == 2) this.row++;
        if (direction == 3) this.col--;
    }

    /**
     *
     * @param {Ring} ring ring to copy coordinate
     * @param {String} color ring color
     */
    static copy(ring, color) {
        return new Ring(ring.col, ring.row, color);
    }
}

export default Ring;
