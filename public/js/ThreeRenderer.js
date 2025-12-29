// Assumes Three.js is loaded in index.html via CDN

export class ThreeRenderer {
    constructor(containerId) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x202025); // Dark space background

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 10);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById(containerId).appendChild(this.renderer.domElement);

        // Lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(10, 20, 10);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x404040));

        this.hexMeshes = new Map(); // Map 'q,r' to THREE.Mesh
    }

    initMap(gridData) {
        const hexGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 6);
        const materialNeutral = new THREE.MeshLambertMaterial({ color: 0x888888 });

        gridData.forEach(tile => {
            const mesh = new THREE.Mesh(hexGeometry, materialNeutral);
            
            // Convert Axial (q,r) to World (x,z)
            // x = size * 3/2 * q
            // z = size * sqrt(3) * (r + q/2)
            const size = 1.1; // slight spacing
            const x = size * 1.5 * tile.q;
            const z = size * Math.sqrt(3) * (tile.r + tile.q / 2);

            mesh.position.set(x, 0, z);
            mesh.userData = { q: tile.q, r: tile.r }; // Store coord in mesh for raycasting
            
            this.scene.add(mesh);
            this.hexMeshes.set(tile.id, mesh);
        });
    }

    updateGameState(gridData) {
        // Update colors based on owner
        gridData.forEach(tile => {
            const mesh = this.hexMeshes.get(tile.id);
            if (mesh) {
                if (tile.unit) {
                    mesh.material.color.setHex(0xff0000); // Unit present
                } else if (tile.owner === 'player1') {
                    mesh.material.color.setHex(0x0000ff);
                } else {
                    mesh.material.color.setHex(0x888888);
                }
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}