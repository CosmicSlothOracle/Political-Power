# Political Card Game Server

A simple server implementation for the Political Card Game, allowing multiple players to join and play together in real-time.

## Features

- Socket.IO based real-time communication
- Support for multiple concurrent games
- Game phase management
- Card drawing and playing
- Simple AI player integration
- Coalition mechanics

## Installation

1. Make sure you have Node.js installed (version 14 or higher)
2. Clone this repository
3. Install dependencies:

```bash
npm install
```

## Running the Server

Start the server with:

```bash
npm start
```

For development with auto-restart on code changes:

```bash
npm run dev
```

The server will run on port 3001 by default. You can change this by setting the `PORT` environment variable.

## Playing the Game

1. Open your browser and navigate to `http://localhost:3001`
2. Enter your name and a game ID (or use the default)
3. Click "Join Game"
4. When all players have joined, click "Start Game"
5. Follow the game flow:
   - Draw cards
   - Play cards
   - End your turn
   - Process phases

## Game Rules

- Players take turns playing cards
- Each card has an influence value
- The player with the highest influence at the end of each round gains mandates
- The first player to reach the mandate threshold (default: 61) wins
- Coalitions can be formed between players for mutual benefit
- Special cards can be played for unique effects

## API Endpoints

- `GET /api/games` - List all active games
- `GET /api/games/:id` - Get details of a specific game
- `GET /health` - Server health check

## WebSocket Events

### Client to Server
- `join-game` - Join a game
- `leave-game` - Leave a game
- `start-game` - Start a game
- `game-action` - Perform a game action (draw card, play card, etc.)

### Server to Client
- `player-joined` - A player has joined the game
- `player-left` - A player has left the game
- `game-started` - The game has started
- `game-updated` - The game state has been updated
- `draw-card` - A player has drawn a card
- `play-card` - A player has played a card
- `end-turn` - A player has ended their turn

## Architecture

The server implements a simplified version of the game engine with the following components:

- Socket.IO server for real-time communication
- Express server for HTTP endpoints
- Game state management using Maps
- Phase processing logic
- Deck and card management

## License

MIT