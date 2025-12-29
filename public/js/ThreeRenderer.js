export class ThreeRenderer {
    constructor(containerId) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111115); // Darker elite bg

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 18, 12);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById(containerId).appendChild(this.renderer.domElement);

        // Lights
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
        this.scene.add(new THREE.AmbientLight(0x404050)); // Cool ambient

        this.hexMeshes = new Map();
        this.playerColors = {}; // Will map ID -> HexColor
    }

    initMap(gridData) {
        const hexGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 6);
        const materialNeutral = new THREE.MeshLambertMaterial({ color: 0x444444 });

        // Clear existing
        this.hexMeshes.forEach(m => this.scene.remove(m));
        this.hexMeshes.clear();

        gridData.forEach(tile => {
            // Nexus tiles are taller
            const isNexus = tile.type === 'nexus';
            const geometry = isNexus 
                ? new THREE.CylinderGeometry(1, 1.2, 2.0, 6) 
                : hexGeometry;

            const mesh = new THREE.Mesh(geometry, materialNeutral.clone());
            
            const size = 1.1; 
            const x = size * 1.5 * tile.q;
            const z = size * Math.sqrt(3) * (tile.r + tile.q / 2);

            mesh.position.set(x, isNexus ? 1 : 0, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { q: tile.q, r: tile.r }; 
            
            this.scene.add(mesh);
            this.hexMeshes.set(tile.id, mesh);
        });
    }

    setPlayerInfo(players, myId) {
        // Map player IDs to Colors based on 'side'
        Object.values(players).forEach(p => {
            this.playerColors[p.id] = (p.side === 'Blue') ? 0x0088ff : 0xff4444;
        });
    }

    updateGameState(gridData) {
        gridData.forEach(tile => {
            const mesh = this.hexMeshes.get(tile.id);
            if (!mesh) return;

            let color = 0x444444; // Neutral Grey

            // 1. Determine Tile Ownership Color
            if (tile.owner && this.playerColors[tile.owner]) {
                color = this.playerColors[tile.owner];
            }

            // 2. Highlight Units
            if (tile.unit) {
                // Brighten the color if unit exists, or make it White for generic unit visibility
                // Ideally units should be separate meshes, but for now we color the tile
                mesh.material.emissive.setHex(color);
                mesh.material.emissiveIntensity = 0.5;
            } else {
                mesh.material.emissive.setHex(0x000000);
            }

            // 3. Special Nexus coloring
            if (tile.type === 'nexus') {
                mesh.material.emissiveIntensity = 0.8;
            }

            mesh.material.color.setHex(color);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}