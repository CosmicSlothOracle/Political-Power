const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Import game types and game engine
// Note: Since these are in TypeScript, in a real implementation you would need to compile them
// For this simplified server, we'll just define some basic functionality

// Game state storage
const games = new Map();
const users = new Map();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple mock cards
const mockCards = [
    { id: 'card1', name: 'Chancellor', type: 'politician', influence: 5, effect: 'Gain 2 mandates', campaignValue: 25000 },
    { id: 'card2', name: 'Minister', type: 'politician', influence: 4, effect: 'Draw a card', campaignValue: 20000 },
    { id: 'card3', name: 'Member of Parliament', type: 'politician', influence: 3, effect: 'Gain 1 mandate', campaignValue: 15000 },
    { id: 'card4', name: 'Mayor', type: 'politician', influence: 3, effect: 'Gain 1 mandate', campaignValue: 15000 },
    { id: 'card5', name: 'Campaign Rally', type: 'event', influence: 2, effect: 'Gain €10,000', campaignValue: 10000 },
    { id: 'card6', name: 'Political Scandal', type: 'event', influence: -2, effect: 'Opponent discards a card', campaignValue: 5000 },
    { id: 'card7', name: 'Media Support', type: 'special', influence: 0, effect: 'Double your influence this round', campaignValue: 30000 },
    { id: 'card8', name: 'Coalition Agreement', type: 'special', influence: 0, effect: 'Form a coalition with another player', campaignValue: 25000 },
    { id: 'card9', name: 'Opposition Research', type: 'special', influence: 0, effect: 'Look at opponent hand', campaignValue: 20000 },
    { id: 'card10', name: 'Grassroots Support', type: 'event', influence: 3, effect: 'Gain 1 momentum', campaignValue: 15000 }
];

// Simplified deck creation function
function createDeck(name = 'Standard Deck') {
    const deckCards = [...mockCards]; // Use all mock cards
    const drawPile = deckCards.map(card => card.id);

    // Shuffle the draw pile
    for (let i = drawPile.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [drawPile[i], drawPile[j]] = [drawPile[j], drawPile[i]];
    }

    return {
        id: 'deck_' + Date.now(),
        name,
        cards: deckCards,
        drawPile,
        discardPile: []
    };
}

// Simplified function to draw cards from a deck
function drawCardsFromDeck(deck, count) {
    // Clone the deck
    const updatedDeck = { ...deck };

    // Check if we need to reshuffle
    if (updatedDeck.drawPile.length < count && updatedDeck.discardPile.length > 0) {
        // Reshuffle discard pile into draw pile
        updatedDeck.drawPile = [...updatedDeck.drawPile, ...updatedDeck.discardPile];
        updatedDeck.discardPile = [];

        // Shuffle the draw pile
        const drawPile = [...updatedDeck.drawPile];
        for (let i = drawPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [drawPile[i], drawPile[j]] = [drawPile[j], drawPile[i]];
        }
        updatedDeck.drawPile = drawPile;
    }

    // Draw up to the available number of cards
    const actualCount = Math.min(count, updatedDeck.drawPile.length);
    const drawnCardIds = updatedDeck.drawPile.slice(0, actualCount);

    // Update the draw pile
    updatedDeck.drawPile = updatedDeck.drawPile.slice(actualCount);

    return { drawnCardIds, updatedDeck };
}

// Process game phase
function processPhase(gameState) {
    // Clone the state to avoid mutations
    const state = JSON.parse(JSON.stringify(gameState));
    const phase = state.phase;

    // Add a log entry
    state.log.push({
        timestamp: Date.now(),
        message: `Processing ${ phase } phase`,
        type: 'system'
    });

    // Process based on phase
    switch (phase) {
        case 'setup':
            // Initialize players and deal cards
            state.players.forEach(player => {
                if (!player.handIds || player.handIds.length === 0) {
                    const initialCards = 5;
                    if (!state.deck) {
                        state.deck = createDeck();
                    }

                    const result = drawCardsFromDeck(state.deck, initialCards);
                    player.handIds = result.drawnCardIds;
                    state.deck = result.updatedDeck;

                    state.log.push({
                        timestamp: Date.now(),
                        message: `Dealt ${ initialCards } cards to ${ player.name }`,
                        type: 'system'
                    });
                }
            });

            // Set phase to play
            state.phase = 'play';
            state.log.push({
                timestamp: Date.now(),
                message: 'Advancing to play phase',
                type: 'system'
            });
            break;

        case 'play':
            // In a real implementation, this would handle AI player turns
            // For this demo, we just log that we're in the play phase
            state.log.push({
                timestamp: Date.now(),
                message: 'In play phase - waiting for player actions',
                type: 'system'
            });
            break;

        case 'effect':
            // Apply card effects
            const activePlayer = state.players.find(p => p.id === state.activePlayerId);
            if (activePlayer && activePlayer.playedCardIds && activePlayer.playedCardIds.length > 0) {
                state.log.push({
                    timestamp: Date.now(),
                    message: `Applying effects of cards played by ${ activePlayer.name }`,
                    type: 'system'
                });

                // Move to resolution phase
                state.phase = 'resolution';
                state.log.push({
                    timestamp: Date.now(),
                    message: 'Advancing to resolution phase',
                    type: 'system'
                });
            } else {
                state.log.push({
                    timestamp: Date.now(),
                    message: 'No cards to process, continuing in effect phase',
                    type: 'system'
                });
            }
            break;

        case 'resolution':
            // Draw a card for the active player
            const playerInResolution = state.players.find(p => p.id === state.activePlayerId);
            if (playerInResolution) {
                const result = drawCardsFromDeck(state.deck, 1);
                playerInResolution.handIds = [...(playerInResolution.handIds || []), ...result.drawnCardIds];
                state.deck = result.updatedDeck;

                state.log.push({
                    timestamp: Date.now(),
                    message: `${ playerInResolution.name } draws a card`,
                    type: 'game'
                });

                // Clear played cards
                playerInResolution.playedCardIds = [];

                // Move to the next player or end the round
                const currentPlayerIndex = state.players.findIndex(p => p.id === state.activePlayerId);
                const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;

                if (nextPlayerIndex === 0) {
                    // All players have had their turn, move to backfire phase
                    state.log.push({
                        timestamp: Date.now(),
                        message: `Round ${ state.round } completed`,
                        type: 'system'
                    });

                    state.phase = 'backfire';
                    state.log.push({
                        timestamp: Date.now(),
                        message: 'Advancing to backfire phase',
                        type: 'system'
                    });
                } else {
                    // Move to the next player
                    state.activePlayerId = state.players[nextPlayerIndex].id;
                    state.log.push({
                        timestamp: Date.now(),
                        message: `Next player is ${ state.players[nextPlayerIndex].name }`,
                        type: 'system'
                    });

                    state.phase = 'play';
                    state.log.push({
                        timestamp: Date.now(),
                        message: 'Returning to play phase for the next player',
                        type: 'system'
                    });
                }
            }
            break;

        case 'backfire':
            // Apply coalition effects (simplified)
            state.log.push({
                timestamp: Date.now(),
                message: 'Processing coalition effects (simplified)',
                type: 'system'
            });

            // Increment round
            state.round += 1;
            state.log.push({
                timestamp: Date.now(),
                message: `Advancing to round ${ state.round }`,
                type: 'system'
            });

            // Reset to first player
            state.activePlayerId = state.players[0].id;
            state.log.push({
                timestamp: Date.now(),
                message: `${ state.players[0].name } will be the first player in the new round`,
                type: 'system'
            });

            // Return to setup phase
            state.phase = 'setup';
            state.log.push({
                timestamp: Date.now(),
                message: 'Returning to setup phase for the next round',
                type: 'system'
            });
            break;

        case 'final':
            // Calculate final scores
            state.players.forEach(player => {
                player.score = player.mandates || 0;
                state.log.push({
                    timestamp: Date.now(),
                    message: `${ player.name } finished with ${ player.mandates || 0 } mandates`,
                    type: 'game'
                });
            });

            // Find winner
            const highestMandates = Math.max(...state.players.map(p => p.mandates || 0));
            const winners = state.players.filter(p => (p.mandates || 0) === highestMandates);

            if (winners.length === 1) {
                state.log.push({
                    timestamp: Date.now(),
                    message: `Game over! ${ winners[0].name } wins with ${ winners[0].mandates } mandates!`,
                    type: 'system'
                });
            } else {
                const winnerNames = winners.map(p => p.name).join(', ');
                state.log.push({
                    timestamp: Date.now(),
                    message: `Game over! It's a tie between ${ winnerNames } with ${ highestMandates } mandates each!`,
                    type: 'system'
                });
            }

            state.phase = 'finished';
            state.status = 'completed';
            state.log.push({
                timestamp: Date.now(),
                message: 'Game has been completed',
                type: 'system'
            });
            break;

        case 'finished':
            // No further processing needed
            break;

        default:
            state.log.push({
                timestamp: Date.now(),
                message: `Invalid phase: ${ phase }`,
                type: 'error'
            });
    }

    return state;
}

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log(`User connected: ${ socket.id }`);

    // Debug route
    socket.on('debug-state', () => {
        const user = users.get(socket.id);
        if (user && user.gameId) {
            const game = games.get(user.gameId);
            socket.emit('debug-response', {
                user,
                gameExists: !!game,
                gameState: game
            });
            console.log(`Debug state requested for game ${ user.gameId }`);
        } else {
            socket.emit('debug-response', {
                user: null,
                message: 'User not in a game'
            });
            console.log('Debug state requested, but user not in a game');
        }
    });

    // Create a game
    socket.on('create-game', (data) => {
        console.log('Received create-game request:', data);
        try {
            const { name, maxPlayers, maxRounds, mandateThreshold, players } = data;

            if (!name || !players || !players.length) {
                throw new Error('Invalid game creation parameters');
            }

            // Generate a unique game ID
            const gameId = `game_${ Date.now() }_${ Math.random().toString(36).substr(2, 9) }`;

            // Create the game state
            const gameState = {
                gameId,
                name,
                status: 'lobby',
                phase: 'setup',
                players,
                round: 1,
                maxRounds: maxRounds || 10,
                mandateThreshold: mandateThreshold || 61,
                maxPlayers: maxPlayers || 4,
                activePlayerId: players[0].id,
                log: [{
                    timestamp: Date.now(),
                    message: 'Game created. Waiting for players...',
                    type: 'system'
                }],
                centerCards: [],
                coalitions: []
            };

            // Store the game
            games.set(gameId, gameState);

            // Associate the socket with the game
            socket.join(gameId);
            users.set(socket.id, { playerId: players[0].id, gameId });

            console.log(`Game ${ gameId } created successfully`);

            // Send success response
            socket.emit('create-game-response', {
                success: true,
                game: gameState
            });

            // Broadcast to all sockets in the room
            socket.to(gameId).emit('game-updated', gameState);

        } catch (error) {
            console.error('Error creating game:', error);
            socket.emit('create-game-response', {
                success: false,
                error: error.message || 'Failed to create game'
            });
        }
    });

    // Join a game
    socket.on('join-game', (data) => {
        const { gameId, player } = data;
        console.log(`Player ${ player.name } joining game ${ gameId }`);

        // Create game if it doesn't exist
        if (!games.has(gameId)) {
            games.set(gameId, {
                gameId,
                name: `Game ${ gameId }`,
                status: 'lobby',
                phase: 'setup',
                players: [],
                round: 1,
                maxRounds: 10,
                mandateThreshold: 61,
                activePlayerId: null,
                log: [{
                    timestamp: Date.now(),
                    message: 'Game created. Waiting for players...',
                    type: 'system'
                }]
            });
        }

        // Get the game
        const game = games.get(gameId);

        // Add player to game if not already in it
        if (!game.players.find(p => p.id === player.id)) {
            game.players.push(player);
            socket.join(gameId);
            users.set(socket.id, { playerId: player.id, gameId });

            // Notify all clients in the game
            io.to(gameId).emit('player-joined', {
                gameState: game,
                player
            });

            console.log(`Game ${ gameId } now has ${ game.players.length } players`);
        }
    });

    // Leave a game
    socket.on('leave-game', (data) => {
        const { gameId } = data;
        const user = users.get(socket.id);

        if (user && games.has(gameId)) {
            const game = games.get(gameId);
            const playerIndex = game.players.findIndex(p => p.id === user.playerId);

            if (playerIndex !== -1) {
                const player = game.players[playerIndex];
                game.players.splice(playerIndex, 1);
                socket.leave(gameId);

                // Notify all clients in the game
                io.to(gameId).emit('player-left', {
                    gameState: game,
                    playerId: user.playerId
                });

                console.log(`Player ${ player.name } left game ${ gameId }`);
            }
        }
    });

    // Game action
    socket.on('game-action', (action) => {
        const user = users.get(socket.id);
        if (!user) return;

        const { gameId } = user;
        if (!games.has(gameId)) return;

        const game = games.get(gameId);

        // Process the action
        console.log(`Received game action: ${ action.type } from player ${ user.playerId } in game ${ gameId }`);

        // Set the player ID in the action
        action.playerId = user.playerId;
        action.timestamp = Date.now();

        let actionResponse = { success: false, error: null };

        // Handle different action types
        switch (action.type) {
            case 'DRAW_CARD':
                // Check if it's this player's turn
                if (game.activePlayerId !== user.playerId) {
                    actionResponse.error = 'Not your turn';
                    socket.emit('game-action-response', actionResponse);
                    return;
                }

                // Draw a card for this player
                const player = game.players.find(p => p.id === user.playerId);
                if (!player) {
                    actionResponse.error = 'Player not found';
                    socket.emit('game-action-response', actionResponse);
                    return;
                }

                // Initialize deck if needed
                if (!game.deck) {
                    game.deck = createDeck();
                }

                // Draw a card
                const result = drawCardsFromDeck(game.deck, 1);
                player.handIds = [...(player.handIds || []), ...result.drawnCardIds];
                game.deck = result.updatedDeck;

                // Add log entry
                game.log.push({
                    timestamp: Date.now(),
                    message: `${ player.name } drew a card`,
                    type: 'action'
                });

                actionResponse.success = true;
                break;

            case 'PLAY_CARD':
                // Check if it's this player's turn
                if (game.activePlayerId !== user.playerId) {
                    actionResponse.error = 'Not your turn';
                    socket.emit('game-action-response', actionResponse);
                    return;
                }

                // Find the player
                const playingPlayer = game.players.find(p => p.id === user.playerId);
                if (!playingPlayer) {
                    actionResponse.error = 'Player not found';
                    socket.emit('game-action-response', actionResponse);
                    return;
                }

                // In a real implementation, we would validate the card ID
                // For this demo, we'll just use a dummy card if none is specified
                let cardId = action.cardId || (playingPlayer.handIds && playingPlayer.handIds.length > 0 ?
                    playingPlayer.handIds[0] : 'dummy-card-id');

                // Check if player has cards
                if (!playingPlayer.handIds || playingPlayer.handIds.length === 0) {
                    actionResponse.error = 'No cards in hand';
                    socket.emit('game-action-response', actionResponse);
                    return;
                }

                // Remove card from hand and add to played cards
                const cardIndex = playingPlayer.handIds.indexOf(cardId);
                if (cardIndex !== -1) {
                    playingPlayer.handIds.splice(cardIndex, 1);
                } else {
                    // Use the first card if the specified one wasn't found
                    cardId = playingPlayer.handIds[0];
                    playingPlayer.handIds.splice(0, 1);
                }

                playingPlayer.playedCardIds = [...(playingPlayer.playedCardIds || []), cardId];

                // Add log entry
                game.log.push({
                    timestamp: Date.now(),
                    message: `${ playingPlayer.name } played a card`,
                    type: 'action'
                });

                // Move to effect phase after playing a card
                game.phase = 'effect';
                game.log.push({
                    timestamp: Date.now(),
                    message: 'Advancing to effect phase',
                    type: 'system'
                });
                actionResponse.success = true;
                break;

            case 'END_TURN':
                // Check if it's this player's turn
                if (game.activePlayerId !== user.playerId) {
                    actionResponse.error = 'Not your turn';
                    socket.emit('game-action-response', actionResponse);
                    return;
                }

                // Find the next player
                const currentPlayerIndex = game.players.findIndex(p => p.id === user.playerId);
                const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;

                // Update active player
                game.activePlayerId = game.players[nextPlayerIndex].id;

                // Add log entry
                game.log.push({
                    timestamp: Date.now(),
                    message: `${ game.players[currentPlayerIndex].name } ended their turn. Next player is ${ game.players[nextPlayerIndex].name }`,
                    type: 'action'
                });
                actionResponse.success = true;
                break;

            case 'PROCESS_PHASE':
                // Process the current phase
                const updatedGame = processPhase(game);
                games.set(gameId, updatedGame);

                // Notify all clients
                io.to(gameId).emit('game-updated', updatedGame);

                // Send response
                actionResponse.success = true;
                socket.emit('game-action-response', actionResponse);
                return; // Return early since we've already updated the game

            default:
                actionResponse.error = `Unknown action type: ${ action.type }`;
                socket.emit('game-action-response', actionResponse);
                return;
        }

        // Notify all clients about the updated game state
        io.to(gameId).emit('game-updated', game);

        // Emit specific action event
        io.to(gameId).emit(action.type.toLowerCase(), {
            gameState: game,
            action
        });

        // Send response to the client that initiated the action
        socket.emit('game-action-response', actionResponse);
    });

    // Start game
    socket.on('start-game', (data) => {
        const { gameId } = data;
        const user = users.get(socket.id);

        if (user && games.has(gameId)) {
            const game = games.get(gameId);

            if (game.players.length >= 2) {
                // Set up the initial game state
                game.status = 'active';
                game.deck = createDeck();
                game.activePlayerId = game.players[0].id;

                // Add log entry
                game.log.push({
                    timestamp: Date.now(),
                    message: 'Game started. Round 1 begins.',
                    type: 'system'
                });

                // Process the setup phase
                const updatedGame = processPhase(game);
                games.set(gameId, updatedGame);

                // Notify all clients in the game
                io.to(gameId).emit('game-started', {
                    gameState: updatedGame
                });

                console.log(`Game ${ gameId } started with ${ updatedGame.players.length } players`);
            } else {
                socket.emit('error', {
                    message: 'Need at least 2 players to start the game'
                });
            }
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${ socket.id }`);
        const user = users.get(socket.id);

        if (user) {
            const { gameId, playerId } = user;

            if (games.has(gameId)) {
                const game = games.get(gameId);
                const playerIndex = game.players.findIndex(p => p.id === playerId);

                if (playerIndex !== -1) {
                    // Mark player as disconnected but don't remove
                    game.players[playerIndex].isConnected = false;

                    // Notify all clients in the game
                    io.to(gameId).emit('player-disconnected', {
                        gameState: game,
                        playerId
                    });

                    console.log(`Player ${ playerId } disconnected from game ${ gameId }`);
                }
            }

            users.delete(socket.id);
        }
    });
});

// Start server
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Listen on all interfaces instead of localhost
server.listen(PORT, HOST, () => {
    console.log(`Server running on port ${ PORT }`);
    console.log(`Open http://localhost:${ PORT } in your browser`);
    console.log(`For mobile access, use http://<your-local-ip>:${ PORT }`);
});

// API routes
app.get('/api/games', (req, res) => {
    const gamesList = Array.from(games.values()).map(game => ({
        id: game.gameId,
        name: game.name,
        players: game.players.length,
        status: game.status
    }));

    res.json(gamesList);
});

app.get('/api/games/:id', (req, res) => {
    const gameId = req.params.id;

    if (games.has(gameId)) {
        res.json(games.get(gameId));
    } else {
        res.status(404).json({ error: 'Game not found' });
    }
});

// Simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});