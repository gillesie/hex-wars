export class UIManager {
    constructor(socket) {
        this.socket = socket; // Need socket to emit build commands
        this.statusEl = document.getElementById('status');
        this.essenceEl = document.getElementById('essence-display');
        this.nexusEl = document.getElementById('nexus-display');
        this.uiLayer = document.getElementById('ui-layer');
        this.startScreen = document.getElementById('start-screen');
        this.notificationContainer = document.getElementById('notification-container');
        
        // Action Panel
        this.actionPanel = document.getElementById('action-panel');
        this.panelTitle = document.getElementById('panel-title');
        this.panelContent = document.getElementById('panel-content');

        this.myState = { essence: 0, id: null };
    }

    hideStartScreen() {
        this.startScreen.style.display = 'none';
        this.uiLayer.style.display = 'block';
    }

    update(gameState, myArrayId) {
        if (gameState.players && gameState.players[myArrayId]) {
            this.myState = gameState.players[myArrayId];
            this.essenceEl.innerText = `ESSENCE: ${Math.floor(this.myState.essence)}`;
            this.nexusEl.innerText = `NEXUS: ${this.myState.nexusHealth}`;
        }
    }
    
    // Called by InputManager when a hex is clicked
    showHexActions(tileData) {
        this.actionPanel.style.display = 'flex';
        this.panelTitle.innerText = `SECTOR [${tileData.q}, ${tileData.r}]`;
        this.panelContent.innerHTML = ''; // Clear previous

        // 1. Logic: Who owns this?
        const isMine = tileData.owner === this.myState.id;
        const isEmpty = !tileData.unit && tileData.type === 'empty';

        // 2. Info Text
        const info = document.createElement('div');
        info.style.marginBottom = '10px';
        info.style.fontSize = '0.8rem';
        info.style.color = '#aaa';
        info.innerText = `Owner: ${tileData.owner ? (isMine ? "YOU" : "ENEMY") : "NEUTRAL"} | Type: ${tileData.type}`;
        this.panelContent.appendChild(info);

        // 3. Build Options (Only if mine and empty)
        if (isMine && isEmpty) {
            this.createBtn("Build Monolith (50)", 50, () => {
                this.socket.emit('submitAction', { type: 'BUILD', structure: 'monolith', q: tileData.q, r: tileData.r });
                this.hideActionPanel();
            });

            this.createBtn("Build Bastion (80)", 80, () => {
                this.socket.emit('submitAction', { type: 'BUILD', structure: 'bastion', q: tileData.q, r: tileData.r });
                this.hideActionPanel();
            });
        }
        
        // 4. Unit Info
        if (tileData.unit) {
            const unitInfo = document.createElement('div');
            unitInfo.style.color = '#00dfff';
            unitInfo.innerText = `UNIT: ${tileData.unit.type} (HP: ${tileData.unit.hp})`;
            this.panelContent.appendChild(unitInfo);
        }
    }

    createBtn(label, cost, callback) {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerText = label;
        btn.style.width = '100%';
        btn.style.marginBottom = '5px';
        
        if (this.myState.essence < cost) {
            btn.disabled = true;
            btn.innerText += " [INSUFFICIENT ESSENCE]";
        }

        btn.onclick = callback;
        this.panelContent.appendChild(btn);
    }

    hideActionPanel() {
        this.actionPanel.style.display = 'none';
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
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
}