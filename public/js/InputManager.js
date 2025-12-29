export class InputManager {
    constructor(renderer, socket, uiManager) {
        this.renderer = renderer;
        this.socket = socket;
        this.uiManager = uiManager; // Store reference
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.selectedHex = null; // {q, r}

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('click', (event) => this.onMouseClick(event), false);
    }

    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.renderer.camera);
        
        const intersects = this.raycaster.intersectObjects(this.renderer.scene.children);

        if (intersects.length > 0) {
            const hit = intersects.find(obj => obj.object.userData && obj.object.userData.q !== undefined);
            
            if (hit) {
                const hexData = hit.object.userData;
                // Merge tile data from renderer userdata with actual clicked object if needed
                // But generally userData has q,r. We rely on GameState update for the rest.
                // However, the renderer mesh might not have latest 'owner' info in userData if we don't update it.
                // NOTE: We should look up the tile in the local grid cache if we had one, 
                // but for now, we pass the data we have. 
                // Better approach: main.js should likely hold the grid state, but we will rely on
                // the previous logic. We need the latest tile data (owner, unit) to show UI.
                // We'll fetch it from the renderer's last known state or assume userData is updated.
                // *Fix:* ThreeRenderer updates colors but maybe not userData properties like 'owner'.
                // Ideally, we pass the clicked coordinate to UIManager, and UIManager finds the data.
                
                // For this implementation, we will pass the basic coord and let UIManager
                // look up the data from its internal 'latest state' if possible, OR
                // we assume userData is kept fresh. 
                // Since ThreeRenderer.js updateGameState iterates all tiles, let's make sure it updates userData there?
                // Actually, let's just pass what we have, and UIManager (which has 'update') can store the grid.
                
                // *Actually*, UIManager doesn't store the grid in previous code. 
                // Let's pass the selection to UIManager and let it decide what to show based on its known state.
                // But UIManager currently only stores 'myState'. 
                
                // Quick Fix: We will assume the renderer mesh userData object is a REFERENCE to the state object
                // if we modify ThreeRenderer to set it that way. 
                // Alternatively, we use the `hexData` from the raycast which is what was assigned during init.
                // Let's rely on the fact that we can just check coords.
                
                this.handleHexInteraction(hexData);
            }
        } else {
            this.resetSelection();
        }
    }

    handleHexInteraction(hexData) {
        // We need the Full Tile Data (Owner, Type, etc) to show UI.
        // We will query the Renderer's hexMeshes map to get the latest data if stored there,
        // or easier: The InputManager relies on the Click.
        // We will pass the `hexData` (which contains q,r) to UI. 
        // We need to pass the *current* tile state. 
        // We can find the current tile state by looking at `this.renderer.lastGridState` if we add that.
        
        // Let's grab the specific tile from the renderer's map if possible, 
        // OR just pass the coordinate and let UIManager handle it if it had the grid.
        
        // Revised flow:
        // 1. We click.
        // 2. We find the tile object from the grid data the renderer holds.
        const tile = this.renderer.getTileData(hexData.q, hexData.r);

        if (!this.selectedHex) {
            // Select
            this.selectedHex = tile;
            this.renderer.highlightHex(tile);
            this.uiManager.showHexActions(tile); // SHOW UI
        } else {
            // Action (Move)
            this.socket.emit('submitAction', {
                type: 'MOVE',
                from: this.selectedHex,
                to: tile
            });
            this.resetSelection();
        }
    }

    resetSelection() {
        this.selectedHex = null;
        this.renderer.highlightHex(null);
        this.uiManager.hideActionPanel(); // HIDE UI
    }
}