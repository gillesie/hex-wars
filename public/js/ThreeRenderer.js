{
type: uploaded file
fileName: gillesie/hex-wars/hex-wars-8d49bc5573d50850e17a73c2f5f97fc0cf483f1f/public/js/ThreeRenderer.js
fullContent:
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ThreeRenderer {
    constructor(containerId) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111115); 

        // Camera setup - steeper angle to help with visibility
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 15);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        
        const container = document.getElementById(containerId);
        container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going under the board
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
        this.scene.add(new THREE.AmbientLight(0x404050)); 

        this.hexMeshes = new Map(); // Map<ID, Mesh>
        this.unitMeshes = new Map(); // Map<ID, Mesh> - For Units
        this.gridDataCache = new Map(); 
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
        
        // Clear units too
        this.unitMeshes.forEach(m => this.scene.remove(m));
        this.unitMeshes.clear();

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

            // Visual difference for structures
            if (tile.type === 'monolith') {
                 mesh.scale.y = 1.5;
            } else if (tile.type === 'bastion') {
                 mesh.scale.y = 1.2;
            } else if (tile.type === 'empty') {
                 mesh.scale.y = 1.0;
            }

            // Supply Chain Visualization: Darken dormant tiles
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

            // --- Unit Rendering ---
            this.updateUnitMesh(tile);
        });
    }

    updateUnitMesh(tile) {
        // Remove existing unit mesh on this tile if it doesn't match current state
        if (this.unitMeshes.has(tile.id)) {
            const currentMesh = this.unitMeshes.get(tile.id);
            // If tile no longer has unit, or unit type/owner changed (simplified check)
            if (!tile.unit) {
                this.scene.remove(currentMesh);
                this.unitMeshes.delete(tile.id);
            }
        }

        if (tile.unit) {
            let unitMesh = this.unitMeshes.get(tile.id);
            const ownerColor = this.playerColors[tile.unit.owner] || 0xffffff;

            if (!unitMesh) {
                // Create new unit mesh based on type
                let geo;
                switch(tile.unit.type) {
                    case 'Vanguard': 
                        geo = new THREE.BoxGeometry(0.