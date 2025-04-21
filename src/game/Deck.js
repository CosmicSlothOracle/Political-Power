import Card from './Card';

class Deck {
    constructor() {
        this.cards = [];
        this.initializeDeck();
    }

    initializeDeck() {
        // Erstelle 20 Karten mit Werten von 1-20
        for (let i = 1; i <= 20; i++) {
            const card = new Card(i);
            card.setPosition('deck');
            this.cards.push(card);
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this;
    }

    drawCard() {
        if (this.cards.length === 0) return null;
        const card = this.cards.pop();
        card.hide(); // Sicherstellen, dass die gezogene Karte verdeckt ist
        return card;
    }

    addCardsToBottom(cards) {
        if (!Array.isArray(cards)) {
            cards = [cards];
        }
        cards.forEach(card => {
            if (card instanceof Card) {
                card.setPosition('deck');
                this.cards.unshift(card);
            }
        });
    }

    getSize() {
        return this.cards.length;
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    reset() {
        this.cards = [];
        this.initializeDeck();
    }
}

export default Deck;