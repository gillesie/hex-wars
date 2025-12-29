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

        if (myUnits.length === 0) return; // No units to move

        // 2. Simple Logic: Pick a random unit and move it to a random neighbor
        const randomTile = myUnits[Math.floor(Math.random() * myUnits.length)];
        const neighbors = grid.getNeighbors(randomTile.q, randomTile.r);
        
        // Filter valid moves (empty tiles)
        const validMoves = neighbors.filter(n => !n.unit);

        if (validMoves.length > 0) {
            const target = validMoves[Math.floor(Math.random() * validMoves.length)];
            
            // Execute the move directly via the game state
            this.game.moveUnit(this.id, 
                { q: randomTile.q, r: randomTile.r }, 
                { q: target.q, r: target.r }
            );
        }
    }
}

module.exports = Automaton;