class Unit {
    constructor(type, ownerId) {
        this.type = type;
        this.owner = ownerId;
        this.movedThisTurn = false;
        
        // Base stats
        const stats = Unit.getStats(type);
        this.hp = stats.hp;
        this.attack = stats.attack;
        this.range = stats.range;
        this.upkeep = stats.upkeep;
    }

    static getStats(type) {
        switch (type) {
            case 'Vanguard':
                return { hp: 100, attack: 20, range: 1, upkeep: 5 };
            case 'Siphon':
                return { hp: 40, attack: 10, range: 1, upkeep: 3 }; // Stealth unit
            case 'Siege-Engine':
                return { hp: 80, attack: 50, range: 2, upkeep: 10 };
            case 'Overseer':
                return { hp: 60, attack: 0, range: 3, upkeep: 8 }; // Support
            default:
                return { hp: 10, attack: 1, range: 1, upkeep: 1 };
        }
    }
}

module.exports = Unit;