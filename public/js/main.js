import { ThreeRenderer } from './ThreeRenderer.js';
import { InputManager } from './InputManager.js';
import { UIManager } from './UIManager.js';

const socket = io();
const renderer = new ThreeRenderer('game-container');
const uiManager = new UIManager(socket); // Pass socket
let inputManager; 

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

socket.on('statusUpdate', (msg) => {
    uiManager.setStatus(msg);
});

socket.on('gameStart', (initialState) => {
    uiManager.setStatus('SYSTEM: ONLINE');
    uiManager.showNotification("Match Started");

    renderer.setPlayerInfo(initialState.players, socket.id);
    renderer.initMap(initialState.grid);
    renderer.updateGameState(initialState.grid); 
    renderer.animate();
    
    uiManager.update(initialState, socket.id);

    // Pass uiManager to InputManager
    inputManager = new InputManager(renderer, socket, uiManager);
});

socket.on('stateUpdate', (newState) => {
    renderer.updateGameState(newState.grid);
    uiManager.update(newState, socket.id);
});

socket.on('error', (err) => {
    console.error("Game Error:", err);
    uiManager.showError(err);
    if(inputManager) inputManager.resetSelection();
});

socket.on('gameOver', (data) => {
    uiManager.showNotification("GAME OVER: " + data.reason);
    uiManager.setStatus("Session Terminated");
});