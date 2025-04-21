import Game from './Game';

class GameTester {
    constructor() {
        this.game = new Game();
        this.log = [];
    }

    simulateRound() {
        console.log('\n=== Neue Runde ===');

        // Phase 1: Karten ziehen
        console.log('\nPhase 1 - Karten ziehen:');
        this.simulateCardDraw(this.game.blackPlayer, 'Schwarz');
        this.simulateCardDraw(this.game.whitePlayer, 'Weiß');

        // Phase 2: Karten aufdecken
        console.log('\nPhase 2 - Karten aufdecken:');
        this.simulateCardReveal(this.game.blackPlayer, 'Schwarz');
        this.simulateCardReveal(this.game.whitePlayer, 'Weiß');

        // Spielstatus anzeigen
        this.printGameState();
    }

    simulateCardDraw(player, playerName) {
        const result = this.game.handleCardClick(player);
        console.log(`${ playerName } zieht eine Karte: ${ player.currentCard ? '✓' : '✗' }`);
        if (player.currentCard) {
            console.log(`Verdeckte Karte: ?`);
        }
    }

    simulateCardReveal(player, playerName) {
        const result = this.game.handleCardClick(player);
        if (player.currentCard && player.currentCard.isRevealed) {
            console.log(`${ playerName } deckt auf: Wert ${ player.currentCard.value }`);
        }
    }

    printGameState() {
        console.log('\nSpielstatus:');
        console.log(`Schwarze Karten: ${ this.game.blackPlayer.deck.cards.length }`);
        console.log(`Weiße Karten: ${ this.game.whitePlayer.deck.cards.length }`);
        if (this.game.tieCards.length > 0) {
            console.log(`Unentschieden-Stapel: ${ this.game.tieCards.length } Karten`);
        }
        if (this.game.gameOver) {
            console.log(`\nSPIEL BEENDET - ${ this.game.winner === this.game.blackPlayer ? 'Schwarz' : 'Weiß' } gewinnt!`);
        }
    }

    runTest(rounds = 1) {
        console.log('=== Spieltest startet ===');
        for (let i = 0; i < rounds; i++) {
            this.simulateRound();
        }
    }
}

// Test ausführen
const tester = new GameTester();
tester.runTest(3); // Simuliert 3 Runden

export default GameTester;