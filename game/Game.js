import Player from './Player';
import Card from './Card';

class Game {
    constructor() {
        this.blackPlayer = new Player(true);
        this.whitePlayer = new Player(false);
        this.currentPhase = 1;
        this.currentPlayer = this.blackPlayer;
        this.tieCards = [];
        this.gameOver = false;
        this.winner = null;
        this.lastWinner = null;
    }

    handleCardClick(player) {
        if (this.gameOver || player !== this.currentPlayer) {
            return false;
        }

        if (this.currentPhase === 1) {
            return this.handlePhase1(player);
        } else {
            return this.handlePhase2(player);
        }
    }

    handlePhase1(player) {
        const card = player.drawCard();
        if (!card) {
            this.checkGameOver();
            return false;
        }

        card.setPosition('hand');

        if (player === this.blackPlayer) {
            this.currentPlayer = this.whitePlayer;
        } else {
            this.currentPhase = 2;
            this.currentPlayer = this.blackPlayer;
        }
        return true;
    }

    handlePhase2(player) {
        if (!player.currentCard) return false;

        player.currentCard.reveal().setPosition('center');

        if (player === this.blackPlayer) {
            this.currentPlayer = this.whitePlayer;
        } else {
            this.determineWinner();
        }
        return true;
    }

    determineWinner() {
        const blackCard = this.blackPlayer.currentCard;
        const whiteCard = this.whitePlayer.currentCard;

        let winner = null;

        if (blackCard.isHigherThan(whiteCard)) {
            winner = this.blackPlayer;
        } else if (whiteCard.isHigherThan(blackCard)) {
            winner = this.whitePlayer;
        } else if (blackCard.equals(whiteCard)) {
            this.handleTie();
            return;
        }

        if (winner) {
            const cards = [...this.tieCards, blackCard, whiteCard];
            cards.forEach(card => card.setPosition('deck'));
            winner.addWonCards(cards);
            this.tieCards = [];
            this.lastWinner = winner;
            this.startNewRound(winner);
        }
    }

    handleTie() {
        const cards = [this.blackPlayer.currentCard, this.whitePlayer.currentCard];
        cards.forEach(card => card.setPosition('tie'));
        this.tieCards.push(...cards);
        this.currentPhase = 1;
        // Aktueller Spieler bleibt am Zug
    }

    startNewRound(winner) {
        this.currentPhase = 1;
        this.currentPlayer = winner;
        this.blackPlayer.currentCard = null;
        this.whitePlayer.currentCard = null;
        this.checkGameOver();
    }

    checkGameOver() {
        if (!this.blackPlayer.hasCards()) {
            this.gameOver = true;
            this.winner = this.whitePlayer;
        } else if (!this.whitePlayer.hasCards()) {
            this.gameOver = true;
            this.winner = this.blackPlayer;
        }
    }

    getGameState() {
        return {
            currentPhase: this.currentPhase,
            currentPlayer: this.currentPlayer === this.blackPlayer ? 'Schwarz' : 'Weiß',
            blackCards: this.blackPlayer.deck.cards.length,
            whiteCards: this.whitePlayer.deck.cards.length,
            tieCards: this.tieCards.length,
            gameOver: this.gameOver,
            winner: this.winner ? (this.winner === this.blackPlayer ? 'Schwarz' : 'Weiß') : null,
            lastWinner: this.lastWinner ? (this.lastWinner === this.blackPlayer ? 'Schwarz' : 'Weiß') : null
        };
    }
}

export default Game;