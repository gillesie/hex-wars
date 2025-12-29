class HexGrid {
    constructor(radius) {
        this.radius = radius;
        this.tiles = new Map(); // Key: "q,r", Value: TileObject
        this.generateMap();
    }

    generateMap() {
        // Generate a hexagonal shape map
        for (let q = -this.radius; q <= this.radius; q++) {
            let r1 = Math.max(-this.radius, -q - this.radius);
            let r2 = Math.min(this.radius, -q + this.radius);
            for (let r = r1; r <= r2; r++) {
                const id = `${q},${r}`;
                this.tiles.set(id, {
                    id: id,
                    q: q, 
                    r: r,
                    owner: null, // 'player1', 'player2', or null
                    type: 'empty', // 'monolith', 'bastion'
                    unit: null,
                    stability: 100
                });
            }
        }
    }

    getTile(q, r) {
        return this.tiles.get(`${q},${r}`);
    }

    // Get neighbors for pathfinding or adjacency checks
    getNeighbors(q, r) {
        const directions = [
            [1, 0], [1, -1], [0, -1],
            [-1, 0], [-1, 1], [0, 1]
        ];
        const neighbors = [];
        for (let dir of directions) {
            const neighbor = this.getTile(q + dir[0], r + dir[1]);
            if (neighbor) neighbors.push(neighbor);
        }
        return neighbors;
    }
}

module.exports = HexGrid;