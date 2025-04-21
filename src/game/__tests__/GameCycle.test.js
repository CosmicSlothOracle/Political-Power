import Game from '../Game';

describe('Spielzyklus Tests', () => {
    let game;

    beforeEach(() => {
        game = new Game();
    });

    test('Phase 1: Korrekte Zugreihenfolge beim Kartenziehen', () => {
        // Schwarz ist zuerst dran
        expect(game.currentPlayer).toBe(game.blackPlayer);
        expect(game.currentPhase).toBe(1);

        // Schwarz zieht
        game.handleCardClick(game.blackPlayer);
        expect(game.currentPlayer).toBe(game.whitePlayer);
        expect(game.currentPhase).toBe(1);

        // Weiß zieht
        game.handleCardClick(game.whitePlayer);
        expect(game.currentPlayer).toBe(game.blackPlayer);
        expect(game.currentPhase).toBe(2);
    });

    test('Phase 2: Korrekte Zugreihenfolge beim Aufdecken', () => {
        // Setup: Phase 1 abschließen
        game.handleCardClick(game.blackPlayer);
        game.handleCardClick(game.whitePlayer);

        // Schwarz deckt auf
        game.handleCardClick(game.blackPlayer);
        expect(game.blackPlayer.currentCard.isRevealed).toBe(true);
        expect(game.currentPlayer).toBe(game.whitePlayer);

        // Weiß deckt auf
        game.handleCardClick(game.whitePlayer);
        expect(game.whitePlayer.currentCard.isRevealed).toBe(true);
    });

    test('Unentschieden-Handling', () => {
        // Setup: Gleiche Kartenwerte erzwingen
        game.blackPlayer.currentCard = { value: 5, isRevealed: true };
        game.whitePlayer.currentCard = { value: 5, isRevealed: true };

        game.determineWinner();

        expect(game.tieCards.length).toBe(2);
        expect(game.currentPhase).toBe(1);
        // Aktueller Spieler bleibt am Zug
        expect(game.currentPlayer).toBe(game.blackPlayer);
    });

    test('Gewinner erhält beide Karten', () => {
        // Setup: Schwarzer Spieler hat höhere Karte
        game.blackPlayer.currentCard = { value: 10, isRevealed: true };
        game.whitePlayer.currentCard = { value: 5, isRevealed: true };

        const initialBlackCards = game.blackPlayer.deck.cards.length;

        game.determineWinner();

        expect(game.blackPlayer.deck.cards.length).toBe(initialBlackCards + 2);
        expect(game.currentPhase).toBe(1);
        expect(game.currentPlayer).toBe(game.blackPlayer);
    });

    test('Spielende bei leeren Karten', () => {
        // Setup: Alle Karten von Weiß entfernen
        game.whitePlayer.deck.cards = [];

        game.checkGameOver();

        expect(game.gameOver).toBe(true);
        expect(game.winner).toBe(game.blackPlayer);
    });
});