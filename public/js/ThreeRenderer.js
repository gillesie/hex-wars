export class ThreeRenderer {
    constructor(containerId) {
        // ... (Constructor same as before) ...
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111115); 

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 18, 12);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById(containerId).appendChild(this.renderer.domElement);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
        this.scene.add(new THREE.AmbientLight(0x404050)); 

        this.hexMeshes = new Map(); // Map<ID, Mesh>
        this.gridDataCache = new Map(); // NEW: Cache the logical tile data
        this.playerColors = {}; 
        
        const selectorGeo = new THREE.TorusGeometry(1, 0.1, 8, 6);
        const selectorMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 });
        this.selectorMesh = new THREE.Mesh(selectorGeo, selectorMat);
        this.selectorMesh.rotation.x = Math.PI / 2;
        this.selectorMesh.visible = false; 
        this.scene.add(this.selectorMesh);
    }

    initMap(gridData) {
        const hexGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 6);
        const materialNeutral = new THREE.MeshLambertMaterial({ color: 0x444444 });

        this.hexMeshes.forEach(m => this.scene.remove(m));
        this.hexMeshes.clear();

        gridData.forEach(tile => {
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
        Object.values(players).forEach(p => {
            this.playerColors[p.id] = (p.side === 'Blue') ? 0x0088ff : 0xff4444;
        });
    }

    highlightHex(tileData) {
        if (!tileData) {
            this.selectorMesh.visible = false;
            return;
        }
        const size = 1.1;
        const x = size * 1.5 * tileData.q;
        const z = size * Math.sqrt(3) * (tileData.r + tileData.q / 2);
        
        this.selectorMesh.position.set(x, 1.0, z);
        this.selectorMesh.visible = true;
    }

    // NEW helper to retrieve logic state for InputManager
    getTileData(q, r) {
        return this.gridDataCache.get(`${q},${r}`);
    }

    updateGameState(gridData) {
        // Sync Visuals AND Cache Data
        gridData.forEach(tile => {
            this.gridDataCache.set(tile.id, tile); // Update Cache

            const mesh = this.hexMeshes.get(tile.id);
            if (!mesh) return;

            let color = 0x444444; 

            if (tile.owner && this.playerColors[tile.owner]) {
                color = this.playerColors[tile.owner];
            }

            // Visual difference for structures
            if (tile.type === 'monolith') {
                 // Slight purple tint for monoliths
                 mesh.scale.y = 1.5; // Make them taller
            } else if (tile.type === 'bastion') {
                 mesh.scale.y = 1.2;
            }

            if (tile.unit) {
                mesh.material.emissive.setHex(color);
                mesh.material.emissiveIntensity = 0.5;
            } else {
                mesh.material.emissive.setHex(0x000000);
            }

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