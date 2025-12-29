const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const GameManager = require('./GameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Game Manager
const gameManager = new GameManager(io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Client requests to join a game
    socket.on('joinGame', ({ mode }) => { // mode: 'pvp' or 'pve'
        gameManager.handleJoin(socket, mode);
    });

    // Client sends a move command
    socket.on('submitAction', (actionData) => {
        gameManager.handleAction(socket, actionData);
    });

    socket.on('disconnect', () => {
        gameManager.handleDisconnect(socket);
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});