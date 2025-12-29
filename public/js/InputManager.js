{
type: uploaded file
fileName: gillesie/hex-wars/hex-wars-8d49bc5573d50850e17a73c2f5f97fc0cf483f1f/public/js/InputManager.js
fullContent:
import * as THREE from 'three';

export class InputManager {
    constructor(renderer, socket, uiManager) {
        this.renderer = renderer;
        this.socket = socket;
        this.uiManager = uiManager;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.selectedHex = null; // {q, r}

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('click', (event) => this.onMouseClick(event), false);
        window.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.resetSelection();
        }, false);
    }

    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.renderer.camera);
        
        const intersects = this.raycaster.intersectObjects(this.renderer.scene.children);

        if (intersects.length > 0) {
            // Ensure we hit a valid tile mesh
            const hit = intersects.find(obj => obj.object.userData && obj.object.userData.q !== undefined);
            
            if (hit) {
                // Fetch the logical state (owner, unit) from Renderer's cache
                const tileData = this.renderer.getTileData(hit.object.userData.q, hit.object.userData.r);
                if (tileData) {
                    this.handleHexInteraction(tileData);
                }
            }
        } else {
            this.resetSelection();
        }
    }

    handleHexInteraction(tile) {
        // 1. If nothing is selected, select the clicked tile
        if (!this.selectedHex) {
            this.selectTile(tile);
            return;
        }

        // 2. If clicking the SAME tile, deselect it
        if (this.selectedHex.q === tile.q && this.selectedHex.r === tile.r) {
            this.resetSelection();
            return;
        }

        // 3. If a different tile is clicked, attempt an ACTION (Move/Attack)
        this.socket.emit('submitAction', {
            type: 'MOVE',
            from: { q: this.selectedHex.q, r: this.selectedHex.r },
            to: { q: tile.q, r: tile.r }
        });
        
        this.resetSelection();
    }

    selectTile(tile) {
        this.selectedHex = tile;
        this.renderer.highlightHex(tile);
        this.uiManager.showHexActions(tile);
    }

    resetSelection() {
        this.selectedHex = null;
        this.renderer.highlightHex(null);
        this.uiManager.hideActionPanel();
    }
}
}