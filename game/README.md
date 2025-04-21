# Political Power Game Mechanics

This directory contains the core game mechanics for the Political Power card game.

## Card Effects System

### Overview

The Card Effects system provides dynamic gameplay by allowing cards to influence the game state in various ways. Each card can have special abilities that activate when played, providing strategic depth to the game.

### Key Components

- **CardEffects.ts**: Core logic for applying card effects to the game state
- **mockCards.ts**: Mock card data for testing the game mechanics

### Card Effect Types

Cards can have effects based on their type:

#### Politician Cards
- Coalition boosts
- Momentum-based bonuses
- Round scaling (becoming stronger as the game progresses)

#### Event Cards
- Momentum shifts
- Coalition blocking
- Temporary buffs/debuffs

#### Special Cards
- Mandate manipulation
- Breaking coalitions
- Hand revelation
- Special phase effects

### How Effects Work

1. When a card is played, the `applyCardEffect` function is called
2. The effect is processed based on card type and effect code
3. Game state is updated and returned
4. UI components reflect these changes

### Influence Calculation

A card's effective influence is calculated by:
- Base influence value
- Tag-based boosts (e.g., populist, diplomat)
- Momentum-based adjustments
- Coalition bonuses
- Effect-specific modifiers

## Game State

The game state is managed through the `GameState` interface, which tracks:

- Round and phase information
- Player states and hands
- Coalitions
- Momentum level
- Temporary effects
- Game log

## Game Flow

1. **Drawing Phase**: Players draw cards to their hand
2. **Playing Phase**: Players choose a card to play
3. **Revealing Phase**: Cards are revealed and effects are applied
4. **Resolving Phase**: Compare influence and determine round winner
5. **Interim Phase**: Update mandates and prepare for next round

## Coalition Mechanics

Coalitions provide strategic alliances between players:

- Players can propose and accept coalitions
- Coalition members receive bonuses when playing certain cards
- Events can block coalition formation or break existing coalitions
- A coalition formed in one round may affect subsequent rounds

## Momentum System

Momentum represents the political climate and can shift during play:

- Scale from 1-5 (low to high)
- Affects influence of certain cards
- Can be manipulated by event cards
- Resets under certain conditions

## Implementation Example

```typescript
// Playing a card and applying its effect
const handlePlayCard = (cardId: string) => {
  // Find the card in player's hand
  const card = findCardById(cardId);

  // Apply the card effect to game state
  const updatedGameState = CardEffects.applyCardEffect(card, gameState, currentPlayer.userId);

  // Update UI with new game state
  setGameState(updatedGameState);
}
```

## Adding New Card Effects

To add a new card effect:

1. Add a new case in the appropriate effect function in `CardEffects.ts`
2. Update the `gameTypes.ts` interface if needed
3. Create a new card in `mockCards.ts` that uses the effect
4. Ensure UI components can properly display the effect

## Testing Cards

Use the `mockCards.getRandomCards()` function to get a set of random cards for testing different card interactions and effects.

## Future Enhancements

- Advanced coalition mechanics (e.g., secret agendas)
- Dynamic game phases based on card effects
- Card evolution throughout game
- Custom deck building with effect synergies