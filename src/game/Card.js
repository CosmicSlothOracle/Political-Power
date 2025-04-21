class Card {
    constructor(value) {
        this.value = value;
        this.isRevealed = false;
        this.position = null; // 'deck', 'hand', 'center', 'tie'
    }

    reveal() {
        this.isRevealed = true;
        return this;
    }

    hide() {
        this.isRevealed = false;
        return this;
    }

    setPosition(position) {
        this.position = position;
        return this;
    }

    clone() {
        const clonedCard = new Card(this.value);
        clonedCard.isRevealed = this.isRevealed;
        clonedCard.position = this.position;
        return clonedCard;
    }

    equals(otherCard) {
        return this.value === otherCard.value;
    }

    isHigherThan(otherCard) {
        return this.value > otherCard.value;
    }
}

export default Card;