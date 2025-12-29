export class UIManager {
    constructor() {
        this.statusEl = document.getElementById('status');
        this.essenceEl = document.createElement('div');
        this.nexusEl = document.createElement('div');
        
        this.setupHUD();
    }

    setupHUD() {
        const uiLayer = document.getElementById('ui-layer');
        
        this.essenceEl.id = 'essence-display';
        this.essenceEl.innerText = 'Essence: 0';
        uiLayer.appendChild(this.essenceEl);

        this.nexusEl.id = 'nexus-display';
        this.nexusEl.innerText = 'Nexus Health: 1000';
        uiLayer.appendChild(this.nexusEl);
    }

    update(gameState, myArrayId) {
        // Update Status text based on game phase
        // Update Player resources
        if (gameState.players && gameState.players[myArrayId]) {
            const me = gameState.players[myArrayId];
            this.essenceEl.innerText = `Essence: ${me.essence}`;
            this.nexusEl.innerText = `Nexus: ${me.nexusHealth}`;
        }
    }
    
    setStatus(msg) {
        this.statusEl.innerText = msg;
    }
}