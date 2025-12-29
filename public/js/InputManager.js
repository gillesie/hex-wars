// Assumes Three.js is available globally or imported

export class InputManager {
    constructor(camera, scene, socket) {
        this.camera = camera;
        this.scene = scene;
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
        // Normalize mouse coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Cast ray
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Intersect against all children in the scene (meshes)
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            // Find the first object that has user data (our hexes)
            const hit = intersects.find(obj => obj.object.userData && obj.object.userData.q !== undefined);
            
            if (hit) {
                const hexData = hit.object.userData;
                this.handleHexInteraction(hexData);
            }
        }
    }

    handleHexInteraction(hexData) {
        console.log("Clicked hex:", hexData);

        if (!this.selectedHex) {
            // First click: Select
            this.selectedHex = hexData;
            console.log("Selected:", this.selectedHex);
            // Visual feedback could be added here (highlight selection)
        } else {
            // Second click: Action (Move)
            console.log("Action: Move to", hexData);
            
            this.socket.emit('submitAction', {
                type: 'MOVE',
                from: this.selectedHex,
                to: hexData
            });

            // Deselect
            this.selectedHex = null;
        }
    }
}