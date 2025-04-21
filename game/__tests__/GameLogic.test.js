import Game from '../Game';
import Player from '../Player';
import Card from '../Card';

describe('Game Logic Tests', () => {
    let game;

    beforeEach(() => {
        game = new Game();
    });

    test('Initial game state', () => {
        expect(game.currentPhase).toBe(1);
        expect(game.currentPlayer).toBe(game.blackPlayer);
        expect(game.tieCards).toHaveLength(0);
        expect(game.blackPlayer.deck.cards).toHaveLength(20);
        expect(game.whitePlayer.deck.cards).toHaveLength(20);
    });

    test('Phase 1: Card drawing sequence', () => {
        // Schwarzer Spieler zieht
        game.handleCardClick(game.blackPlayer);
        expect(game.currentPlayer).toBe(game.whitePlayer);
        expect(game.blackPlayer.deck.cards).toHaveLength(19);
        expect(game.blackPlayer.currentCard).toBeTruthy();
        expect(game.currentPhase).toBe(1);

        // Weißer Spieler zieht
        game.handleCardClick(game.whitePlayer);
        expect(game.currentPlayer).toBe(game.blackPlayer);
        expect(game.whitePlayer.deck.cards).toHaveLength(19);
        expect(game.whitePlayer.currentCard).toBeTruthy();
        expect(game.currentPhase).toBe(2);
    });

    test('Phase 2: Card reveal sequence', () => {
        // Setup: Beide Spieler ziehen Karten
        game.handleCardClick(game.blackPlayer);
        game.handleCardClick(game.whitePlayer);

        // Phase 2 beginnt
        expect(game.currentPhase).toBe(2);

        // Schwarzer Spieler deckt auf
        game.handleCardClick(game.blackPlayer);
        expect(game.blackPlayer.currentCard.isRevealed).toBe(true);
        expect(game.currentPlayer).toBe(game.whitePlayer);

        // Weißer Spieler deckt auf
        game.handleCardClick(game.whitePlayer);
        expect(game.whitePlayer.currentCard.isRevealed).toBe(true);
    });

    test('Tie handling', () => {
        // Mock Math.random to force a tie
        const mockMath = Object.create(global.Math);
        mockMath.random = () => 0.9;
        global.Math = mockMath;

        // Simulate complete round
        game.handleCardClick(game.blackPlayer);
        game.handleCardClick(game.whitePlayer);
        game.handleCardClick(game.blackPlayer);
        game.handleCardClick(game.whitePlayer);

        expect(game.tieCards).toHaveLength(2);
        expect(game.currentPhase).toBe(1);
    });

    test('Winner handling', () => {
        // Mock Math.random to force black player win
        const mockMath = Object.create(global.Math);
        mockMath.random = () => 0.3;
        global.Math = mockMath;

        // Simulate complete round
        game.handleCardClick(game.blackPlayer);
        game.handleCardClick(game.whitePlayer);
        game.handleCardClick(game.blackPlayer);
        game.handleCardClick(game.whitePlayer);

        expect(game.tieCards).toHaveLength(0);
        expect(game.currentPlayer).toBe(game.blackPlayer);
        expect(game.blackPlayer.deck.cards).toHaveLength(22);
    });
});