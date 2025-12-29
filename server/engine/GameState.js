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
        // 1. Calculate Supply Chains
        this.calculateSupplyChains();

        // 2. Reset Unit Movement (CRITICAL FIX)
        for (let tile of this.grid.tiles.values()) {
            if (tile.unit) {
                tile.unit.movedThisTurn = false;
            }
        }

        Object.values(this.players).forEach(player => {
            let currentIncome = player.income;
            
            for (let tile of this.grid.tiles.values()) {
                if (tile.owner === player.id && tile.type === 'monolith' && !tile.dormant) {
                    let tileIncome = 5;
                    // Siphon Logic
                    if (tile.unit && tile.unit.type === 'Siphon' && tile.unit.owner !== player.id) {
                        tileIncome = Math.floor(tileIncome / 2);
                        const thief = this.players[tile.unit.owner];
                        if (thief) thief.essence += (5 - tileIncome);
                    }
                    currentIncome += tileIncome; 
                }
            }

            // Upkeep
            let totalUpkeep = 0;
            for (let tile of this.grid.tiles.values()) {
                if (tile.unit && tile.unit.owner === player.id) {
                    totalUpkeep += tile.unit.upkeep;
                }
            }

            player.essence += (currentIncome - totalUpkeep);
            if (player.essence < 0) player.essence = 0;
        });
    }

    calculateSupplyChains() {
        for (let tile of this.grid.tiles.values()) {
            if (tile.owner) tile.dormant = true;
        }

        Object.values(this.players).forEach(player => {
            let nexusTile = null;
            for (let tile of this.grid.tiles.values()) {
                if (tile.owner === player.id && tile.type === 'nexus') {
                    nexusTile = tile;
                    break;
                }
            }

            if (!nexusTile) return;

            const queue = [nexusTile];
            const visited = new Set();
            visited.add(nexusTile.id);
            nexusTile.dormant = false;

            while (queue.length > 0) {
                const current = queue.shift();
                const neighbors = this.grid.getNeighbors(current.q, current.r);
                
                for (let neighbor of neighbors) {
                    if (neighbor.owner === player.id && !visited.has(neighbor.id)) {
                        visited.add(neighbor.id);
                        neighbor.dormant = false;
                        queue.push(neighbor);
                    }
                }
            }
        });
    }

    processAction(playerId, action) {
        if (this.status !== 'active') return { error: "Game over" };

        const player = this.players[playerId];
        if (!player) return { error: "Invalid player" };

        if (action.type === 'MOVE') {
            return this.handleUnitAction(playerId, action.from, action.to);
        } else if (action.type === 'BUILD') {
            return this.buildStructure(playerId, action);
        } else if (action.type === 'RECRUIT') {
            return this.recruitUnit(playerId, action);
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
        if (tile.dormant) return { error: "Sector disconnected from Nexus network" };

        let cost = 0;
        if (structure === 'monolith') cost = 50;
        if (structure === 'bastion') cost = 80;

        if (player.essence < cost) return { error: "Insufficient Essence" };

        player.essence -= cost;
        tile.type = structure;

        return { success: true };
    }

    recruitUnit(playerId, action) {
        const { unitType, q, r } = action;
        const tile = this.grid.getTile(q, r);
        const player = this.players[playerId];

        if (!tile) return { error: "Invalid tile" };
        if (tile.owner !== playerId) return { error: "Not your tile" };
        if (tile.type !== 'nexus') return { error: "Units must be recruited at Nexus" };
        if (tile.unit) return { error: "Nexus is occupied (Move unit first)" };

        const stats = Unit.getStats(unitType);
        if (player.essence < stats.cost) return { error: "Insufficient Essence" };

        player.essence -= stats.cost;
        tile.unit = new Unit(unitType, playerId);

        return { success: true };
    }

    handleUnitAction(playerId, from, to) {
        const startTile = this.grid.getTile(from.q, from.r);
        const endTile = this.grid.getTile(to.q, to.r);

        if (!startTile || !endTile) return { error: "Invalid coordinates" };
        
        if (!startTile.unit || startTile.unit.owner !== playerId) {
            return { error: "Not your unit" };
        }

        if (startTile.unit.movedThisTurn) {
            return { error: "Unit has already moved this turn" };
        }
        
        const isNeighbor = this.grid.getNeighbors(from.q, from.r).includes(endTile);
        if (!isNeighbor) return { error: "Target not adjacent" };

        if (endTile.unit) {
            if (endTile.unit.owner !== playerId) {
                return this.resolveCombat(startTile, endTile);
            } else {
                return { error: "Destination occupied by friendly unit" };
            }
        }
        
        return this.moveUnit(playerId, startTile, endTile);
    }

    resolveCombat(attackerTile, defenderTile) {
        const attacker = attackerTile.unit;
        const defender = defenderTile.unit;
        attacker.movedThisTurn = true; // Combat counts as move

        let defenseBonus = 0;
        if (defender.type === 'Vanguard') {
            const neighbors = this.grid.getNeighbors(defenderTile.q, defenderTile.r);
            const allyVanguards = neighbors.filter(t => t.unit && t.unit.type === 'Vanguard' && t.unit.owner === defender.owner);
            defenseBonus = allyVanguards.length * 5; 
        }

        const damage = Math.max(1, attacker.attack - defenseBonus);
        defender.hp -= damage;

        if (defender.hp <= 0) {
            defenderTile.unit = null;
            return { success: true, update: { type: 'COMBAT_KILL', target: defenderTile } };
        }

        return { success: true, update: { type: 'COMBAT_HIT', damage: damage, target: defenderTile } };
    }

    moveUnit(playerId, startTile, endTile) {
        endTile.unit = startTile.unit;
        startTile.unit = null;
        endTile.unit.movedThisTurn = true; 
        
        if (endTile.owner !== playerId && endTile.type !== 'nexus') {
            endTile.owner = playerId; 
            if (endTile.type === 'monolith' || endTile.type === 'bastion') {
                endTile.type = 'empty'; 
                this.players[playerId].essence += 25; 
            }
        }
        
        return { success: true, update: { type: 'UNIT_MOVED', from: startTile, to: endTile } };
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