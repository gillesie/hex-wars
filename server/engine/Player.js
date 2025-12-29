class Player {
    constructor(id, side) {
        this.id = id;
        this.side = side; // 'Blue' or 'Red'
        this.essence = 100; // Currency
        this.nexusHealth = 1000;
        this.units = []; // List of unit references or IDs
        this.income = 10; // Passive income per turn
    }

    tickEconomy() {
        // Calculate upkeep
        let totalUpkeep = 0;
        this.units.forEach(u => totalUpkeep += u.upkeep);
        
        // Net income
        const net = this.income - totalUpkeep;
        this.essence += net;
        
        // Prevent negative essence (optional rule: units die if broke)
        if (this.essence < 0) this.essence = 0;
    }
}

module.exports = Player;