import { ThreeRenderer } from './ThreeRenderer.js';
import { InputManager } from './InputManager.js';
import { UIManager } from './UIManager.js';

const socket = io();
const renderer = new ThreeRenderer('game-container');
const uiManager = new UIManager();

// --- Start Screen Logic ---
const btnPvE = document.getElementById('btn-pve');
const btnPvP = document.getElementById('btn-pvp');

btnPvE.addEventListener('click', () => {
    uiManager.hideStartScreen();
    uiManager.setStatus("Initializing Skirmish...");
    socket.emit('joinGame', { mode: 'pve' });
});

btnPvP.addEventListener('click', () => {
    uiManager.hideStartScreen();
    uiManager.setStatus("Searching for Opponent...");
    socket.emit('joinGame', { mode: 'pvp' });
});

// --- Game Events ---

socket.on('statusUpdate', (msg) => {
    uiManager.setStatus(msg);
});

socket.on('gameStart', (initialState) => {
    uiManager.setStatus('SYSTEM: ONLINE');
    uiManager.showNotification("Match Started");

    // Pass player info to renderer so it knows colors
    renderer.setPlayerInfo(initialState.players, socket.id);
    
    renderer.initMap(initialState.grid);
    renderer.updateGameState(initialState.grid); // Initial color pass
    renderer.animate();
    
    // Initialize Input
    new InputManager(renderer.camera, renderer.scene, socket);
});

socket.on('stateUpdate', (newState) => {
    renderer.updateGameState(newState.grid);
    uiManager.update(newState, socket.id);
});

socket.on('error', (err) => {
    console.error("Game Error:", err);
    uiManager.showError(err);
});

socket.on('gameOver', (data) => {
    uiManager.showNotification("GAME OVER: " + data.reason);
    uiManager.setStatus("Session Terminated");
});