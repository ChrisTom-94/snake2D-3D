class Ring {
    constructor(col, row, color, size) {
        this.col = col;
        this.row = row;
        this.size = size;
        this.ring = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: color }));
        this.ring.position.set(this.col, 0.5, this.row);
    }

    /**
     * Place ring in the ground getting position from cellules
     *
     * @param {THREE.Object3D} ground object containing all cellules forming the ground
     */
    position(ground) {
        ground.children.forEach((cell) => {
            if (cell.position.x == this.col && cell.position.z == this.row) {
                this.ring.position.set(cell.position.x, 0.5, cell.position.z);
            }
        });
    }

    /**
     *
     * @param {Number} direction ring direction (0 - up) / (1 - right)...
     * @param {THREE.Object3D} ground object containing all cellules forming the ground
     * @param {Number} colsMax higher column
     * @param {Number} rowsMax higher row
     */
    move(direction, ground) {
        if (direction == 0) this.row -= this.size;
        if (direction == 1) this.col += this.size;
        if (direction == 2) this.row += this.size;
        if (direction == 3) this.col -= this.size;

        this.position(ground);
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
     *
     * @param {Ring} ring
     */
    copy(ring) {
        this.ring.position.x = ring.ring.position.x;
        this.ring.position.z = ring.ring.position.z;
    }
}

export default Ring;
