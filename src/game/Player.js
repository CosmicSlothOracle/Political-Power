import Deck from './Deck';

class Player {
    constructor(isBlack) {
        this.deck = new Deck();
        this.isBlack = isBlack;
        this.currentCard = null;
        this.score = 0;
    }

    drawCard() {
        const card = this.deck.drawCard();
        if (card) {
            if (this.currentCard) {
                // Wenn noch eine alte Karte existiert, zurück ins Deck
                this.deck.addCardsToBottom([this.currentCard]);
            }
            this.currentCard = card;
            card.setPosition(this.isBlack ? 'black-hand' : 'white-hand');
        }
        return card;
    }

    addWonCards(cards) {
        cards.forEach(card => {
            card.hide(); // Karten werden verdeckt ins Deck gelegt
            card.setPosition('deck');
        });
        this.deck.addCardsToBottom(cards);
        this.score += cards.length;
    }

    hasCards() {
        return this.deck.cards.length > 0 || this.currentCard !== null;
    }

    reset() {
        if (this.currentCard) {
            this.deck.addCardsToBottom([this.currentCard]);
        }
        this.currentCard = null;
        this.score = 0;
    }

    getState() {
        return {
            cardsInDeck: this.deck.cards.length,
            currentCard: this.currentCard ? {
                value: this.currentCard.value,
                isRevealed: this.currentCard.isRevealed,
                position: this.currentCard.position
            } : null,
            score: this.score,
            isBlack: this.isBlack
        };
    }
}

export default Player;