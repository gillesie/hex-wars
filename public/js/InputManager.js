export class InputManager {
    constructor(renderer, socket) {
        this.renderer = renderer; // Store whole renderer to access camera, scene, and helper methods
        this.socket = socket;
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
        
        // Intersect against scene children (meshes)
        const intersects = this.raycaster.intersectObjects(this.renderer.scene.children);

        if (intersects.length > 0) {
            const hit = intersects.find(obj => obj.object.userData && obj.object.userData.q !== undefined);
            
            if (hit) {
                const hexData = hit.object.userData;
                this.handleHexInteraction(hexData);
            }
        } else {
            // Clicked background: Deselect
            this.resetSelection();
        }
    }

    handleHexInteraction(hexData) {
        if (!this.selectedHex) {
            // 1. Select Unit
            this.selectedHex = hexData;
            this.renderer.highlightHex(hexData); // Visual Feedback
            console.log("Selected:", this.selectedHex);
        } else {
            // 2. Action: Move to target
            console.log("Action: Move to", hexData);
            
            this.socket.emit('submitAction', {
                type: 'MOVE',
                from: this.selectedHex,
                to: hexData
            });

            this.resetSelection();
        }
    }

    resetSelection() {
        this.selectedHex = null;
        this.renderer.highlightHex(null); // Hide highlight
    }
}