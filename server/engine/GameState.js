const HexGrid = require('./HexGrid');

class GameState {
    constructor(matchId, p1Id, p2Id) {
        this.matchId = matchId;
        this.players = {
            [p1Id]: { id: p1Id, side: 'Blue', essence: 100, nexusHealth: 1000 },
            [p2Id]: { id: p2Id, side: 'Red', essence: 100, nexusHealth: 1000 }
        };
        this.grid = new HexGrid(4); // Map radius 4
        this.turn = 0;
        this.status = 'active'; // 'active', 'finished'
    }

    processAction(playerId, action) {
        // action example: { type: 'MOVE', from: {q,r}, to: {q,r} }
        if (this.status !== 'active') return { error: "Game over" };

        const player = this.players[playerId];
        if (!player) return { error: "Invalid player" };

        if (action.type === 'MOVE') {
            return this.moveUnit(playerId, action.from, action.to);
        }
        // Add more actions (BUILD, ATTACK) here
        return { success: true };
    }

    moveUnit(playerId, from, to) {
        const startTile = this.grid.getTile(from.q, from.r);
        const endTile = this.grid.getTile(to.q, to.r);

        if (!startTile || !endTile) return { error: "Invalid coordinates" };
        if (!startTile.unit) return { error: "No unit to move" };
        if (endTile.unit) return { error: "Destination occupied" };
        
        // Basic adjacent movement check (can be expanded for pathfinding)
        const isNeighbor = this.grid.getNeighbors(from.q, from.r).includes(endTile);
        if (!isNeighbor) return { error: "Tile not adjacent" };

        // Execute Move
        endTile.unit = startTile.unit;
        startTile.unit = null;
        
        return { success: true, update: { type: 'UNIT_MOVED', from, to, unit: endTile.unit } };
    }

    // Returns a sanitized state object for the client (hiding Fog of War info if needed)
    serialize() {
        return {
            matchId: this.matchId,
            players: this.players,
            grid: Array.from(this.grid.tiles.values())
        };
    }
}

module.exports = GameState;