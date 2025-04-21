/**
 * GameMechanics.ts
 * Core game logic implementation for the political card game
 */

import { GameState, Player, Card, GamePhase, CenterCard, GameLogEntry, Coalition } from '../types/gameTypes';
import { getCardById } from './mockCards';
import { applyCardEffect } from './CardEffects';

// Constants
const MANDATE_THRESHOLD = 8;
const MAX_ROUNDS = 15;
const BASE_ROLL_RANGE = 6; // Standard D6 dice

/**
 * Initialize a new game state with the given players
 */
export const initializeGame = (
    gameId: string,
    players: Player[],
    hostId: string,
    maxPlayers: number = 4
): GameState => {
    return {
        gameId,
        status: 'lobby',
        phase: 'drawing',
        players,
        hostId,
        round: 0,
        momentumLevel: 3, // Start at neutral momentum
        activePlayerId: null,
        mandateThreshold: MANDATE_THRESHOLD,
        maxPlayers,
        maxRounds: MAX_ROUNDS,
        created: new Date().toISOString(),
        log: [
            {
                text: 'Game created. Waiting for players...',
                timestamp: new Date().toISOString(),
                type: 'system'
            }
        ],
        coalitions: [],
        centerCards: []
    };
};

/**
 * Start the game, transitioning from lobby to active
 */
export const startGame = (gameState: GameState): GameState => {
    const readyPlayers = gameState.players.filter(p => p.isReady);

    if (readyPlayers.length < 2) {
        return {
            ...gameState,
            log: [
                ...gameState.log,
                {
                    text: 'Cannot start game: Need at least 2 ready players.',
                    timestamp: new Date().toISOString(),
                    type: 'error'
                }
            ]
        };
    }

    // Choose starting player randomly
    const startingPlayerIndex = Math.floor(Math.random() * readyPlayers.length);
    const startingPlayer = readyPlayers[startingPlayerIndex];

    return {
        ...gameState,
        status: 'active',
        phase: 'drawing',
        round: 1,
        activePlayerId: startingPlayer.userId,
        log: [
            ...gameState.log,
            {
                text: `Game started! ${ startingPlayer.username } goes first.`,
                timestamp: new Date().toISOString(),
                type: 'system'
            }
        ]
    };
};

/**
 * Handle playing a card
 */
export const playCard = (
    gameState: GameState,
    playerId: string,
    cardId: string
): GameState => {
    // Verify it's the player's turn
    if (gameState.activePlayerId !== playerId) {
        return addLogEntry(gameState, `It's not your turn to play a card.`, 'error');
    }

    // Check if the game phase is correct
    if (gameState.phase !== 'playing') {
        return addLogEntry(gameState, `Cannot play a card in the ${ gameState.phase } phase.`, 'error');
    }

    // Find the player
    const playerIndex = gameState.players.findIndex(p => p.userId === playerId);
    if (playerIndex === -1) {
        return addLogEntry(gameState, `Player not found.`, 'error');
    }

    // Find the card in the player's hand
    const player = gameState.players[playerIndex];
    const cardIndex = player.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
        return addLogEntry(gameState, `Card not found in player's hand.`, 'error');
    }

    const card = player.hand[cardIndex];

    // Remove the card from hand
    const updatedHand = [...player.hand];
    updatedHand.splice(cardIndex, 1);

    // Create updated player with played card
    const updatedPlayer: Player = {
        ...player,
        hand: updatedHand,
        playedCard: card
    };

    // Update players array
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = updatedPlayer;

    // Add card to center cards
    const centerCard: CenterCard = {
        playerId,
        card,
        revealed: false
    };

    const updatedCenterCards = [...gameState.centerCards, centerCard];

    // Transition to next player or phase
    let nextState = {
        ...gameState,
        players: updatedPlayers,
        centerCards: updatedCenterCards,
        log: [
            ...gameState.log,
            {
                text: `${ player.username } played a card.`,
                timestamp: new Date().toISOString(),
                type: 'action'
            }
        ]
    };

    // Check if all players have played a card
    const allPlayersPlayed = nextState.players.every(p => p.playedCard !== null);

    if (allPlayersPlayed) {
        // Move to the revealing phase, starting with the same active player
        nextState = {
            ...nextState,
            phase: 'revealing',
            log: [
                ...nextState.log,
                {
                    text: 'All players have played their cards. Moving to reveal phase.',
                    timestamp: new Date().toISOString(),
                    type: 'system'
                }
            ]
        };
    } else {
        // Find the next player who hasn't played yet
        const nextPlayerIndex = findNextPlayerIndex(nextState, playerIndex);
        nextState.activePlayerId = nextState.players[nextPlayerIndex].userId;
    }

    return nextState;
};

/**
 * Handle revealing a card
 */
export const revealCard = (gameState: GameState, playerId: string): GameState => {
    // Verify it's the player's turn
    if (gameState.activePlayerId !== playerId) {
        return addLogEntry(gameState, `It's not your turn to reveal a card.`, 'error');
    }

    // Check if the game phase is correct
    if (gameState.phase !== 'revealing') {
        return addLogEntry(gameState, `Cannot reveal a card in the ${ gameState.phase } phase.`, 'error');
    }

    // Find the player's center card
    const centerCardIndex = gameState.centerCards.findIndex(cc => cc.playerId === playerId);
    if (centerCardIndex === -1 || !gameState.centerCards[centerCardIndex].card) {
        return addLogEntry(gameState, `No card to reveal.`, 'error');
    }

    // Mark the card as revealed
    const updatedCenterCards = [...gameState.centerCards];
    updatedCenterCards[centerCardIndex] = {
        ...updatedCenterCards[centerCardIndex],
        revealed: true
    };

    // Get the revealed card for log entry
    const revealedCard = updatedCenterCards[centerCardIndex].card;
    const playerName = gameState.players.find(p => p.userId === playerId)?.username || 'Player';

    // Update the game state
    let nextState = {
        ...gameState,
        centerCards: updatedCenterCards,
        log: [
            ...gameState.log,
            {
                text: `${ playerName } revealed ${ revealedCard.name } (${ revealedCard.type }, ${ revealedCard.influence } influence).`,
                timestamp: new Date().toISOString(),
                type: 'action'
            }
        ]
    };

    // Check if all cards have been revealed
    const allCardsRevealed = nextState.centerCards.every(cc => cc.revealed);

    if (allCardsRevealed) {
        // Apply all card effects and move to resolving phase
        nextState = applyAllCardEffects(nextState);
        nextState = {
            ...nextState,
            phase: 'resolving',
            log: [
                ...nextState.log,
                {
                    text: 'All cards have been revealed. Moving to resolving phase.',
                    timestamp: new Date().toISOString(),
                    type: 'system'
                }
            ]
        };
    } else {
        // Find the next player who hasn't revealed yet
        const playerIndex = gameState.players.findIndex(p => p.userId === playerId);
        const nextPlayerIndex = findNextPlayerIndex(nextState, playerIndex);
        nextState.activePlayerId = nextState.players[nextPlayerIndex].userId;
    }

    return nextState;
};

/**
 * Apply all card effects in the proper order
 */
const applyAllCardEffects = (gameState: GameState): GameState => {
    let updatedState = { ...gameState };

    // First apply all ally effects (they're typically stat boosts)
    const allyCards = gameState.centerCards
        .filter(cc => cc.revealed && cc.card.type === 'ally')
        .map(cc => ({ card: cc.card, playerId: cc.playerId }));

    // Then apply all action effects
    const actionCards = gameState.centerCards
        .filter(cc => cc.revealed && cc.card.type === 'action')
        .map(cc => ({ card: cc.card, playerId: cc.playerId }));

    // Finally apply all plot effects (they tend to be most game-changing)
    const plotCards = gameState.centerCards
        .filter(cc => cc.revealed && cc.card.type === 'plot')
        .map(cc => ({ card: cc.card, playerId: cc.playerId }));

    // Combine and sort by influence (higher influence effects happen first)
    const allCardEffects = [...allyCards, ...actionCards, ...plotCards]
        .sort((a, b) => b.card.influence - a.card.influence);

    // Apply each card effect in sequence
    for (const { card, playerId } of allCardEffects) {
        updatedState = applyCardEffect(card, updatedState, playerId);
    }

    return updatedState;
};

/**
 * Handle rolling dice in the resolving phase
 */
export const rollDice = (gameState: GameState, playerId: string): GameState => {
    // Verify it's the player's turn
    if (gameState.activePlayerId !== playerId) {
        return addLogEntry(gameState, `It's not your turn to roll.`, 'error');
    }

    // Check if the game phase is correct
    if (gameState.phase !== 'resolving') {
        return addLogEntry(gameState, `Cannot roll dice in the ${ gameState.phase } phase.`, 'error');
    }

    // Find the player
    const playerIndex = gameState.players.findIndex(p => p.userId === playerId);
    if (playerIndex === -1) {
        return addLogEntry(gameState, `Player not found.`, 'error');
    }

    const player = gameState.players[playerIndex];

    // Roll the dice
    const diceRoll = rollDiceForPlayer(gameState, player);

    // Update the player with the roll result
    const updatedPlayer = {
        ...player,
        lastRoll: diceRoll
    };

    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = updatedPlayer;

    // Check if this player has won a mandate
    const hasWonMandate = determineRollWinner(gameState, updatedPlayers);

    let nextState = {
        ...gameState,
        players: updatedPlayers,
        log: [
            ...gameState.log,
            {
                text: `${ player.username } rolled ${ diceRoll }.`,
                timestamp: new Date().toISOString(),
                type: 'action'
            }
        ]
    };

    // Check if all players have rolled
    const allPlayersRolled = nextState.players.every(p => p.lastRoll !== null);

    if (allPlayersRolled) {
        // Determine the winner of the round
        nextState = resolveRound(nextState);
    } else {
        // Find the next player who hasn't rolled yet
        const nextPlayerIndex = findNextPlayerIndex(nextState, playerIndex);
        nextState.activePlayerId = nextState.players[nextPlayerIndex].userId;
    }

    return nextState;
};

/**
 * Resolve the round and determine the winner
 */
const resolveRound = (gameState: GameState): GameState => {
    // Find the player with the highest roll
    const playersWithRolls = gameState.players.filter(p => p.lastRoll !== null);

    if (playersWithRolls.length === 0) {
        return gameState; // No players rolled, shouldn't happen
    }

    // Sort by roll value, then by influence if tied
    playersWithRolls.sort((a, b) => {
        // Sort by roll (descending)
        const rollDiff = (b.lastRoll ?? 0) - (a.lastRoll ?? 0);
        if (rollDiff !== 0) return rollDiff;

        // If rolls are tied, sort by influence (descending)
        const aInfluence = calculateTotalInfluence(gameState, a);
        const bInfluence = calculateTotalInfluence(gameState, b);
        return bInfluence - aInfluence;
    });

    const winningPlayer = playersWithRolls[0];
    const updatedPlayers = gameState.players.map(player => {
        if (player.userId === winningPlayer.userId) {
            // Award a mandate to the winner
            return {
                ...player,
                mandates: player.mandates + 1,
                // Reset lastRoll for next round
                lastRoll: null,
                // Reset playedCard for next round
                playedCard: null
            };
        }
        // Just reset for other players
        return {
            ...player,
            lastRoll: null,
            playedCard: null
        };
    });

    // Clear center cards for next round
    const updatedCenterCards: CenterCard[] = [];

    // Increment round and reset phase
    const nextRound = gameState.round + 1;
    const gameOver = checkGameOver(gameState, updatedPlayers);

    let nextState: GameState = {
        ...gameState,
        players: updatedPlayers,
        centerCards: updatedCenterCards,
        round: nextRound,
        phase: gameOver ? gameState.phase : 'drawing',
        status: gameOver ? 'finished' : 'active',
        activePlayerId: winningPlayer.userId, // Winner starts the next round
        log: [
            ...gameState.log,
            {
                text: `${ winningPlayer.username } wins the round and gains a mandate! (Total: ${ winningPlayer.mandates + 1 })`,
                timestamp: new Date().toISOString(),
                type: 'system'
            }
        ]
    };

    if (gameOver) {
        // Add game over message
        nextState = {
            ...nextState,
            log: [
                ...nextState.log,
                {
                    text: `Game over! ${ winningPlayer.username } has reached ${ nextState.mandateThreshold } mandates and won the game!`,
                    timestamp: new Date().toISOString(),
                    type: 'system'
                }
            ]
        };
    } else {
        // Add next round message
        nextState = {
            ...nextState,
            log: [
                ...nextState.log,
                {
                    text: `Starting Round ${ nextRound }. ${ winningPlayer.username } plays first.`,
                    timestamp: new Date().toISOString(),
                    type: 'system'
                }
            ]
        };
    }

    return nextState;
};

/**
 * Check if the game is over
 */
const checkGameOver = (gameState: GameState, players: Player[]): boolean => {
    // Check if any player has reached the mandate threshold
    const mandateWinner = players.find(p => p.mandates >= gameState.mandateThreshold);
    if (mandateWinner) {
        return true;
    }

    // Check if we've reached the maximum number of rounds
    if (gameState.round >= gameState.maxRounds) {
        return true;
    }

    return false;
};

/**
 * Calculate total influence for a player based on their played card and any effects
 */
const calculateTotalInfluence = (gameState: GameState, player: Player): number => {
    if (!player.playedCard) {
        return 0;
    }

    let influence = player.playedCard.influence;

    // Add any influence modifiers from effects
    if (player.influenceModifier) {
        influence += player.influenceModifier;
    }

    // Coalition bonus
    if (player.coalition) {
        // Find the active coalition this player is part of
        const activeCoalition = gameState.coalitions.find(c =>
            c.active && (c.player1Id === player.userId || c.player2Id === player.userId)
        );

        if (activeCoalition) {
            // Add coalition bonus (2 points)
            influence += 2;
        }
    }

    // Momentum level can affect certain cards (especially allies)
    if (player.playedCard.type === 'ally' && gameState.momentumLevel > 3) {
        // High momentum benefits allies
        influence += 1;
    }

    return Math.max(0, influence); // Influence can't be negative
};

/**
 * Roll dice for a player, taking into account their influence and other factors
 */
const rollDiceForPlayer = (gameState: GameState, player: Player): number => {
    // Base roll is 1-6
    const baseRoll = Math.floor(Math.random() * BASE_ROLL_RANGE) + 1;

    // Calculate influence modifier (each 3 points of influence = +1 to roll)
    const totalInfluence = calculateTotalInfluence(gameState, player);
    const influenceBonus = Math.floor(totalInfluence / 3);

    return baseRoll + influenceBonus;
};

/**
 * Find the index of the next player who should take a turn
 */
const findNextPlayerIndex = (gameState: GameState, currentPlayerIndex: number): number => {
    const numPlayers = gameState.players.length;

    // Simple round-robin for now
    return (currentPlayerIndex + 1) % numPlayers;
};

/**
 * Determine if the current rolls result in a winner
 */
const determineRollWinner = (gameState: GameState, players: Player[]): boolean => {
    // Only proceed if all players have rolled
    if (!players.every(p => p.lastRoll !== null)) {
        return false;
    }

    // Find the highest roll
    const highestRoll = Math.max(...players.map(p => p.lastRoll || 0));

    // Check if there's a unique winner
    const playersWithHighestRoll = players.filter(p => p.lastRoll === highestRoll);

    return playersWithHighestRoll.length === 1;
};

/**
 * Add a log entry to the game state
 */
const addLogEntry = (gameState: GameState, text: string, type: 'info' | 'action' | 'system' | 'error' = 'info'): GameState => {
    const entry: GameLogEntry = {
        text,
        timestamp: new Date().toISOString(),
        type
    };

    return {
        ...gameState,
        log: [...gameState.log, entry]
    };
};

/**
 * Form a coalition between two players
 */
export const formCoalition = (gameState: GameState, player1Id: string, player2Id: string): GameState => {
    // Check if coalitions are blocked this round
    if (gameState.blockCoalitions) {
        return addLogEntry(gameState, 'Coalitions are blocked this round.', 'error');
    }

    // Check if either player is already in a coalition
    const existingCoalition = gameState.coalitions.find(c =>
        c.active && (c.player1Id === player1Id || c.player1Id === player2Id ||
            c.player2Id === player1Id || c.player2Id === player2Id)
    );

    if (existingCoalition) {
        return addLogEntry(gameState, 'One or both players are already in a coalition.', 'error');
    }

    // Create the new coalition
    const newCoalition: Coalition = {
        player1Id,
        player2Id,
        roundFormed: gameState.round,
        active: true
    };

    // Update players
    const updatedPlayers = gameState.players.map(player => {
        if (player.userId === player1Id) {
            return { ...player, coalition: player2Id };
        }
        if (player.userId === player2Id) {
            return { ...player, coalition: player1Id };
        }
        return player;
    });

    // Get player names for log
    const player1Name = gameState.players.find(p => p.userId === player1Id)?.username || 'Player 1';
    const player2Name = gameState.players.find(p => p.userId === player2Id)?.username || 'Player 2';

    return {
        ...gameState,
        players: updatedPlayers,
        coalitions: [...gameState.coalitions, newCoalition],
        log: [
            ...gameState.log,
            {
                text: `${ player1Name } and ${ player2Name } have formed a coalition!`,
                timestamp: new Date().toISOString(),
                type: 'system'
            }
        ]
    };
};

/**
 * Break a coalition between two players
 */
export const breakCoalition = (gameState: GameState, player1Id: string, player2Id: string): GameState => {
    // Find the coalition
    const coalitionIndex = gameState.coalitions.findIndex(c =>
        c.active && ((c.player1Id === player1Id && c.player2Id === player2Id) ||
            (c.player1Id === player2Id && c.player2Id === player1Id))
    );

    if (coalitionIndex === -1) {
        return addLogEntry(gameState, 'No active coalition found between these players.', 'error');
    }

    // Update the coalition to inactive
    const updatedCoalitions = [...gameState.coalitions];
    updatedCoalitions[coalitionIndex] = {
        ...updatedCoalitions[coalitionIndex],
        active: false
    };

    // Update players
    const updatedPlayers = gameState.players.map(player => {
        if (player.userId === player1Id || player.userId === player2Id) {
            return { ...player, coalition: null };
        }
        return player;
    });

    // Get player names for log
    const player1Name = gameState.players.find(p => p.userId === player1Id)?.username || 'Player 1';
    const player2Name = gameState.players.find(p => p.userId === player2Id)?.username || 'Player 2';

    return {
        ...gameState,
        players: updatedPlayers,
        coalitions: updatedCoalitions,
        log: [
            ...gameState.log,
            {
                text: `The coalition between ${ player1Name } and ${ player2Name } has been broken!`,
                timestamp: new Date().toISOString(),
                type: 'system'
            }
        ]
    };
};

// Füge neue Spielmechaniken hinzu
export class GameMechanics {
    /**
     * Initialisiert eine neue Spielrunde
     */
    static initializeRound(gameState: GameState): GameState {
        // Ab Runde 2: Momentumwurf
        if (gameState.round > 1) {
            gameState = this.handleMomentumRoll(gameState);
        }

        // Ziehe neue Karten
        gameState = this.drawCards(gameState);

        return {
            ...gameState,
            phase: 'charakterkarte',
            activePlayerId: this.determineStartingPlayer(gameState)
        };
    }

    /**
     * Führt den Momentumwurf durch
     */
    private static handleMomentumRoll(gameState: GameState): GameState {
        // Spieler mit den wenigsten Mandaten würfelt
        const playerWithLeastMandates = this.getPlayerWithLeastMandates(gameState);
        const roll = Math.floor(Math.random() * 6) + 1; // W6

        // Aktualisiere Momentum basierend auf Wurf
        const newMomentum = roll;

        return {
            ...gameState,
            momentumLevel: newMomentum,
            log: [
                ...gameState.log,
                {
                    text: `${ playerWithLeastMandates.name } würfelt ${ roll } für Momentum.`,
                    timestamp: Date.now(),
                    type: 'game'
                }
            ]
        };
    }

    /**
     * Verarbeitet das Spielen einer Charakterkarte
     */
    static playCharakterkarte(gameState: GameState, playerId: string, cardId: string): GameState {
        const player = gameState.players.find(p => p.id === playerId);
        const card = this.getCardById(gameState, cardId);

        if (!player || !card || card.type !== 'charakterkarte') {
            return gameState;
        }

        // Prüfe ob Fallenkarten aktiviert werden
        const activatedTraps = this.checkForActivatedTraps(gameState, card);

        // Wende Karteneffekt an
        let updatedState = this.applyCardEffect(gameState, card, playerId);

        // Wende aktivierte Fallenkarten an
        activatedTraps.forEach(trap => {
            updatedState = this.applyTrapEffect(updatedState, trap);
        });

        return updatedState;
    }

    /**
     * Prüft auf aktivierte Fallenkarten
     */
    private static checkForActivatedTraps(gameState: GameState, playedCard: Card): Card[] {
        const activatedTraps: Card[] = [];

        gameState.players.forEach(player => {
            player.played
                .map(cardId => this.getCardById(gameState, cardId))
                .filter((card): card is Card => card !== undefined && card.type === 'fallenkarte')
                .forEach(trap => {
                    if (this.checkTrapCondition(trap, playedCard, gameState)) {
                        activatedTraps.push(trap);
                    }
                });
        });

        return activatedTraps;
    }

    /**
     * Prüft die Aktivierungsbedingung einer Fallenkarte
     */
    private static checkTrapCondition(trap: Card, playedCard: Card, gameState: GameState): boolean {
        // Implementiere hier die Bedingungsprüfung für jede Fallenkarte
        switch (trap.id) {
            case "30": // Shitstorm-Kaskade
                return gameState.momentumLevel >= 5;
            case "31": // Lohnerhöhung
                return playedCard.tags?.includes('arbeit') || playedCard.tags?.includes('streik');
            // ... weitere Fallenkarten ...
            default:
                return false;
        }
    }
}