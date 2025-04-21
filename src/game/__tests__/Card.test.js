import Card from '../Card';

describe('Card Tests', () => {
    let card;

    beforeEach(() => {
        card = new Card(5);
    });

    test('Card Initialization', () => {
        expect(card.value).toBe(5);
        expect(card.isRevealed).toBe(false);
        expect(card.position).toBe(null);
    });

    test('Card Methods', () => {
        expect(card.reveal().isRevealed).toBe(true);
        expect(card.hide().isRevealed).toBe(false);
        expect(card.setPosition('deck').position).toBe('deck');
    });

    test('Card Comparisons', () => {
        const higherCard = new Card(10);
        const equalCard = new Card(5);

        expect(card.isHigherThan(new Card(3))).toBe(true);
        expect(card.isHigherThan(higherCard)).toBe(false);
        expect(card.equals(equalCard)).toBe(true);
    });
});