export class UIManager {
    constructor() {
        this.statusEl = document.getElementById('status');
        this.essenceEl = document.getElementById('essence-display');
        this.nexusEl = document.getElementById('nexus-display');
        this.uiLayer = document.getElementById('ui-layer');
        this.startScreen = document.getElementById('start-screen');
        this.notificationContainer = document.getElementById('notification-container');
    }

    hideStartScreen() {
        this.startScreen.style.display = 'none';
        this.uiLayer.style.display = 'block';
    }

    update(gameState, myArrayId) {
        if (gameState.players && gameState.players[myArrayId]) {
            const me = gameState.players[myArrayId];
            this.essenceEl.innerText = `ESSENCE: ${Math.floor(me.essence)}`;
            this.nexusEl.innerText = `NEXUS: ${me.nexusHealth}`;
        }
    }
    
    setStatus(msg) {
        this.statusEl.innerText = msg;
    }

    showError(msg) {
        this.showNotification(msg, 'error');
    }

    showNotification(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = msg;
        
        if (type === 'error') {
            toast.style.borderLeftColor = '#ff0000';
            toast.style.background = 'rgba(50, 0, 0, 0.9)';
        }

        this.notificationContainer.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
}