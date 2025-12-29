import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ThreeRenderer {
    constructor(containerId) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111115); 

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 15);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        
        const container = document.getElementById(containerId);
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; 
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
        this.scene.add(new THREE.AmbientLight(0x404050)); 

        this.hexMeshes = new Map(); 
        this.unitMeshes = new Map(); 
        this.gridDataCache = new Map(); 
        this.playerColors = {}; 

        // Selection Ring
        const selectorGeo = new THREE.TorusGeometry(1, 0.1, 8, 6);
        const selectorMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 });
        this.selectorMesh = new THREE.Mesh(selectorGeo, selectorMat);
        this.selectorMesh.rotation.x = Math.PI / 2;
        this.selectorMesh.visible = false; 
        this.scene.add(this.selectorMesh);

        // Arrow Group
        this.arrowGroup = new THREE.Group();
        this.scene.add(this.arrowGroup);
    }

    initMap(gridData) {
        const hexGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 6);
        const materialNeutral = new THREE.MeshLambertMaterial({ color: 0x444444 });

        this.hexMeshes.forEach(m => this.scene.remove(m));
        this.hexMeshes.clear();
        this.unitMeshes.forEach(m => this.scene.remove(m));
        this.unitMeshes.clear();
        this.clearArrows();

        gridData.forEach(tile => {
            const isNexus = tile.type === 'nexus';
            const geometry = isNexus 
                ? new THREE.CylinderGeometry(1, 1.2, 2.0, 6) 
                : hexGeometry;

            const mesh = new THREE.Mesh(geometry, materialNeutral.clone());
            const pos = this.getHexPosition(tile.q, tile.r);
            
            mesh.position.set(pos.x, isNexus ? 1 : 0, pos.z);
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

    // Helper to calculate 3D position
    getHexPosition(q, r) {
        const size = 1.1; 
        const x = size * 1.5 * q;
        const z = size * Math.sqrt(3) * (r + q / 2);
        return { x, z };
    }

    highlightHex(tileData) {
        if (!tileData) {
            this.selectorMesh.visible = false;
            this.clearArrows(); // Clear arrows when deselecting
            return;
        }
        const pos = this.getHexPosition(tileData.q, tileData.r);
        this.selectorMesh.position.set(pos.x, 1.0, pos.z);
        this.selectorMesh.visible = true;
    }

    // NEW: Show Movement Arrows
    showArrows(originTile, neighbors) {
        this.clearArrows();
        if (!originTile) return;

        const startPos = this.getHexPosition(originTile.q, originTile.r);

        neighbors.forEach(nCoord => {
            const endPos = this.getHexPosition(nCoord.q, nCoord.r);
            
            // Direction Vector
            const dir = new THREE.Vector3(endPos.x - startPos.x, 0, endPos.z - startPos.z).normalize();
            
            // Large Arrow
            const length = 1.5;
            const color = 0x00ff00; // Green for go
            const headLength = 0.5;
            const headWidth = 0.4;

            const arrowHelper = new THREE.ArrowHelper(dir, new THREE.Vector3(startPos.x, 1.5, startPos.z), length, color, headLength, headWidth);
            
            // Make it thicker (ArrowHelper line width is limited in WebGL, so we stick to standard or use meshes. 
            // Since user complained about "too small", we scale the whole object)
            arrowHelper.scale.set(1.5, 1.5, 1.5); 
            
            this.arrowGroup.add(arrowHelper);
        });
    }

    clearArrows() {
        while(this.arrowGroup.children.length > 0){ 
            this.arrowGroup.remove(this.arrowGroup.children[0]); 
        }
    }

    getTileData(q, r) {
        return this.gridDataCache.get(`${q},${r}`);
    }

    updateGameState(gridData) {
        gridData.forEach(tile => {
            this.gridDataCache.set(tile.id, tile);

            const mesh = this.hexMeshes.get(tile.id);
            if (!mesh) return;

            let color = 0x444444; 
            if (tile.owner && this.playerColors[tile.owner]) {
                color = this.playerColors[tile.owner];
            }

            // Visual scaling
            if (tile.type === 'monolith') mesh.scale.y = 1.5;
            else if (tile.type === 'bastion') mesh.scale.y = 1.2;
            else if (tile.type === 'empty') mesh.scale.y = 1.0;

            if (tile.owner && tile.dormant) {
                 mesh.material.color.setHex(0x222222);
                 mesh.material.emissive.setHex(0x000000);
            } else {
                 mesh.material.color.setHex(color);
                 if (tile.type === 'nexus') {
                    mesh.material.emissive.setHex(color);
                    mesh.material.emissiveIntensity = 0.6;
                 } else {
                    mesh.material.emissive.setHex(0x000000);
                 }
            }

            this.updateUnitMesh(tile);
        });
    }

    updateUnitMesh(tile) {
        if (this.unitMeshes.has(tile.id)) {
            const currentMesh = this.unitMeshes.get(tile.id);
            if (!tile.unit) {
                this.scene.remove(currentMesh);
                this.unitMeshes.delete(tile.id);
            }
        }

        if (tile.unit) {
            let unitMesh = this.unitMeshes.get(tile.id);
            const ownerColor = this.playerColors[tile.unit.owner] || 0xffffff;

            if (!unitMesh) {
                let geo;
                switch(tile.unit.type) {
                    case 'Vanguard': geo = new THREE.BoxGeometry(0.8, 0.8, 0.8); break;
                    case 'Siphon': geo = new THREE.ConeGeometry(0.4, 1, 4); break;
                    case 'Siege-Engine': geo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 8); break;
                    default: geo = new THREE.SphereGeometry(0.5, 16, 16);
                }
                
                const mat = new THREE.MeshStandardMaterial({ color: ownerColor, roughness: 0.3 });
                unitMesh = new THREE.Mesh(geo, mat);
                
                const pos = this.getHexPosition(tile.q, tile.r);
                let yOffset = 0.75;
                if (tile.type === 'monolith') yOffset = 1.0; 
                if (tile.type === 'nexus') yOffset = 1.5;

                unitMesh.position.set(pos.x, yOffset, pos.z);
                unitMesh.castShadow = true;
                this.scene.add(unitMesh);
                this.unitMeshes.set(tile.id, unitMesh);
            } else {
                 // Update position if unit moved (animation simulation)
                 const pos = this.getHexPosition(tile.q, tile.r);
                 let yOffset = 0.75;
                 if (tile.type === 'monolith') yOffset = 1.0;
                 if (tile.type === 'nexus') yOffset = 1.5;
                 unitMesh.position.set(pos.x, yOffset, pos.z);
                 unitMesh.material.color.setHex(ownerColor);
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        
        // Pulse Arrows
        const time = Date.now() * 0.005;
        this.arrowGroup.children.forEach(arrow => {
             arrow.position.y = 1.5 + Math.sin(time) * 0.2;
        });

        this.renderer.render(this.scene, this.camera);
    }
}