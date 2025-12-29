export class UIManager {
    constructor(socket) {
        this.socket = socket; 
        this.statusEl = document.getElementById('status');
        this.essenceEl = document.getElementById('essence-display');
        this.nexusEl = document.getElementById('nexus-display');
        this.uiLayer = document.getElementById('ui-layer');
        this.startScreen = document.getElementById('start-screen');
        this.notificationContainer = document.getElementById('notification-container');
        
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
    
    showHexActions(tileData) {
        this.actionPanel.style.display = 'flex';
        this.panelTitle.innerText = `SECTOR [${tileData.q}, ${tileData.r}]`;
        this.panelContent.innerHTML = ''; 

        const isMine = tileData.owner === this.myState.id;
        const isEmpty = !tileData.unit && tileData.type === 'empty';
        const isNexus = tileData.type === 'nexus';

        // 1. Info Text
        const info = document.createElement('div');
        info.style.marginBottom = '10px';
        info.style.fontSize = '0.8rem';
        info.style.color = '#aaa';
        info.innerText = `Owner: ${tileData.owner ? (isMine ? "YOU" : "ENEMY") : "NEUTRAL"} | Type: ${tileData.type}`;
        this.panelContent.appendChild(info);

        // 2. Unit Controls (Issue #5)
        if (tileData.unit) {
            const unitPanel = document.createElement('div');
            unitPanel.style.border = '1px solid #00dfff';
            unitPanel.style.padding = '5px';
            unitPanel.style.marginBottom = '10px';
            unitPanel.style.background = 'rgba(0, 223, 255, 0.1)';

            const unitHeader = document.createElement('div');
            unitHeader.style.fontWeight = 'bold';
            unitHeader.style.color = '#00dfff';
            unitHeader.innerText = `${tileData.unit.type.toUpperCase()}`;
            unitPanel.appendChild(unitHeader);

            const unitStats = document.createElement('div');
            unitStats.style.fontSize = '0.8rem';
            unitStats.innerHTML = `HP: ${tileData.unit.hp} <br> Upkeep: ${tileData.unit.upkeep}`;
            unitPanel.appendChild(unitStats);

            const moveStatus = document.createElement('div');
            moveStatus.style.marginTop = '5px';
            if (tileData.unit.movedThisTurn) {
                moveStatus.style.color = '#ff4444';
                moveStatus.innerText = "STATUS: EXHAUSTED (Moved)";
            } else if (isMine) {
                moveStatus.style.color = '#00ff00';
                moveStatus.innerText = "STATUS: READY (Select arrow to move)";
            } else {
                moveStatus.style.color = '#ffaa00';
                moveStatus.innerText = "STATUS: HOSTILE";
            }
            unitPanel.appendChild(moveStatus);

            this.panelContent.appendChild(unitPanel);
        }

        // 3. Recruitment
        if (isMine && isNexus) {
            if (tileData.unit) {
                const warn = document.createElement('div');
                warn.style.color = 'orange';
                warn.style.fontSize = '0.8rem';
                warn.innerText = "Move unit to recruit new forces.";
                this.panelContent.appendChild(warn);
            } else {
                this.createBtn("Recruit Vanguard (100)", 100, () => {
                     this.socket.emit('submitAction', { type: 'RECRUIT', unitType: 'Vanguard', q: tileData.q, r: tileData.r });
                     this.hideActionPanel();
                });
                this.createBtn("Recruit Siphon (150)", 150, () => {
                    this.socket.emit('submitAction', { type: 'RECRUIT', unitType: 'Siphon', q: tileData.q, r: tileData.r });
                    this.hideActionPanel();
               });
            }
        }

        // 4. Build Structures
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
    }

    createBtn(label, cost, callback) {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerText = label;
        btn.style.width = '100%';
        btn.style.marginBottom = '5px';
        
        if (this.myState.essence < cost) {
            btn.disabled = true;
            btn.innerText += " [LOCKED]";
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