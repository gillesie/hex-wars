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
            const hit = intersects.find(obj => obj.object.userData && obj.object.userData.q !== undefined);
            
            if (hit) {
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
        if (!this.selectedHex) {
            this.selectTile(tile);
            return;
        }

        if (this.selectedHex.q === tile.q && this.selectedHex.r === tile.r) {
            this.resetSelection();
            return;
        }

        // Action: Move/Attack
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

        // SHOW ARROWS if tile has a unit (My unit)
        // Note: checking ownership locally for UI convenience, server validates later
        if (tile.unit && tile.unit.owner === this.uiManager.myState.id) {
            const neighbors = this.getNeighborCoords(tile.q, tile.r);
            this.renderer.showArrows(tile, neighbors);
        }
    }

    getNeighborCoords(q, r) {
        // Hex Neighbor Offsets (Axial)
        const directions = [
            [1, 0], [1, -1], [0, -1],
            [-1, 0], [-1, 1], [0, 1]
        ];
        return directions.map(d => ({ q: q + d[0], r: r + d[1] }));
    }

    resetSelection() {
        this.selectedHex = null;
        this.renderer.highlightHex(null); // This also clears arrows
        this.uiManager.hideActionPanel();
    }
}