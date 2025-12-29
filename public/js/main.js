import { ThreeRenderer } from './ThreeRenderer.js';
import { InputManager } from './InputManager.js';
import { UIManager } from './UIManager.js';

const socket = io();
const renderer = new ThreeRenderer('game-container');
const uiManager = new UIManager();

// Join Game
socket.emit('joinGame', { mode: 'pvp' }); // or 'pve'

socket.on('statusUpdate', (msg) => {
    uiManager.setStatus(msg);
});

socket.on('gameStart', (initialState) => {
    uiManager.setStatus('Game Started!');
    renderer.initMap(initialState.grid);
    renderer.animate();
    
    // Initialize Input Manager now that scene is ready
    new InputManager(renderer.camera, renderer.scene, socket);
});

socket.on('stateUpdate', (newState) => {
    renderer.updateGameState(newState.grid);
    uiManager.update(newState, socket.id);
});

socket.on('error', (err) => {
    console.error("Game Error:", err);
    alert(err); // Simple feedback
});