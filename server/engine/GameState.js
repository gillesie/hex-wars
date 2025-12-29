const HexGrid = require('./HexGrid');
const Unit = require('./Unit'); 

class GameState {
    constructor(matchId, p1Id, p2Id) {
        this.matchId = matchId;
        this.players = {
            [p1Id]: { id: p1Id, side: 'Blue', essence: 100, nexusHealth: 1000, income: 10, units: [] },
            [p2Id]: { id: p2Id, side: 'Red', essence: 100, nexusHealth: 1000, income: 10, units: [] }
        };
        this.grid = new HexGrid(4); 
        this.turn = 0;
        this.status = 'active'; 
        
        this.initBoard(p1Id, p2Id);
    }

    initBoard(p1Id, p2Id) {
        const start1 = this.grid.getTile(0, 4);
        if (start1) {
            start1.owner = p1Id;
            start1.type = 'nexus';
            start1.unit = new Unit('Vanguard', p1Id);
        }

        const start2 = this.grid.getTile(0, -4);
        if (start2) {
            start2.owner = p2Id;
            start2.type = 'nexus';
            start2.unit = new Unit('Vanguard', p2Id);
        }
    }

    tick() {
        Object.values(this.players).forEach(player => {
            // Base Income
            let currentIncome = player.income;

            // Add income from Monoliths
            for (let tile of this.grid.tiles.values()) {
                if (tile.owner === player.id && tile.type === 'monolith') {
                    currentIncome += 5; // Monoliths give +5
                }
            }

            player.essence += currentIncome;
        });
    }

    processAction(playerId, action) {
        if (this.status !== 'active') return { error: "Game over" };

        const player = this.players[playerId];
        if (!player) return { error: "Invalid player" };

        if (action.type === 'MOVE') {
            return this.moveUnit(playerId, action.from, action.to);
        } else if (action.type === 'BUILD') {
            return this.buildStructure(playerId, action);
        }

        return { success: true };
    }

    buildStructure(playerId, action) {
        const { structure, q, r } = action;
        const tile = this.grid.getTile(q, r);
        const player = this.players[playerId];

        if (!tile) return { error: "Invalid tile" };
        if (tile.owner !== playerId) return { error: "You do not own this tile" };
        if (tile.unit) return { error: "Tile is occupied" };
        if (tile.type !== 'empty') return { error: "Already built here" };

        let cost = 0;
        if (structure === 'monolith') cost = 50;
        if (structure === 'bastion') cost = 80;

        if (player.essence < cost) return { error: "Insufficient Essence" };

        // Execute Build
        player.essence -= cost;
        tile.type = structure;

        return { success: true };
    }

    moveUnit(playerId, from, to) {
        const startTile = this.grid.getTile(from.q, from.r);
        const endTile = this.grid.getTile(to.q, to.r);

        if (!startTile || !endTile) return { error: "Invalid coordinates" };
        
        if (!startTile.unit || startTile.unit.owner !== playerId) {
            return { error: "Not your unit" };
        }
        
        if (endTile.unit) return { error: "Destination occupied" };
        
        const isNeighbor = this.grid.getNeighbors(from.q, from.r).includes(endTile);
        if (!isNeighbor) return { error: "Tile not adjacent" };

        endTile.unit = startTile.unit;
        startTile.unit = null;
        
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