class Automaton {
    constructor(game, myPlayerId) {
        this.game = game;
        this.id = myPlayerId;
    }

    decideMove() {
        const grid = this.game.grid;
        
        // 1. Find all my units
        const myUnits = [];
        for (let tile of grid.tiles.values()) {
            if (tile.unit && tile.unit.owner === this.id) {
                myUnits.push(tile);
            }
        }

        if (myUnits.length === 0) return;

        // 2. Determine Action: Attack -> Expand -> Random
        const unitTile = myUnits[Math.floor(Math.random() * myUnits.length)];
        const neighbors = grid.getNeighbors(unitTile.q, unitTile.r);
        
        // Check for Attack opportunities
        const enemies = neighbors.filter(n => n.unit && n.unit.owner !== this.id);
        if (enemies.length > 0) {
            const target = enemies[0];
            this.game.processAction(this.id, {
                type: 'MOVE',
                from: { q: unitTile.q, r: unitTile.r },
                to: { q: target.q, r: target.r }
            });
            return;
        }

        // Move to valid empty tile
        const validMoves = neighbors.filter(n => !n.unit);
        if (validMoves.length > 0) {
            const target = validMoves[Math.floor(Math.random() * validMoves.length)];
            this.game.processAction(this.id, {
                type: 'MOVE',
                from: { q: unitTile.q, r: unitTile.r },
                to: { q: target.q, r: target.r }
            });
        }
    }
}

module.exports = Automaton;