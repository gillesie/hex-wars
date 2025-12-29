const GameState = require('./engine/GameState');
const Automaton = require('./ai/Automaton');
const { v4: uuidv4 } = require('uuid');

class GameManager {
    constructor(io) {
        this.io = io;
        this.games = new Map(); // matchId -> GameState
        this.players = new Map(); // socketId -> { matchId, playerId }
        this.waitingPlayer = null; // Socket for PvP queue
    }

    handleJoin(socket, mode) {
        if (mode === 'pve') {
            this.createPvEGame(socket);
        } else if (mode === 'pvp') {
            this.findPvPGame(socket);
        }
    }

    createPvEGame(socket) {
        const matchId = uuidv4();
        // Human is Player 1, AI is Player 2
        const game = new GameState(matchId, socket.id, 'AI_OPPONENT');
        this.games.set(matchId, game);
        this.players.set(socket.id, { matchId, playerId: socket.id });
        
        // Initialize AI Agent
        game.aiAgent = new Automaton(game, 'AI_OPPONENT');

        socket.join(matchId);
        socket.emit('gameStart', game.serialize());
    }

    findPvPGame(socket) {
        if (this.waitingPlayer) {
            // Match found!
            const opponent = this.waitingPlayer;
            this.waitingPlayer = null;

            const matchId = uuidv4();
            const game = new GameState(matchId, opponent.id, socket.id);
            this.games.set(matchId, game);

            // Register both players
            this.players.set(opponent.id, { matchId, playerId: opponent.id });
            this.players.set(socket.id, { matchId, playerId: socket.id });

            // Join socket room
            opponent.join(matchId);
            socket.join(matchId);

            // Notify start
            this.io.to(matchId).emit('gameStart', game.serialize());
        } else {
            // No one waiting, set as waiting
            this.waitingPlayer = socket;
            socket.emit('statusUpdate', 'Waiting for opponent...');
        }
    }

    handleAction(socket, actionData) {
        const playerData = this.players.get(socket.id);
        if (!playerData) return;

        const game = this.games.get(playerData.matchId);
        if (!game) return;

        // Process Human Move
        const result = game.processAction(socket.id, actionData);
        
        if (result.success) {
            this.io.to(playerData.matchId).emit('stateUpdate', game.serialize());

            // If PvE, trigger AI response
            if (game.aiAgent) {
                setTimeout(() => {
                    game.aiAgent.decideMove();
                    this.io.to(playerData.matchId).emit('stateUpdate', game.serialize());
                }, 1000); // Artificial delay for "thinking"
            }
        } else {
            socket.emit('error', result.error);
        }
    }

    handleDisconnect(socket) {
        const playerData = this.players.get(socket.id);
        if (playerData) {
            const game = this.games.get(playerData.matchId);
            if (game) {
                game.status = 'finished';
                this.io.to(playerData.matchId).emit('gameOver', { reason: 'Opponent disconnected' });
                this.games.delete(playerData.matchId);
            }
            this.players.delete(socket.id);
        }
        if (this.waitingPlayer === socket) {
            this.waitingPlayer = null;
        }
    }
}

module.exports = GameManager;