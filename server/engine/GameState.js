const HexGrid = require('./HexGrid');
const Unit = require('./Unit'); // Required to spawn starting units

class GameState {
    constructor(matchId, p1Id, p2Id) {
        this.matchId = matchId;
        this.players = {
            [p1Id]: { id: p1Id, side: 'Blue', essence: 100, nexusHealth: 1000 },
            [p2Id]: { id: p2Id, side: 'Red', essence: 100, nexusHealth: 1000 }
        };
        this.grid = new HexGrid(4); // Map radius 4
        this.turn = 0;
        this.status = 'active'; 
        
        // Initialize Starting Positions (Nexus + 1 Unit)
        this.initBoard(p1Id, p2Id);
    }

    initBoard(p1Id, p2Id) {
        // Player 1 (Blue) - South
        const start1 = this.grid.getTile(0, 4);
        if (start1) {
            start1.owner = p1Id;
            start1.type = 'nexus';
            start1.unit = new Unit('Vanguard', p1Id);
        }

        // Player 2 (Red) - North
        const start2 = this.grid.getTile(0, -4);
        if (start2) {
            start2.owner = p2Id;
            start2.type = 'nexus';
            start2.unit = new Unit('Vanguard', p2Id);
        }
    }

    processAction(playerId, action) {
        if (this.status !== 'active') return { error: "Game over" };

        const player = this.players[playerId];
        if (!player) return { error: "Invalid player" };

        if (action.type === 'MOVE') {
            return this.moveUnit(playerId, action.from, action.to);
        }
        return { success: true };
    }

    moveUnit(playerId, from, to) {
        const startTile = this.grid.getTile(from.q, from.r);
        const endTile = this.grid.getTile(to.q, to.r);

        if (!startTile || !endTile) return { error: "Invalid coordinates" };
        
        // Ownership Check
        if (!startTile.unit || startTile.unit.owner !== playerId) {
            return { error: "Not your unit" };
        }
        
        if (endTile.unit) return { error: "Destination occupied" };
        
        const isNeighbor = this.grid.getNeighbors(from.q, from.r).includes(endTile);
        if (!isNeighbor) return { error: "Tile not adjacent" };

        // Execute Move
        endTile.unit = startTile.unit;
        startTile.unit = null;
        
        // Update Owner of tile if moved to neutral/enemy (Simple capture logic)
        if (endTile.owner !== playerId && endTile.type !== 'nexus') {
            endTile.owner = playerId; 
        }
        
        return { success: true, update: { type: 'UNIT_MOVED', from, to, unit: endTile.unit } };
    }

    serialize() {
        return {
            matchId: this.matchId,
            players: this.players,
            grid: Array.from(this.grid.tiles.values())
        };
    }
}

module.exports = GameState;