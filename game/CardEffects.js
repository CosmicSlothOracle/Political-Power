/**
 * CardEffects.js
 * A module that defines and manages card effects for the Political Power card game.
 * Each effect function takes the current game state and returns a modified game state.
 */

// Helper functions
const calculateInfluenceBoost = (card, gameState) => {
    let boost = 0;

    // Apply tag-based boosts
    if (card.tags && Array.isArray(card.tags)) {
        if (card.tags.includes('populist')) boost += 1;
        if (card.tags.includes('diplomat') && gameState.coalitions.length > 0) boost += 2;
        if (card.tags.includes('strategist')) boost += Math.min(2, gameState.round);
    }

    // Apply momentum-based boosts
    if (gameState.momentumLevel > 3 && card.type === 'ally') boost += 1;

    return boost;
};

// Base effect function for all cards
const applyCardEffect = (card, gameState, playerId) => {
    // Generic functionality for all cards
    console.log(`Applying effect for card: ${ card.name }`);

    // Find the player
    const playerIndex = gameState.players.findIndex(p => p.userId === playerId);
    if (playerIndex === -1) return gameState;

    // Clone game state to avoid direct mutation
    const newState = {
        ...gameState,
        players: [...gameState.players],
        log: [...gameState.log]
    };

    // Calculate any influence boosts
    const influenceBoost = calculateInfluenceBoost(card, gameState);

    // Log the play
    newState.log.push({
        text: `${ newState.players[playerIndex].username } played ${ card.name } (${ card.influence }${ influenceBoost > 0 ? '+' + influenceBoost : '' } influence).`,
        timestamp: new Date().toISOString(),
        type: 'action'
    });

    // Call the specific effect based on card type
    switch (card.type) {
        case 'ally':
            return allyEffect(card, newState, playerId, influenceBoost);
        case 'action':
            return actionEffect(card, newState, playerId, influenceBoost);
        case 'plot':
            return plotEffect(card, newState, playerId, influenceBoost);
        default:
            return newState;
    }
};

// Type-specific effect functions
const allyEffect = (card, gameState, playerId, influenceBoost = 0) => {
    // Allies generally add influence and may have special abilities
    const effect = card.effect || '';
    const newState = { ...gameState };

    // Apply basic influence effect
    const totalInfluence = card.influence + influenceBoost;

    // Apply any special effects based on the card's effect string
    if (effect.includes('coalition_boost')) {
        // Check if player is in a coalition
        const playerCoalition = newState.coalitions.find(
            c => (c.player1Id === playerId || c.player2Id === playerId) && c.active
        );

        if (playerCoalition) {
            // Apply coalition boost
            const boostAmount = 2;
            newState.log.push({
                text: `${ card.name }'s coalition boost added ${ boostAmount } extra influence!`,
                timestamp: new Date().toISOString(),
                type: 'info'
            });
        }
    }

    return newState;
};

const actionEffect = (card, gameState, playerId, influenceBoost = 0) => {
    // Actions can have immediate effects on game state
    const effect = card.effect || '';
    const newState = { ...gameState };

    // Apply situational effects
    if (effect.includes('momentum_shift')) {
        // Adjust momentum in the game
        const newMomentum = Math.min(5, newState.momentumLevel + 1);
        newState.momentumLevel = newMomentum;

        newState.log.push({
            text: `${ card.name } shifted momentum to level ${ newMomentum }!`,
            timestamp: new Date().toISOString(),
            type: 'info'
        });
    }

    if (effect.includes('block_coalition')) {
        // Prevent new coalitions from forming for one round
        newState.blockCoalitions = true;

        newState.log.push({
            text: `${ card.name } blocks any new coalitions from forming this round!`,
            timestamp: new Date().toISOString(),
            type: 'info'
        });
    }

    return newState;
};

const plotEffect = (card, gameState, playerId, influenceBoost = 0) => {
    // Plot cards have unique, powerful effects
    const effect = card.effect || '';
    const newState = { ...gameState };

    if (effect.includes('mandate_bonus')) {
        // Find the player
        const playerIndex = newState.players.findIndex(p => p.userId === playerId);

        if (playerIndex !== -1) {
            // Add a bonus mandate
            const mandateBonus = 1;
            newState.players[playerIndex] = {
                ...newState.players[playerIndex],
                mandates: newState.players[playerIndex].mandates + mandateBonus
            };

            newState.log.push({
                text: `${ card.name } grants ${ newState.players[playerIndex].username } a bonus mandate!`,
                timestamp: new Date().toISOString(),
                type: 'info'
            });
        }
    }

    if (effect.includes('break_coalition')) {
        // Break a random coalition
        if (newState.coalitions.length > 0) {
            // Find active coalitions
            const activeCoalitions = newState.coalitions.filter(c => c.active);

            if (activeCoalitions.length > 0) {
                // Break a random coalition
                const randomIndex = Math.floor(Math.random() * activeCoalitions.length);
                const targetCoalition = activeCoalitions[randomIndex];

                // Update the coalition status
                const coalitionIndex = newState.coalitions.findIndex(
                    c => c.player1Id === targetCoalition.player1Id && c.player2Id === targetCoalition.player2Id
                );

                if (coalitionIndex !== -1) {
                    newState.coalitions[coalitionIndex] = {
                        ...newState.coalitions[coalitionIndex],
                        active: false
                    };

                    // Get player names
                    const player1 = newState.players.find(p => p.userId === targetCoalition.player1Id);
                    const player2 = newState.players.find(p => p.userId === targetCoalition.player2Id);

                    newState.log.push({
                        text: `${ card.name } breaks the coalition between ${ player1?.username || 'Player 1' } and ${ player2?.username || 'Player 2' }!`,
                        timestamp: new Date().toISOString(),
                        type: 'info'
                    });
                }
            }
        }
    }

    return newState;
};

module.exports = {
    applyCardEffect,
    calculateInfluenceBoost
};