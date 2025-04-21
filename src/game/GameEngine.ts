/**
 * GameEngine.ts
 * Core game mechanics and state management for the Political Card Game
 */

import {
    GameState,
    Player,
    Card,
    GamePhase,
    GameStatus,
    DiceRoll,
    CenterCard,
    GameLogEntry
} from '../types/gameTypes';

/**
 * Game engine for managing the political card game state and logic
 */
class GameEngine {
    /**
     * Initialize a new game with starting parameters
     */
    static initializeGame(
        gameId: string,
        players: Player[],
        hostId: string,
        mandateThreshold: number = 8,
        maxRounds: number = 20
    ): GameState {
        // Create initial game state
        return {
            gameId,
            status: 'lobby',
            phase: 'momentum',
            players,
            hostId,
            round: 0,
            momentumLevel: 3, // Start at neutral momentum
            activePlayerId: null,
            mandateThreshold,
            maxPlayers: players.length,
            maxRounds,
            created: new Date().toISOString(),
            log: [
                {
                    text: 'Game created. Waiting for players...',
                    timestamp: new Date().toISOString(),
                    type: 'system'
                }
            ],
            coalitions: [],
            centerCards: [],
            deck: [],
            discard: [],
            blockCoalitions: false,
            revealedHands: [],
            temporaryEffects: [],
            roundStartTime: Date.now(),
            phaseStartTime: Date.now(),
            diceResults: [],
            phaseStep: 0
        };
    }

    /**
     * Start the game by transitioning from lobby to active play
     */
    static startGame(gameState: GameState): GameState {
        if (gameState.status !== 'lobby') {
            throw new Error('Game has already started');
        }

        // Need at least 2 players
        if (gameState.players.length < 2) {
            throw new Error('Need at least 2 players to start the game');
        }

        // Check if all players are ready
        const allPlayersReady = gameState.players.every(player => player.isReady);
        if (!allPlayersReady) {
            throw new Error('All players must be ready to start the game');
        }

        // Initialize player hands
        const updatedPlayers = gameState.players.map(player => ({
            ...player,
            hand: [],
            playedCard: null,
            mandates: 0,
            influenceModifier: 0,
            protectedMandates: false,
            canPlaySpecial: true,
            discardNext: false
        }));

        // Deal initial cards (6 per player)
        // In a real implementation, this would draw from the actual deck
        // For now, we'll just create placeholder hands

        // Start round 1 - momentum phase
        return {
            ...gameState,
            status: 'active',
            phase: 'momentum',
            players: updatedPlayers,
            round: 1,
            momentumLevel: 3, // Start at neutral (middle) momentum
            activePlayerId: updatedPlayers[0].userId, // First player starts
            log: [
                ...gameState.log,
                {
                    text: 'Game started. Round 1 begins.',
                    timestamp: new Date().toISOString(),
                    type: 'system',
                    round: 1
                }
            ],
            roundStartTime: Date.now(),
            phaseStartTime: Date.now()
        };
    }

    /**
     * Roll dice for momentum and update game state
     */
    static rollForMomentum(gameState: GameState, playerId: string): GameState {
        // Validate current phase
        if (gameState.phase !== 'momentum') {
            throw new Error('Not in momentum phase');
        }

        // Validate active player
        if (gameState.activePlayerId !== playerId) {
            throw new Error('Not your turn to roll for momentum');
        }

        // For first round, start at momentum level 1 without rolling
        if (gameState.round === 1) {
            // Create log entry
            const logEntry: GameLogEntry = {
                text: `Round 1 begins with Momentum Level 1.`,
                timestamp: new Date().toISOString(),
                type: 'system',
                round: gameState.round
            };

            // Update game state
            return {
                ...gameState,
                momentumLevel: 1,
                phase: 'coalition', // Move to coalition phase
                log: [...gameState.log, logEntry],
                phaseStartTime: Date.now()
            };
        }

        // For rounds after the first, find player with fewest mandates
        const playersByMandates = [...gameState.players].sort((a, b) =>
            (a.mandates || 0) - (b.mandates || 0)
        );
        const playerWithFewestMandates = playersByMandates[0];

        // Only the player with fewest mandates can roll for momentum
        if (playerId !== playerWithFewestMandates.userId) {
            throw new Error('Only the player with the fewest mandates can roll for momentum');
        }

        // Roll the die (1-6)
        const diceRoll = Math.floor(Math.random() * 6) + 1;

        // Record the dice roll
        const diceRollRecord: DiceRoll = {
            playerId,
            value: diceRoll,
            purpose: 'momentum',
            timestamp: Date.now()
        };

        // The dice roll directly determines the momentum level
        const newMomentumLevel = diceRoll;

        // Get the player name
        const playerName = gameState.players.find(p => p.userId === playerId)?.username || 'Unknown Player';

        // Create detailed log entry explaining momentum effects
        let momentumEffectText = '';
        switch (newMomentumLevel) {
            case 1:
                momentumEffectText = '+1 mandate for winner, no loss for others';
                break;
            case 2:
                momentumEffectText = '+1/-1 mandates';
                break;
            case 3:
                momentumEffectText = '+2/-2 mandates';
                break;
            case 4:
                momentumEffectText = '+3/-3 mandates';
                break;
            case 5:
                momentumEffectText = 'Winner gains and losers lose dice roll (1-6) mandates';
                break;
            case 6:
                momentumEffectText = 'Winner gains 4 mandates, losers lose ALL mandates';
                break;
        }

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ playerName } rolled a ${ diceRoll } for momentum. Momentum level is ${ newMomentumLevel }: ${ momentumEffectText }`,
            timestamp: new Date().toISOString(),
            type: 'action',
            playerId,
            round: gameState.round
        };

        // Update game state
        return {
            ...gameState,
            momentumLevel: newMomentumLevel,
            phase: 'coalition', // Move to coalition phase
            diceResults: [...gameState.diceResults, diceRollRecord],
            log: [...gameState.log, logEntry],
            phaseStartTime: Date.now()
        };
    }

    /**
     * Play a card from a player's hand (face down)
     */
    static playCard(gameState: GameState, playerId: string, cardId: string): GameState {
        // Validate current phase
        if (gameState.phase !== 'play') {
            throw new Error('Not in the play phase');
        }

        // Find the player
        const playerIndex = gameState.players.findIndex(p => p.userId === playerId);
        if (playerIndex === -1) {
            throw new Error('Player not found');
        }

        const player = gameState.players[playerIndex];

        // Find the card in player's hand
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            throw new Error('Card not found in player hand');
        }

        const card = player.hand[cardIndex];

        // Check if player has already played a card
        const existingCenterCard = gameState.centerCards.find(cc => cc.playerId === playerId);
        if (existingCenterCard) {
            throw new Error('Player has already played a card this round');
        }

        // Remove card from hand
        const updatedHand = [...player.hand];
        updatedHand.splice(cardIndex, 1);

        // Update player with new hand
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = {
            ...player,
            hand: updatedHand
        };

        // Add card to center (face down)
        const centerCard: CenterCard = {
            playerId,
            card,
            revealed: false,
            position: gameState.centerCards.length
        };

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ getPlayerName(gameState, playerId) } played a card face down.`,
            timestamp: new Date().toISOString(),
            type: 'action',
            playerId,
            round: gameState.round
        };

        // Check if all players have played a card
        const updatedCenterCards = [...gameState.centerCards, centerCard];
        const allPlayersPlayed = updatedPlayers.every(p =>
            updatedCenterCards.some(cc => cc.playerId === p.userId)
        );

        // If all players have played, move to the next phase
        const newPhase = allPlayersPlayed ? 'effect' : 'play';

        // Update game state
        return {
            ...gameState,
            players: updatedPlayers,
            centerCards: updatedCenterCards,
            phase: newPhase,
            log: [...gameState.log, logEntry],
            phaseStartTime: newPhase !== gameState.phase ? Date.now() : gameState.phaseStartTime
        };
    }

    /**
     * Reveal all face-down cards and resolve their effects
     */
    static revealCards(gameState: GameState): GameState {
        // Validate current phase
        if (gameState.phase !== 'effect') {
            throw new Error('Not in effect phase');
        }

        // Reveal all center cards
        const revealedCards = gameState.centerCards.map(centerCard => ({
            ...centerCard,
            revealed: true
        }));

        // Create log entries for revealed cards
        const revealLogEntries = revealedCards.map(centerCard => ({
            text: `${ getPlayerName(gameState, centerCard.playerId) } revealed ${ centerCard.card?.name || 'a card' }.`,
            timestamp: new Date().toISOString(),
            type: 'system' as const,
            playerId: centerCard.playerId,
            cardId: centerCard.card?.id,
            round: gameState.round
        }));

        // Update player's played card reference
        const updatedPlayers = gameState.players.map(player => {
            const playerCard = revealedCards.find(cc => cc.playerId === player.userId);
            return {
                ...player,
                playedCard: playerCard?.card || null
            };
        });

        // Update game state and move to special card phase
        return {
            ...gameState,
            centerCards: revealedCards,
            players: updatedPlayers,
            phase: 'special',
            log: [...gameState.log, ...revealLogEntries],
            phaseStartTime: Date.now()
        };
    }

    /**
     * Handle special card phase - giving players the opportunity to play special cards
     */
    static playSpecialCard(gameState: GameState, playerId: string, cardId: string): GameState {
        // Validate current phase
        if (gameState.phase !== 'special') {
            throw new Error('Not in special card phase');
        }

        // Find the player
        const playerIndex = gameState.players.findIndex(p => p.userId === playerId);
        if (playerIndex === -1) {
            throw new Error('Player not found');
        }

        const player = gameState.players[playerIndex];

        // Check if player can play special cards
        if (!player.canPlaySpecial) {
            throw new Error('Player cannot play special cards this round');
        }

        // Find the card in player's hand
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            throw new Error('Card not found in player hand');
        }

        const card = player.hand[cardIndex];

        // Verify it's a special card
        if (card.type !== 'special') {
            throw new Error('Only special cards can be played in this phase');
        }

        // Remove card from hand
        const updatedHand = [...player.hand];
        updatedHand.splice(cardIndex, 1);

        // Update player with new hand
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = {
            ...player,
            hand: updatedHand,
            canPlaySpecial: false // Player can only play one special card per round
        };

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ getPlayerName(gameState, playerId) } played special card "${ card.name }".`,
            timestamp: new Date().toISOString(),
            type: 'action',
            playerId,
            cardId: card.id,
            round: gameState.round
        };

        // Add card to discard pile
        const updatedDiscard = [...gameState.discard, card];

        // Apply special card effect
        // In a real implementation, this would call a separate effect resolver
        // For now, we'll just log that the effect happened

        const effectLogEntry: GameLogEntry = {
            text: `${ card.name } effect: ${ card.effect }`,
            timestamp: new Date().toISOString(),
            type: 'system',
            playerId,
            cardId: card.id,
            round: gameState.round
        };

        // Update game state
        return {
            ...gameState,
            players: updatedPlayers,
            discard: updatedDiscard,
            log: [...gameState.log, logEntry, effectLogEntry]
        };
    }

    /**
     * Move to coalition phase (4-player games only) or skip to influence comparison
     */
    static moveToCoalitionOrInfluence(gameState: GameState): GameState {
        // Validate current phase
        if (gameState.phase !== 'special') {
            throw new Error('Not in special card phase');
        }

        // Determine next phase based on player count
        const nextPhase = gameState.players.length === 4 && !gameState.blockCoalitions
            ? 'coalition'
            : 'influence';

        // Create log entry
        const logEntry: GameLogEntry = {
            text: nextPhase === 'coalition'
                ? 'Coalition phase begins.'
                : 'Moving to influence comparison.',
            timestamp: new Date().toISOString(),
            type: 'system',
            round: gameState.round
        };

        // Update game state
        return {
            ...gameState,
            phase: nextPhase,
            log: [...gameState.log, logEntry],
            phaseStartTime: Date.now()
        };
    }

    /**
     * Handle coalition phase where players can form alliances
     */
    static handleCoalitionPhase(gameState: GameState): GameState {
        // Validate current phase
        if (gameState.phase !== 'coalition') {
            throw new Error('Not in coalition phase');
        }

        // Create log entry
        const logEntry: GameLogEntry = {
            text: 'Coalition phase: Players may form alliances or skip this round.',
            timestamp: new Date().toISOString(),
            type: 'system',
            round: gameState.round
        };

        // Update game state and prepare for character play phase
        return {
            ...gameState,
            phase: 'character',
            log: [...gameState.log, logEntry],
            phaseStartTime: Date.now()
        };
    }

    /**
     * Form a coalition between two players
     */
    static proposeCoalition(gameState: GameState, initiatorId: string, targetId: string): GameState {
        // Validate current phase
        if (gameState.phase !== 'coalition') {
            throw new Error('Coalitions can only be formed during the coalition phase');
        }

        // Check if either player is already in a coalition
        const initiatorInCoalition = gameState.players.find(p => p.userId === initiatorId)?.coalition !== null;
        const targetInCoalition = gameState.players.find(p => p.userId === targetId)?.coalition !== null;

        if (initiatorInCoalition || targetInCoalition) {
            throw new Error('One or both players are already in a coalition');
        }

        // Get player names
        const initiatorName = gameState.players.find(p => p.userId === initiatorId)?.username || 'Unknown Player';
        const targetName = gameState.players.find(p => p.userId === targetId)?.username || 'Unknown Player';

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ initiatorName } has proposed a coalition with ${ targetName }.`,
            timestamp: new Date().toISOString(),
            type: 'action',
            playerId: initiatorId,
            round: gameState.round
        };

        // Add proposed coalition to game state (pending acceptance)
        const proposedCoalition = {
            initiatorId,
            targetId,
            status: 'pending'
        };

        return {
            ...gameState,
            proposedCoalitions: [...(gameState.proposedCoalitions || []), proposedCoalition],
            log: [...gameState.log, logEntry]
        };
    }

    /**
     * Accept a coalition proposal
     */
    static acceptCoalition(gameState: GameState, targetId: string, initiatorId: string): GameState {
        // Validate current phase
        if (gameState.phase !== 'coalition') {
            throw new Error('Coalitions can only be accepted during the coalition phase');
        }

        // Check if the proposal exists
        const proposalIndex = (gameState.proposedCoalitions || []).findIndex(
            p => p.initiatorId === initiatorId && p.targetId === targetId && p.status === 'pending'
        );

        if (proposalIndex === -1) {
            throw new Error('No pending coalition proposal found');
        }

        // Get player names
        const initiatorName = gameState.players.find(p => p.userId === initiatorId)?.username || 'Unknown Player';
        const targetName = gameState.players.find(p => p.userId === targetId)?.username || 'Unknown Player';

        // Update players to be in coalition
        const updatedPlayers = gameState.players.map(player => {
            if (player.userId === initiatorId) {
                return { ...player, coalition: targetId };
            }
            if (player.userId === targetId) {
                return { ...player, coalition: initiatorId };
            }
            return player;
        });

        // Create a formal coalition object
        const newCoalition: Coalition = {
            player1Id: initiatorId,
            player2Id: targetId,
            roundFormed: gameState.round,
            active: true,
            stability: 5 // Default stability value
        };

        // Update proposed coalitions
        const updatedProposals = [...(gameState.proposedCoalitions || [])];
        updatedProposals[proposalIndex] = {
            ...updatedProposals[proposalIndex],
            status: 'accepted'
        };

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ targetName } has accepted ${ initiatorName }'s coalition proposal. They are now allies!`,
            timestamp: new Date().toISOString(),
            type: 'system',
            playerId: targetId,
            round: gameState.round
        };

        return {
            ...gameState,
            players: updatedPlayers,
            coalitions: [...(gameState.coalitions || []), newCoalition],
            proposedCoalitions: updatedProposals,
            log: [...gameState.log, logEntry]
        };
    }

    /**
     * Decline a coalition proposal
     */
    static declineCoalition(gameState: GameState, targetId: string, initiatorId: string): GameState {
        // Validate current phase
        if (gameState.phase !== 'coalition') {
            throw new Error('Coalition actions only available during coalition phase');
        }

        // Check if the proposal exists
        const proposalIndex = (gameState.proposedCoalitions || []).findIndex(
            p => p.initiatorId === initiatorId && p.targetId === targetId && p.status === 'pending'
        );

        if (proposalIndex === -1) {
            throw new Error('No pending coalition proposal found');
        }

        // Get player names
        const initiatorName = gameState.players.find(p => p.userId === initiatorId)?.username || 'Unknown Player';
        const targetName = gameState.players.find(p => p.userId === targetId)?.username || 'Unknown Player';

        // Update proposal status
        const updatedProposals = [...(gameState.proposedCoalitions || [])];
        updatedProposals[proposalIndex] = {
            ...updatedProposals[proposalIndex],
            status: 'declined'
        };

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ targetName } has declined ${ initiatorName }'s coalition proposal.`,
            timestamp: new Date().toISOString(),
            type: 'action',
            playerId: targetId,
            round: gameState.round
        };

        return {
            ...gameState,
            proposedCoalitions: updatedProposals,
            log: [...gameState.log, logEntry]
        };
    }

    /**
     * Skip participating in the current round
     */
    static skipRound(gameState: GameState, playerId: string): GameState {
        // Validate we're in a phase where skipping is allowed
        if (gameState.phase !== 'coalition' && gameState.phase !== 'character') {
            throw new Error('Players can only skip during coalition or character phase');
        }

        // Find the player
        const player = gameState.players.find(p => p.userId === playerId);
        if (!player) {
            throw new Error('Player not found');
        }

        // Update player to skip this round
        const updatedPlayers = gameState.players.map(p =>
            p.userId === playerId ? { ...p, isSkippingRound: true } : p
        );

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ player.username } has chosen to skip this round.`,
            timestamp: new Date().toISOString(),
            type: 'action',
            playerId,
            round: gameState.round
        };

        return {
            ...gameState,
            players: updatedPlayers,
            log: [...gameState.log, logEntry]
        };
    }

    /**
     * Compare player influence and award mandates
     */
    static compareInfluence(gameState: GameState): GameState {
        // Validate current phase
        if (gameState.phase !== 'resolution') {
            throw new Error('Not in resolution phase');
        }

        // Skip players who chose to skip this round
        const participatingPlayers = gameState.players.filter(p => !p.isSkippingRound);

        if (participatingPlayers.length === 0) {
            // No players participated this round
            const skipLogEntry: GameLogEntry = {
                text: `All players skipped this round. No mandates awarded.`,
                timestamp: new Date().toISOString(),
                type: 'system',
                round: gameState.round
            };

            // Reset skipping flags for next round
            const updatedPlayers = gameState.players.map(p => ({
                ...p,
                isSkippingRound: false
            }));

            return {
                ...gameState,
                players: updatedPlayers,
                phase: 'backfire',
                log: [...gameState.log, skipLogEntry],
                phaseStartTime: Date.now()
            };
        }

        // Calculate total influence for each participating player including coalitions
        const playerInfluence = participatingPlayers.map(player => {
            // Base influence from played card
            const baseInfluence = player.playedCard?.influence || 0;

            // Add any influence modifiers
            let totalInfluence = baseInfluence + (player.influenceModifier || 0);

            // Check if player is in a coalition
            if (player.coalition) {
                // Find coalition partner
                const partner = participatingPlayers.find(p => p.userId === player.coalition);

                // Add partner's influence if they're participating
                if (partner && partner.playedCard) {
                    // Coalition partners combine their influence
                    const partnerInfluence = partner.playedCard.influence + (partner.influenceModifier || 0);
                    totalInfluence += partnerInfluence;
                }
            }

            return {
                playerId: player.userId,
                username: player.username,
                influence: totalInfluence,
                coalition: player.coalition,
                isInCoalition: player.coalition !== null
            };
        });

        // Sort by influence (descending)
        playerInfluence.sort((a, b) => b.influence - a.influence);

        // Create log entries for influence values
        const influenceLogEntries = playerInfluence.map(pi => ({
            text: `${ pi.username }${ pi.isInCoalition ? ' (in coalition)' : '' }: ${ pi.influence } influence`,
            timestamp: new Date().toISOString(),
            type: 'info' as const,
            playerId: pi.playerId,
            round: gameState.round
        }));

        // Determine winner(s)
        const winner = playerInfluence[0];
        const isCoalitionWin = winner.isInCoalition;

        // Determine mandates to award based on momentum level
        let mandatesToAward = 1; // Default
        let mandatesToLose = 0;

        switch (gameState.momentumLevel) {
            case 1:
                // Level 1: +1 mandate at win, no loss
                mandatesToAward = 1;
                mandatesToLose = 0;
                break;

            case 2:
                // Level 2: +1 / -1 mandate
                mandatesToAward = 1;
                mandatesToLose = 1;
                break;

            case 3:
                // Level 3: +2 / -2 mandates
                mandatesToAward = 2;
                mandatesToLose = 2;
                break;

            case 4:
                // Level 4: +3 / -3 mandates
                mandatesToAward = 3;
                mandatesToLose = 3;
                break;

            case 5:
                // Level 5: W6 mandates at win/loss
                const diceRoll = Math.floor(Math.random() * 6) + 1;
                mandatesToAward = diceRoll;
                mandatesToLose = diceRoll;

                // Log the dice roll
                influenceLogEntries.push({
                    text: `Momentum Level 5: Dice rolled ${ diceRoll } for mandate gain/loss`,
                    timestamp: new Date().toISOString(),
                    type: 'info' as const,
                    round: gameState.round
                });
                break;

            case 6:
                // Level 6: +4 mandates at win / lose ALL mandates at loss
                mandatesToAward = 4;
                mandatesToLose = -1; // Special value to indicate "lose all"
                break;
        }

        // Adjust mandates for coalition or solo win
        if (isCoalitionWin) {
            // Coalition win: -1 mandate for both partners
            mandatesToAward = Math.max(1, mandatesToAward - 1);
        } else {
            // Solo win: +2 mandates extra
            mandatesToAward += 2;
        }

        // Update players with new mandate counts
        const updatedPlayers = gameState.players.map(player => {
            // Reset skipping flag for next round
            let updatedPlayer = {
                ...player,
                isSkippingRound: false
            };

            if (player.userId === winner.playerId) {
                // Winner gains mandates
                updatedPlayer.mandates = (updatedPlayer.mandates || 0) + mandatesToAward;
                updatedPlayer.wonLastRound = true;
            }
            else if (winner.coalition === player.userId) {
                // Coalition partner also gains mandates
                updatedPlayer.mandates = (updatedPlayer.mandates || 0) + mandatesToAward;
                updatedPlayer.wonLastRound = true;
            }
            else if (!player.isSkippingRound && player.playedCard) {
                // Losers who participated lose mandates
                if (mandatesToLose === -1) {
                    // Special case: lose all mandates
                    updatedPlayer.mandates = 0;
                } else {
                    // Normal case: lose specific number of mandates
                    updatedPlayer.mandates = Math.max(0, (updatedPlayer.mandates || 0) - mandatesToLose);
                }
                updatedPlayer.wonLastRound = false;
            }

            return updatedPlayer;
        });

        // Create mandate award log entry
        const winnerName = winner.username;
        const coalitionPartnerName = winner.coalition
            ? gameState.players.find(p => p.userId === winner.coalition)?.username
            : null;

        const awardLogEntry: GameLogEntry = {
            text: coalitionPartnerName
                ? `Coalition of ${ winnerName } and ${ coalitionPartnerName } wins with ${ winner.influence } influence and gains ${ mandatesToAward } mandate(s) each.`
                : `${ winnerName } wins the round with ${ winner.influence } influence and gains ${ mandatesToAward } mandate(s).`,
            timestamp: new Date().toISOString(),
            type: 'system',
            playerId: winner.playerId,
            round: gameState.round
        };

        // Add mandate loss log if applicable
        const lossLogEntry = mandatesToLose > 0 ? {
            text: `Losing players ${ mandatesToLose === -1 ? 'lose ALL their mandates' : `lose ${ mandatesToLose } mandate(s)` }.`,
            timestamp: new Date().toISOString(),
            type: 'system' as const,
            round: gameState.round
        } : null;

        // Check for alternate win condition (40+ influence)
        const influenceWinner = playerInfluence.find(p => p.influence >= gameState.settings.alternateWinThreshold);
        let influenceWinLogEntry = null;

        if (influenceWinner) {
            influenceWinLogEntry = {
                text: `${ influenceWinner.username } has reached ${ influenceWinner.influence } influence, exceeding the alternate win threshold of ${ gameState.settings.alternateWinThreshold }!`,
                timestamp: new Date().toISOString(),
                type: 'system' as const,
                playerId: influenceWinner.playerId,
                round: gameState.round
            };
        }

        // Check if game is over (winner reached mandate threshold)
        const mandateWinner = updatedPlayers.find(p => p.mandates >= gameState.mandateThreshold);
        const isGameOver = mandateWinner !== undefined || influenceWinner !== undefined;

        // Create game over log entry if applicable
        const gameOverLogEntry = isGameOver ? {
            text: mandateWinner
                ? `${ mandateWinner.username } has reached ${ mandateWinner.mandates } mandates and wins the game!`
                : `${ influenceWinner?.username } has reached ${ influenceWinner?.influence } influence and wins the game!`,
            timestamp: new Date().toISOString(),
            type: 'system' as const,
            playerId: (mandateWinner || influenceWinner)?.userId,
            round: gameState.round
        } : null;

        // Combine log entries
        const updatedLog = [
            ...gameState.log,
            ...influenceLogEntries,
            awardLogEntry
        ];

        if (lossLogEntry) updatedLog.push(lossLogEntry);
        if (influenceWinLogEntry) updatedLog.push(influenceWinLogEntry);
        if (gameOverLogEntry) updatedLog.push(gameOverLogEntry);

        // Update game state
        return {
            ...gameState,
            players: updatedPlayers,
            phase: isGameOver ? 'final' : 'backfire',
            status: isGameOver ? 'completed' : 'active',
            log: updatedLog,
            phaseStartTime: Date.now()
        };
    }

    /**
     * Check for and apply backfire penalties to players in losing coalitions
     * @returns {GameState} Updated game state with backfire penalties applied
     * @throws {Error} If called in the wrong phase or with invalid game state
     */
    static checkCoalitionBackfire(gameState: GameState): GameState {
        // Pre-execution sanity checks
        if (!gameState) {
            throw new Error('Invalid game state: Game state cannot be null or undefined');
        }

        // Validate the game state structure
        if (typeof gameState !== 'object' || !gameState.phase || !Array.isArray(gameState.players)) {
            throw new Error('Invalid game state structure: Missing required properties');
        }

        // Validate current phase
        if (gameState.phase !== 'backfire') {
            throw new Error(`Invalid game phase: Expected 'backfire' phase, but got '${ gameState.phase }'`);
        }

        // Validate players array
        if (gameState.players.length === 0) {
            console.warn('No players found in game state, skipping coalition backfire check');
            return gameState;
        }

        // Type validate coalitions
        if (!Array.isArray(gameState.coalitions)) {
            console.warn('Coalitions not found or not an array, skipping backfire penalties');

            // Return game state with advancement to next phase
            return {
                ...gameState,
                phase: 'setup',
                phaseStartTime: Date.now(),
                log: [
                    ...gameState.log,
                    {
                        text: "Coalition backfire check skipped due to missing coalitions data.",
                        timestamp: new Date().toISOString(),
                        type: 'system',
                        round: gameState.round
                    }
                ]
            };
        }

        // Identify active coalitions and their members
        const activeCoalitions: Map<string, string[]> = new Map();

        // Safely process coalitions
        try {
            gameState.coalitions.forEach(coalition => {
                // Skip invalid coalition entries
                if (!coalition || typeof coalition !== 'object' || !coalition.name || !coalition.playerId) {
                    console.warn('Skipping invalid coalition entry', coalition);
                    return;
                }

                if (!activeCoalitions.has(coalition.name)) {
                    activeCoalitions.set(coalition.name, []);
                }

                const members = activeCoalitions.get(coalition.name);
                if (members) {
                    members.push(coalition.playerId);
                }
            });
        } catch (error) {
            console.error('Error processing coalitions:', error);

            // Continue with empty coalitions rather than breaking
            activeCoalitions.clear();
        }

        // If no active coalitions, move to setup phase
        if (activeCoalitions.size === 0) {
            const logEntry: GameLogEntry = {
                text: "No active coalitions found in this round.",
                timestamp: new Date().toISOString(),
                type: 'system',
                round: gameState.round
            };

            return {
                ...gameState,
                phase: 'setup',
                phaseStartTime: Date.now(),
                log: [...gameState.log, logEntry]
            };
        }

        // Check each coalition to see if all members lost this round
        const losingCoalitions: Map<string, string[]> = new Map();

        activeCoalitions.forEach((memberIds, coalitionName) => {
            // Skip empty arrays to prevent false positives
            if (!memberIds || memberIds.length === 0) {
                console.warn(`Coalition "${ coalitionName }" has no members, skipping`);
                return;
            }

            // Check if all members lost (didn't win last round)
            const allMembersLost = memberIds.every(id => {
                // Validate player ID before checking
                if (!id || typeof id !== 'string') {
                    console.warn(`Invalid player ID in coalition "${ coalitionName }":`, id);
                    return false; // Consider this an exception case that doesn't trigger backfire
                }

                const player = gameState.players.find(p => p.userId === id);

                // Player not found or property missing
                if (!player) {
                    console.warn(`Player with ID "${ id }" not found in coalition "${ coalitionName }"`);
                    return false;
                }

                // Check for undefined wonLastRound - treat as not having won
                return player.wonLastRound !== true;
            });

            if (allMembersLost) {
                losingCoalitions.set(coalitionName, memberIds);
            }
        });

        // If no losing coalitions, move to setup phase
        if (losingCoalitions.size === 0) {
            const logEntry: GameLogEntry = {
                text: "All coalitions had at least one winning member.",
                timestamp: new Date().toISOString(),
                type: 'system',
                round: gameState.round
            };
            return {
                ...gameState,
                phase: 'setup',
                phaseStartTime: Date.now(),
                log: [...gameState.log, logEntry]
            };
        }

        // Handle backfire for losing coalitions
        const backfireLogEntries: GameLogEntry[] = [];
        let updatedPlayers = [...gameState.players];

        // Apply penalties to each losing coalition
        losingCoalitions.forEach((memberIds, coalitionName) => {
            backfireLogEntries.push({
                text: `Coalition "${ coalitionName }" lost this round! Rolling for backfire penalties...`,
                timestamp: new Date().toISOString(),
                type: 'system',
                round: gameState.round
            });

            // Apply penalties to each member
            memberIds.forEach(playerId => {
                try {
                    // Validate player ID
                    if (!playerId || typeof playerId !== 'string') {
                        console.warn('Invalid player ID, skipping penalty application:', playerId);
                        return;
                    }

                    // Find player index for safe update
                    const playerIndex = updatedPlayers.findIndex(p => p.userId === playerId);
                    if (playerIndex === -1) {
                        console.warn(`Player with ID "${ playerId }" not found, skipping penalty`);
                        return;
                    }

                    const player = updatedPlayers[playerIndex];

                    // Validate player object structure
                    if (!player || typeof player !== 'object') {
                        console.warn(`Invalid player object at index ${ playerIndex }, skipping penalty`);
                        return;
                    }

                    // Roll a random number between 1-3 for penalty type (with bounds check)
                    const penaltyRoll = Math.min(Math.max(Math.floor(Math.random() * 3) + 1, 1), 3);
                    let penaltyText = "";

                    // Apply penalty based on roll
                    switch (penaltyRoll) {
                        case 1: // Discard a card
                            // Validate hand is an array before operating
                            if (!Array.isArray(player.hand)) {
                                console.warn(`Player ${ playerId } has invalid hand property, skipping discard penalty`);
                                penaltyText = `${ player.username || 'Player' } has an invalid hand, penalty application failed.`;

                                // Still reset state flags
                                updatedPlayers[playerIndex] = {
                                    ...player,
                                    hasPlayedCard: false,
                                    hasRevealed: false
                                };
                                break;
                            }

                            if (player.hand.length > 0) {
                                // Randomly select a card to discard
                                const cardIndex = Math.floor(Math.random() * player.hand.length);
                                const discardedCard = player.hand[cardIndex];

                                // Update player's hand
                                const newHand = [...player.hand];
                                newHand.splice(cardIndex, 1);

                                updatedPlayers[playerIndex] = {
                                    ...player,
                                    hand: newHand,
                                    // Reset state for next round
                                    hasPlayedCard: false,
                                    hasRevealed: false
                                };

                                penaltyText = `${ player.username || 'Player' } must discard a card due to coalition backfire!`;
                            } else {
                                penaltyText = `${ player.username || 'Player' } has no cards to discard for backfire penalty.`;
                                // Still reset state even if no card to discard
                                updatedPlayers[playerIndex] = {
                                    ...player,
                                    hasPlayedCard: false,
                                    hasRevealed: false
                                };
                            }
                            break;

                        case 2: // Ignore momentum next round
                            updatedPlayers[playerIndex] = {
                                ...player,
                                ignoresMomentum: true,
                                // Reset other state flags
                                hasPlayedCard: false,
                                hasRevealed: false
                            };
                            penaltyText = `${ player.username || 'Player' } will ignore momentum benefits in the next round due to coalition backfire!`;
                            break;

                        case 3: // Cannot use special cards next round
                            updatedPlayers[playerIndex] = {
                                ...player,
                                canPlaySpecial: false,
                                // Reset other state flags
                                hasPlayedCard: false,
                                hasRevealed: false
                            };
                            penaltyText = `${ player.username || 'Player' } cannot play special cards in the next round due to coalition backfire!`;
                            break;

                        default:
                            // Should never happen due to bounds check above, but handle just in case
                            console.warn(`Invalid penalty roll value: ${ penaltyRoll }, defaulting to no special cards penalty`);
                            updatedPlayers[playerIndex] = {
                                ...player,
                                canPlaySpecial: false,
                                hasPlayedCard: false,
                                hasRevealed: false
                            };
                            penaltyText = `${ player.username || 'Player' } cannot play special cards in the next round due to coalition backfire!`;
                            break;
                    }

                    backfireLogEntries.push({
                        text: penaltyText,
                        timestamp: new Date().toISOString(),
                        type: 'system',
                        playerId,
                        round: gameState.round
                    });
                } catch (error) {
                    // Catch any unexpected errors during penalty application to ensure game continues
                    console.error(`Error applying penalty to player ${ playerId }:`, error);
                    backfireLogEntries.push({
                        text: `Failed to apply penalty to a player due to an error.`,
                        timestamp: new Date().toISOString(),
                        type: 'system',
                        round: gameState.round
                    });
                }
            });
        });

        // Return updated game state with safety check on required fields
        return {
            ...gameState,
            players: updatedPlayers,
            phase: 'setup',
            phaseStartTime: Date.now(),
            log: [...(Array.isArray(gameState.log) ? gameState.log : []), ...backfireLogEntries]
        };
    }

    /**
     * End the current round and prepare for the next
     */
    static endRound(gameState: GameState): GameState {
        // Validate current phase
        if (gameState.phase !== 'backfire' && gameState.phase !== 'end') {
            throw new Error('Not in backfire or end phase');
        }

        const roundEndLogEntry: GameLogEntry = {
            text: `Round ${ gameState.round } is complete.`,
            timestamp: new Date().toISOString(),
            type: 'system',
            round: gameState.round
        };

        // Reset player states for next round
        const updatedPlayers = gameState.players.map(player => ({
            ...player,
            hasPlayedCard: false,
            hasRevealed: false,
            wonLastRound: false,
            // Reset any penalty flags unless they were set to persist
            // (We keep the ignoresMomentum and canPlaySpecial flags from backfire phase)
        }));

        const newRound = gameState.round + 1;

        // Check if we've reached the maximum number of rounds
        if (newRound > gameState.maxRounds) {
            // Game is over, determine the winner
            return GameEngine.compareInfluence({
                ...gameState,
                log: [...gameState.log, roundEndLogEntry],
                players: updatedPlayers,
                round: newRound,
                gameOver: true,
                phase: 'gameover',
                phaseStartTime: Date.now()
            });
        }

        // Start the next round
        const newRoundLogEntry: GameLogEntry = {
            text: `Round ${ newRound } begins.`,
            timestamp: new Date().toISOString(),
            type: 'system',
            round: newRound
        };

        return GameEngine.rollForMomentum({
            ...gameState,
            log: [...gameState.log, roundEndLogEntry, newRoundLogEntry],
            players: updatedPlayers,
            round: newRound,
            phase: 'momentum',
            phaseStartTime: Date.now()
        });
    }

    /**
     * Handle character card play phase
     */
    static handleCharacterPhase(gameState: GameState, playerId: string, cardId: string): GameState {
        // Validate current phase
        if (gameState.phase !== 'character') {
            throw new Error('Not in character play phase');
        }

        // Find the player
        const playerIndex = gameState.players.findIndex(p => p.userId === playerId);
        if (playerIndex === -1) {
            throw new Error('Player not found');
        }

        const player = gameState.players[playerIndex];

        // Check if player is skipping this round
        if (player.isSkippingRound) {
            throw new Error('Player is skipping this round');
        }

        // Check if player has already played a character card
        if (player.playedCard) {
            throw new Error('Player has already played a character card this round');
        }

        // Find the card in player's hand
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            throw new Error('Card not found in player\'s hand');
        }

        const card = player.hand[cardIndex];

        // Verify it's a character card
        if (card.type !== 'politician') {
            throw new Error('Only character cards can be played in this phase. This is a ' + card.type + ' card.');
        }

        // Remove card from hand
        const updatedHand = [...player.hand];
        updatedHand.splice(cardIndex, 1);

        // Update player with the played character card (face down)
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = {
            ...player,
            hand: updatedHand,
            playedCard: card
        };

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ player.username } played a character card face down.`,
            timestamp: new Date().toISOString(),
            type: 'action',
            playerId,
            round: gameState.round
        };

        // Check if all participating players have played a character card
        const participatingPlayers = updatedPlayers.filter(p => !p.isSkippingRound);
        const allPlayed = participatingPlayers.every(p => p.playedCard !== null);

        // Update game state
        let nextState = {
            ...gameState,
            players: updatedPlayers,
            log: [...gameState.log, logEntry]
        };

        // Move to next phase if all participating players have played
        if (allPlayed) {
            nextState = {
                ...nextState,
                phase: 'special', // Move to special card phase
                phaseStartTime: Date.now(),
                log: [
                    ...nextState.log,
                    {
                        text: 'All participating players have played their character cards. Moving to special/bonus card phase.',
                        timestamp: new Date().toISOString(),
                        type: 'system',
                        round: gameState.round
                    }
                ]
            };
        }

        return nextState;
    }

    /**
     * Handle special/bonus card phase
     */
    static handleSpecialPhase(gameState: GameState, playerId: string, cardId: string, isOpen: boolean): GameState {
        // Validate current phase
        if (gameState.phase !== 'special') {
            throw new Error('Not in special/bonus card phase');
        }

        // Find the player
        const playerIndex = gameState.players.findIndex(p => p.userId === playerId);
        if (playerIndex === -1) {
            throw new Error('Player not found');
        }

        const player = gameState.players[playerIndex];

        // Check if player is skipping this round
        if (player.isSkippingRound) {
            throw new Error('Player is skipping this round');
        }

        // Check if player has already played a special card
        if (player.specialCard) {
            throw new Error('Player has already played a special card this round');
        }

        // Find the card in player's hand
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            throw new Error('Card not found in player\'s hand');
        }

        const card = player.hand[cardIndex];

        // Verify it's a special/bonus card
        if (card.type !== 'special' && card.type !== 'event') {
            throw new Error('Only special or bonus cards can be played in this phase');
        }

        // Remove card from hand
        const updatedHand = [...player.hand];
        updatedHand.splice(cardIndex, 1);

        // Update player with the played special card
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = {
            ...player,
            hand: updatedHand,
            specialCard: card,
            specialCardOpen: isOpen
        };

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ player.username } played a ${ card.type } card ${ isOpen ? 'face up' : 'face down' }.`,
            timestamp: new Date().toISOString(),
            type: 'action',
            playerId,
            round: gameState.round
        };

        // Apply immediate effect if card is played open
        let effectLogEntry = null;
        if (isOpen) {
            // In a real implementation, this would call the card effect processor
            effectLogEntry = {
                text: `${ player.username }'s card "${ card.name }" takes immediate effect: ${ card.effect }`,
                timestamp: new Date().toISOString(),
                type: 'system',
                playerId,
                cardId: card.id,
                round: gameState.round
            };
        }

        // Check if all participating players have made their choice for special cards
        const participatingPlayers = updatedPlayers.filter(p => !p.isSkippingRound);
        const allDecided = participatingPlayers.every(p =>
            p.specialCard !== null || p.skippedSpecialPhase === true
        );

        // Update game state
        let nextState = {
            ...gameState,
            players: updatedPlayers,
            log: [...gameState.log, logEntry]
        };

        // Add effect log if applicable
        if (effectLogEntry) {
            nextState.log.push(effectLogEntry);
        }

        // Move to resolution phase if all players have made their choice
        if (allDecided) {
            nextState = {
                ...nextState,
                phase: 'resolution', // Move to resolution phase
                phaseStartTime: Date.now(),
                log: [
                    ...nextState.log,
                    {
                        text: 'All participating players have finished the special card phase. Moving to resolution phase.',
                        timestamp: new Date().toISOString(),
                        type: 'system',
                        round: gameState.round
                    }
                ]
            };
        }

        return nextState;
    }

    /**
     * Skip playing a special/bonus card
     */
    static skipSpecialPhase(gameState: GameState, playerId: string): GameState {
        // Validate current phase
        if (gameState.phase !== 'special') {
            throw new Error('Not in special/bonus card phase');
        }

        // Find the player
        const playerIndex = gameState.players.findIndex(p => p.userId === playerId);
        if (playerIndex === -1) {
            throw new Error('Player not found');
        }

        const player = gameState.players[playerIndex];

        // Check if player is skipping this round
        if (player.isSkippingRound) {
            throw new Error('Player is skipping this round');
        }

        // Check if player has already made a choice for special phase
        if (player.specialCard || player.skippedSpecialPhase) {
            throw new Error('Player has already made a choice for the special phase');
        }

        // Update player to skip special phase
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = {
            ...player,
            skippedSpecialPhase: true
        };

        // Create log entry
        const logEntry: GameLogEntry = {
            text: `${ player.username } chose not to play a special/bonus card.`,
            timestamp: new Date().toISOString(),
            type: 'action',
            playerId,
            round: gameState.round
        };

        // Check if all participating players have made their choice for special cards
        const participatingPlayers = updatedPlayers.filter(p => !p.isSkippingRound);
        const allDecided = participatingPlayers.every(p =>
            p.specialCard !== null || p.skippedSpecialPhase === true
        );

        // Update game state
        let nextState = {
            ...gameState,
            players: updatedPlayers,
            log: [...gameState.log, logEntry]
        };

        // Move to resolution phase if all players have made their choice
        if (allDecided) {
            nextState = {
                ...nextState,
                phase: 'resolution', // Move to resolution phase
                phaseStartTime: Date.now(),
                log: [
                    ...nextState.log,
                    {
                        text: 'All participating players have finished the special card phase. Moving to resolution phase.',
                        timestamp: new Date().toISOString(),
                        type: 'system',
                        round: gameState.round
                    }
                ]
            };
        }

        return nextState;
    }

    /**
     * Resolve the current round
     */
    static resolveRound(gameState: GameState): GameState {
        // Validate current phase
        if (gameState.phase !== 'resolution') {
            throw new Error('Not in resolution phase');
        }

        // First, reveal all character cards
        const updatedPlayers = gameState.players.map(player => {
            // Skip players who are sitting out
            if (player.isSkippingRound) {
                return player;
            }

            // Create log entry for revealed character card
            if (player.playedCard) {
                gameState.log.push({
                    text: `${ player.username } reveals ${ player.playedCard.name } (${ player.playedCard.influence } influence).`,
                    timestamp: new Date().toISOString(),
                    type: 'system',
                    playerId: player.userId,
                    cardId: player.playedCard.id,
                    round: gameState.round
                });
            }

            return player;
        });

        // Now reveal and apply effects from face-down special/bonus cards
        updatedPlayers.forEach(player => {
            // Skip players who are sitting out or didn't play a special card face down
            if (player.isSkippingRound || !player.specialCard || player.specialCardOpen) {
                return;
            }

            // Reveal face-down special card
            gameState.log.push({
                text: `${ player.username } reveals face-down ${ player.specialCard.type } card: ${ player.specialCard.name }`,
                timestamp: new Date().toISOString(),
                type: 'system',
                playerId: player.userId,
                cardId: player.specialCard.id,
                round: gameState.round
            });

            // Apply the effect
            gameState.log.push({
                text: `${ player.specialCard.name } effect: ${ player.specialCard.effect }`,
                timestamp: new Date().toISOString(),
                type: 'system',
                playerId: player.userId,
                cardId: player.specialCard.id,
                round: gameState.round
            });
        });

        // Compare influence and award mandates
        const finalState = GameEngine.compareInfluence({
            ...gameState,
            players: updatedPlayers
        });

        return finalState;
    }

    /**
     * Process backfire phase - handle pressure rolls for players with large mandate leads who lost
     */
    static handleBackfirePhase(gameState: GameState): GameState {
        // Validate current phase
        if (gameState.phase !== 'backfire') {
            throw new Error('Not in backfire phase');
        }

        let updatedGameState = { ...gameState };
        const logEntries: GameLogEntry[] = [];

        // Find players who lost the round with a 3+ mandate lead
        const participatingPlayers = gameState.players.filter(p => !p.isSkippingRound);
        const winnerIds = participatingPlayers.filter(p => p.wonLastRound).map(p => p.userId);

        // Check for players with large mandate lead who lost
        const playersForPressureRoll = participatingPlayers.filter(player => {
            // Skip winners
            if (winnerIds.includes(player.userId)) {
                return false;
            }

            // Check if this player has 3+ more mandates than any winner
            const playerMandates = player.mandates || 0;

            for (const winnerId of winnerIds) {
                const winner = gameState.players.find(p => p.userId === winnerId);
                if (winner && playerMandates >= (winner.mandates || 0) + 3) {
                    return true; // This player needs a pressure roll
                }
            }

            return false;
        });

        // Process pressure rolls
        for (const player of playersForPressureRoll) {
            logEntries.push({
                text: `${ player.username } lost despite having a 3+ mandate lead and must make a pressure roll.`,
                timestamp: new Date().toISOString(),
                type: 'system',
                playerId: player.userId,
                round: gameState.round
            });

            // Roll the die (1-6)
            const pressureRoll = Math.floor(Math.random() * 6) + 1;

            logEntries.push({
                text: `${ player.username } rolls a ${ pressureRoll } for the pressure test.`,
                timestamp: new Date().toISOString(),
                type: 'action',
                playerId: player.userId,
                round: gameState.round
            });

            // Apply pressure roll effect
            if (pressureRoll === 1) {
                // Player loses 1 mandate
                updatedGameState = {
                    ...updatedGameState,
                    players: updatedGameState.players.map(p => {
                        if (p.userId === player.userId) {
                            return {
                                ...p,
                                mandates: Math.max(0, (p.mandates || 0) - 1)
                            };
                        }
                        return p;
                    })
                };

                logEntries.push({
                    text: `Bad luck! ${ player.username } rolled a 1 and loses 1 mandate.`,
                    timestamp: new Date().toISOString(),
                    type: 'system',
                    playerId: player.userId,
                    round: gameState.round
                });
            }
            else if (pressureRoll === 6) {
                // One random winner loses 1 mandate
                const randomWinnerIndex = Math.floor(Math.random() * winnerIds.length);
                const randomWinnerId = winnerIds[randomWinnerIndex];
                const randomWinner = gameState.players.find(p => p.userId === randomWinnerId);

                if (randomWinner) {
                    updatedGameState = {
                        ...updatedGameState,
                        players: updatedGameState.players.map(p => {
                            if (p.userId === randomWinnerId) {
                                return {
                                    ...p,
                                    mandates: Math.max(0, (p.mandates || 0) - 1)
                                };
                            }
                            return p;
                        })
                    };

                    logEntries.push({
                        text: `Critical success! ${ player.username } rolled a 6, causing ${ randomWinner.username } to lose 1 mandate.`,
                        timestamp: new Date().toISOString(),
                        type: 'system',
                        playerId: player.userId,
                        round: gameState.round
                    });
                }
            }
            else {
                logEntries.push({
                    text: `${ player.username } rolled a ${ pressureRoll }. No mandate changes.`,
                    timestamp: new Date().toISOString(),
                    type: 'system',
                    playerId: player.userId,
                    round: gameState.round
                });
            }
        }

        // If no pressure rolls were needed
        if (playersForPressureRoll.length === 0) {
            logEntries.push({
                text: `No pressure rolls needed this round.`,
                timestamp: new Date().toISOString(),
                type: 'system',
                round: gameState.round
            });
        }

        // Reset round-specific player states and advance to next round
        const updatedPlayers = updatedGameState.players.map(player => ({
            ...player,
            isSkippingRound: false,
            playedCard: null,
            specialCard: null,
            specialCardOpen: false,
            skippedSpecialPhase: false,
            wonLastRound: false,
            influenceModifier: 0 // Reset influence modifiers for next round
        }));

        const nextRound = gameState.round + 1;

        // Check if max rounds reached
        const isLastRound = nextRound > gameState.maxRounds;

        // Final log entry
        logEntries.push({
            text: isLastRound
                ? `Maximum rounds (${ gameState.maxRounds }) reached. Game will end after determining the final winner.`
                : `Round ${ gameState.round } complete. Starting round ${ nextRound }.`,
            timestamp: new Date().toISOString(),
            type: 'system',
            round: gameState.round
        });

        // Update game state
        return {
            ...updatedGameState,
            players: updatedPlayers,
            round: nextRound,
            phase: isLastRound ? 'final' : 'momentum',
            log: [...updatedGameState.log, ...logEntries],
            phaseStartTime: Date.now()
        };
    }
}

/**
 * Helper function to get player name
 */
function getPlayerName(gameState: GameState, playerId: string): string {
    const player = gameState.players.find(p => p.userId === playerId);
    return player ? player.username : 'Unknown Player';
}

/**
 * Helper function to get relative change text
 */
function getRelativeChange(oldValue: number, newValue: number): string {
    if (oldValue === newValue) return 'stays at';
    return newValue > oldValue ? 'increases' : 'decreases';
}

/**
 * Helper function to get next player index
 */
function getNextPlayerIndex(gameState: GameState): number {
    if (!gameState.activePlayerId) return 0;

    const currentIndex = gameState.players.findIndex(p => p.userId === gameState.activePlayerId);
    return (currentIndex + 1) % gameState.players.length;
}

/**
 * Processes a specific game phase, handling phase-specific logic and transitions
 * @param gameState Current game state
 * @param phase The phase to process (if different from current game state phase)
 * @returns Updated game state after processing the phase
 */
export function processPhase(gameState: GameState, phase?: GamePhase): GameState {
    // Use provided phase or current game state phase
    const currentPhase = phase || gameState.phase;

    // Clone the game state to avoid mutations
    let updatedState = { ...gameState };

    // Add a log entry for phase processing
    updatedState = addLogEntry(
        updatedState,
        `Processing ${ currentPhase } phase`,
        'system'
    );

    // Process the phase based on type
    switch (currentPhase) {
        case 'setup':
            return processSetupPhase(updatedState);

        case 'play':
            return processPlayPhase(updatedState);

        case 'effect':
            return processEffectPhase(updatedState);

        case 'resolution':
            return processResolutionPhase(updatedState);

        case 'backfire':
            return processBackfirePhase(updatedState);

        case 'final':
            return processFinalPhase(updatedState);

        case 'finished':
            return processFinishedPhase(updatedState);

        default:
            // Add an error log entry if the phase is invalid
            return addLogEntry(
                updatedState,
                `Invalid phase: ${ currentPhase }`,
                'error'
            );
    }
}

/**
 * Processes the setup phase of the game
 * @param gameState Current game state
 * @returns Updated game state after processing setup phase
 */
function processSetupPhase(gameState: GameState): GameState {
    let updatedState = { ...gameState };

    // If game hasn't started yet, initialize it
    if (updatedState.status !== 'active') {
        updatedState.status = 'active';
        updatedState = addLogEntry(updatedState, 'Game activated', 'system');
    }

    // Initialize or reset player states for the new round
    updatedState.players = updatedState.players.map(player => ({
        ...player,
        handIds: player.handIds || [],
        playedCardIds: player.playedCardIds || [],
        score: player.score || 0,
        mandates: player.mandates || 0,
        momentum: player.momentum || 0,
        funds: player.funds || 0,
        penalties: player.penalties || []
    }));

    // Deal initial cards if this is the first round
    if (updatedState.round === 1) {
        // Set initial cards for each player
        for (const player of updatedState.players) {
            // Skip if player already has cards
            if (player.handIds && player.handIds.length > 0) continue;

            // Draw initial hand for player
            const handSize = updatedState.settings?.initialCards || 5;
            const result = drawCardsFromDeck(updatedState.deck, handSize);

            // Update player's hand and the deck
            player.handIds = result.drawnCardIds;
            updatedState.deck = result.updatedDeck;

            updatedState = addLogEntry(
                updatedState,
                `Dealt ${ handSize } cards to ${ player.name }`,
                'system'
            );
        }
    }

    // Advance to the next phase
    updatedState.phase = 'play';
    updatedState = addLogEntry(updatedState, 'Advancing to play phase', 'system');

    return updatedState;
}

/**
 * Processes the play phase of the game
 * @param gameState Current game state
 * @returns Updated game state after processing play phase
 */
function processPlayPhase(gameState: GameState): GameState {
    let updatedState = { ...gameState };

    // During the play phase, players take turns playing cards
    // Check if active player is set
    if (!updatedState.activePlayerId && updatedState.players.length > 0) {
        // Set the first player as active player if not defined
        updatedState.activePlayerId = updatedState.players[0].id;
        updatedState = addLogEntry(
            updatedState,
            `${ updatedState.players[0].name } is the first active player`,
            'system'
        );
    }

    // Find the active player
    const activePlayer = updatedState.players.find(p => p.id === updatedState.activePlayerId);

    if (!activePlayer) {
        updatedState = addLogEntry(
            updatedState,
            `Error: No active player found with ID ${ updatedState.activePlayerId }`,
            'error'
        );
        return updatedState;
    }

    // Handle AI player turns
    if (activePlayer && activePlayer.isAI) {
        updatedState = addLogEntry(
            updatedState,
            `AI Player ${ activePlayer.name }'s turn`,
            'system'
        );

        // Check if AI player's hand is empty
        if (!activePlayer.handIds || activePlayer.handIds.length === 0) {
            // Draw a card for the AI player
            const drawResult = drawCardsFromDeck(updatedState.deck, 1);

            // Update the player's hand and the deck
            activePlayer.handIds = [...(activePlayer.handIds || []), ...drawResult.drawnCardIds];
            updatedState.deck = drawResult.updatedDeck;

            updatedState = addLogEntry(
                updatedState,
                `AI Player ${ activePlayer.name } drew a card`,
                'system'
            );
        }

        // AI decision logic - simplified version
        let cardToPlay: string | null = null;

        // Select a card based on basic strategy
        if (activePlayer.handIds && activePlayer.handIds.length > 0) {
            // For now, just pick the first card
            // In a real implementation, this would use the AIPlayer's logic
            cardToPlay = activePlayer.handIds[0];

            // Get the card details for better logging
            const card = getCardById(updatedState.deck, cardToPlay);

            if (card) {
                updatedState = addLogEntry(
                    updatedState,
                    `AI Player ${ activePlayer.name } selected ${ card.name || 'a card' } to play`,
                    'system'
                );
            }
        }

        if (cardToPlay) {
            // Remove card from hand
            activePlayer.handIds = activePlayer.handIds.filter(id => id !== cardToPlay);

            // Add to played cards
            activePlayer.playedCardIds = [...(activePlayer.playedCardIds || []), cardToPlay];

            // Mark player as having played a card this round
            activePlayer.hasPlayedCard = true;

            // Get card details for log if available
            const card = getCardById(updatedState.deck, cardToPlay);
            const cardName = card ? card.name : 'a card';

            updatedState = addLogEntry(
                updatedState,
                `AI Player ${ activePlayer.name } played ${ cardName }`,
                'game'
            );

            // Automatically advance to effect phase after AI plays a card
            updatedState.phase = 'effect';
            updatedState = addLogEntry(
                updatedState,
                'Advancing to effect phase',
                'system'
            );
        } else {
            // AI player has no cards to play or chose not to play
            // Add a log entry indicating this unusual scenario
            updatedState = addLogEntry(
                updatedState,
                `AI Player ${ activePlayer.name } has no valid cards to play`,
                'system'
            );

            // Advance to the next player's turn
            const currentPlayerIndex = updatedState.players.findIndex(p => p.id === updatedState.activePlayerId);
            const nextPlayerIndex = (currentPlayerIndex + 1) % updatedState.players.length;
            updatedState.activePlayerId = updatedState.players[nextPlayerIndex].id;

            updatedState = addLogEntry(
                updatedState,
                `Next player is ${ updatedState.players[nextPlayerIndex].name }`,
                'system'
            );
        }
    }

    // For human players, card play is handled through user interactions
    // Only advance the phase when manually triggered
    return updatedState;
}

/**
 * Processes the effect phase of the game
 * @param gameState Current game state
 * @returns Updated game state after processing effect phase
 */
function processEffectPhase(gameState: GameState): GameState {
    let updatedState = { ...gameState };

    // Apply effects of all cards played in this round
    const activePlayer = updatedState.players.find(p => p.id === updatedState.activePlayerId);

    if (activePlayer) {
        // Process played cards and their effects
        if (activePlayer.playedCardIds && activePlayer.playedCardIds.length > 0) {
            updatedState = addLogEntry(
                updatedState,
                `Applying effects of ${ activePlayer.playedCardIds.length } cards played by ${ activePlayer.name }`,
                'system'
            );

            // Process card effects here
            // For each played card, apply its effect
            for (const cardId of activePlayer.playedCardIds) {
                const card = getCardById(updatedState.deck, cardId);

                if (card) {
                    // Apply card effect based on card type
                    updatedState = addLogEntry(
                        updatedState,
                        `Applying effect of card: ${ card.title }`,
                        'system'
                    );

                    // Update active player's stats based on card effects
                    activePlayer.mandates += card.mandates || 0;
                    activePlayer.momentum += card.momentum || 0;
                    activePlayer.funds += card.campaign || 0;

                    if (card.mandates) {
                        updatedState = addLogEntry(
                            updatedState,
                            `${ activePlayer.name } gains ${ card.mandates } mandate(s)`,
                            'game'
                        );
                    }

                    if (card.momentum) {
                        updatedState = addLogEntry(
                            updatedState,
                            `${ activePlayer.name } gains ${ card.momentum } momentum`,
                            'game'
                        );
                    }

                    if (card.campaign) {
                        updatedState = addLogEntry(
                            updatedState,
                            `${ activePlayer.name } gains €${ card.campaign.toLocaleString() } in campaign funds`,
                            'game'
                        );
                    }
                }
            }
        } else {
            updatedState = addLogEntry(
                updatedState,
                `${ activePlayer.name } has no played cards to process`,
                'system'
            );
        }
    }

    // Advance to resolution phase
    updatedState.phase = 'resolution';
    updatedState = addLogEntry(updatedState, 'Advancing to resolution phase', 'system');

    return updatedState;
}

/**
 * Processes the resolution phase of the game
 * @param gameState Current game state
 * @returns Updated game state after processing resolution phase
 */
function processResolutionPhase(gameState: GameState): GameState {
    let updatedState = { ...gameState };

    // Process any coalition checks or special card effects that happen after all cards are played
    // Note: We'll handle coalition backfire in a separate phase ('backfire')

    // Check for round end conditions
    const allPlayersPlayed = updatedState.players.every(player =>
        player.playedCardIds && player.playedCardIds.length > 0
    );

    if (allPlayersPlayed) {
        updatedState = addLogEntry(
            updatedState,
            'All players have played their cards for this round',
            'system'
        );
    }

    // Draw a card for the active player if they are entitled to one
    const activePlayer = updatedState.players.find(p => p.id === updatedState.activePlayerId);

    if (activePlayer) {
        // Check if player should draw a card
        const shouldDrawCard = activePlayer.playedCardIds && activePlayer.playedCardIds.length > 0;

        if (shouldDrawCard) {
            // Draw a card for the player
            const result = drawCardsFromDeck(updatedState.deck, 1);
            activePlayer.handIds = [...(activePlayer.handIds || []), ...result.drawnCardIds];
            updatedState.deck = result.updatedDeck;

            updatedState = addLogEntry(
                updatedState,
                `${ activePlayer.name } draws a card`,
                'game'
            );
        }

        // Clear played cards for the current player
        activePlayer.playedCardIds = [];
    }

    // Determine if the round is complete (when all players have taken their turns)
    const isRoundComplete = updatedState.players.every(player => {
        // Consider a player's turn complete if they have taken their turn this round
        return !player.playedCardIds || player.playedCardIds.length === 0;
    });

    if (isRoundComplete) {
        updatedState = addLogEntry(
            updatedState,
            `Round ${ updatedState.round } completed`,
            'system'
        );

        // Check if this was the final round
        if (updatedState.round >= updatedState.maxRounds) {
            // Move to the final phase if this was the last round
            updatedState.phase = 'final';
            updatedState = addLogEntry(
                updatedState,
                'Final round completed, advancing to final phase',
                'system'
            );
            return updatedState;
        }

        // Move to backfire phase to handle coalition effects before starting new round
        updatedState.phase = 'backfire';
        updatedState = addLogEntry(
            updatedState,
            'Advancing to backfire phase to handle coalition effects',
            'system'
        );
        return updatedState;
    } else {
        // If the round is not complete, move to the next player's turn
        const currentPlayerIndex = updatedState.players.findIndex(p => p.id === updatedState.activePlayerId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % updatedState.players.length;
        updatedState.activePlayerId = updatedState.players[nextPlayerIndex].id;

        updatedState = addLogEntry(
            updatedState,
            `Next player is ${ updatedState.players[nextPlayerIndex].name }`,
            'system'
        );

        // Return to play phase for the next player
        updatedState.phase = 'play';
        updatedState = addLogEntry(
            updatedState,
            'Returning to play phase for the next player',
            'system'
        );
        return updatedState;
    }
}

/**
 * Processes the backfire phase of the game
 * @param gameState Current game state
 * @returns Updated game state after processing backfire phase
 */
function processBackfirePhase(gameState: GameState): GameState {
    let updatedState = { ...gameState };

    try {
        // Apply coalition backfire effects
        updatedState = GameEngine.checkCoalitionBackfire(updatedState);
    } catch (error) {
        console.error('Error applying coalition backfire:', error);
        updatedState = addLogEntry(
            updatedState,
            `Error processing backfire phase: ${ error instanceof Error ? error.message : 'Unknown error' }`,
            'error'
        );
    }

    // After backfire phase, increment round counter and prepare for next round
    updatedState.round += 1;
    updatedState = addLogEntry(
        updatedState,
        `Advancing to round ${ updatedState.round }`,
        'system'
    );

    // Reset active player to the first player for the new round
    if (updatedState.players.length > 0) {
        updatedState.activePlayerId = updatedState.players[0].id;
        updatedState = addLogEntry(
            updatedState,
            `${ updatedState.players[0].name } will be the first player in the new round`,
            'system'
        );
    }

    // Return to setup phase for the next round
    updatedState.phase = 'setup';
    updatedState = addLogEntry(
        updatedState,
        'Returning to setup phase for the next round',
        'system'
    );

    return updatedState;
}

/**
 * Processes the final phase of the game
 * @param gameState Current game state
 * @returns Updated game state after processing final phase
 */
function processFinalPhase(gameState: GameState): GameState {
    let updatedState = { ...gameState };

    // Calculate final scores and determine the winner
    updatedState.players.forEach(player => {
        // Final score is primarily based on mandates
        player.score = player.mandates;

        updatedState = addLogEntry(
            updatedState,
            `${ player.name } finished with ${ player.mandates } mandates and a score of ${ player.score }`,
            'game'
        );
    });

    // Determine winner(s) - the player(s) with the highest mandate count
    const highestMandates = Math.max(...updatedState.players.map(p => p.mandates));
    const winners = updatedState.players.filter(p => p.mandates === highestMandates);

    updatedState.winners = winners.map(p => p.id);

    if (winners.length === 1) {
        updatedState = addLogEntry(
            updatedState,
            `Game over! ${ winners[0].name } wins with ${ winners[0].mandates } mandates!`,
            'system'
        );
    } else {
        const winnerNames = winners.map(p => p.name).join(', ');
        updatedState = addLogEntry(
            updatedState,
            `Game over! It's a tie between ${ winnerNames } with ${ highestMandates } mandates each!`,
            'system'
        );
    }

    // Advanced to finished state
    updatedState.phase = 'finished';
    updatedState.status = 'completed';

    updatedState = addLogEntry(
        updatedState,
        'Game has been completed',
        'system'
    );

    return updatedState;
}

/**
 * Processes the finished phase of the game (terminal state)
 * @param gameState Current game state
 * @returns Updated game state (typically unchanged)
 */
function processFinishedPhase(gameState: GameState): GameState {
    // No further processing needed in the finished state
    return gameState;
}

/**
 * Helper function: Draw cards from a deck
 * @param deck The current deck
 * @param count Number of cards to draw
 * @returns Object containing drawn card IDs and updated deck
 */
export function drawCardsFromDeck(deck: Deck, count: number): { drawnCardIds: string[], updatedDeck: Deck } {
    // Clone the deck
    const updatedDeck = { ...deck };

    // Check if we need to reshuffle
    if (updatedDeck.drawPile.length < count && updatedDeck.discardPile.length > 0) {
        // Reshuffle discard pile into draw pile
        updatedDeck.drawPile = [...updatedDeck.drawPile, ...updatedDeck.discardPile];
        updatedDeck.discardPile = [];

        // Shuffle the draw pile
        updatedDeck.drawPile = shuffleArray(updatedDeck.drawPile);
    }

    // Draw up to the available number of cards
    const actualCount = Math.min(count, updatedDeck.drawPile.length);
    const drawnCardIds = updatedDeck.drawPile.slice(0, actualCount);

    // Update the draw pile
    updatedDeck.drawPile = updatedDeck.drawPile.slice(actualCount);

    return { drawnCardIds, updatedDeck };
}

/**
 * Helper function: Get a card by its ID from the deck
 * @param deck The deck to search in
 * @param cardId The ID of the card to find
 * @returns The card object or undefined if not found
 */
export function getCardById(deck: Deck, cardId: string): Card | undefined {
    // First check all cards in the deck
    return deck.cards.find(card => card.id === cardId);
}

/**
 * Helper function: Shuffle an array using Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Helper function: Add a log entry to the game state
 * @param state The current game state
 * @param message The log message
 * @param type The log type ('info', 'action', 'system', 'error', 'game')
 * @returns Updated game state with the new log entry
 */
export function addLogEntry(state: GameState, message: string, type: 'info' | 'action' | 'system' | 'error' | 'game' = 'info'): GameState {
    return {
        ...state,
        log: [
            ...state.log,
            {
                timestamp: Date.now(),
                message,
                type
            }
        ]
    };
}

export default GameEngine;