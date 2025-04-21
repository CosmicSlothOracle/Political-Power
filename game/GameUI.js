class GameUI {
    constructor() {
        this.game = new Game();
        this.initializeUI();
    }

    initializeUI() {
        // Spielbereich erstellen
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'game-container';

        // Spielerbereich erstellen
        this.blackPlayerArea = this.createPlayerArea('black');
        this.whitePlayerArea = this.createPlayerArea('white');

        // Spielfeld-Mitte erstellen
        this.centerArea = document.createElement('div');
        this.centerArea.id = 'center-area';

        // Zusammenfügen
        this.gameContainer.appendChild(this.blackPlayerArea);
        this.gameContainer.appendChild(this.centerArea);
        this.gameContainer.appendChild(this.whitePlayerArea);

        // An Dokument anhängen
        document.body.appendChild(this.gameContainer);

        // Event Listener hinzufügen
        this.addEventListeners();
    }

    createPlayerArea(player) {
        const area = document.createElement('div');
        area.className = `player-area ${ player }`;

        const deck = document.createElement('div');
        deck.className = 'deck';
        deck.textContent = `${ player } Deck`;

        area.appendChild(deck);
        return area;
    }

    addEventListeners() {
        this.blackPlayerArea.querySelector('.deck').addEventListener('click', () => {
            this.handlePlayerClick(this.game.blackPlayer);
        });

        this.whitePlayerArea.querySelector('.deck').addEventListener('click', () => {
            this.handlePlayerClick(this.game.whitePlayer);
        });
    }

    handlePlayerClick(player) {
        const result = this.game.handleCardClick(player);
        this.updateUI();
    }

    updateUI() {
        // Aktuellen Spielzustand anzeigen
        const phase = this.game.currentPhase;
        const currentPlayer = this.game.currentPlayer === this.game.blackPlayer ? 'Schwarz' : 'Weiß';

        // Status anzeigen
        this.updateStatus(`Phase ${ phase } - ${ currentPlayer } ist am Zug`);

        // Karten anzeigen
        this.updateCards();
    }

    updateStatus(message) {
        let statusDiv = document.getElementById('game-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'game-status';
            this.gameContainer.insertBefore(statusDiv, this.centerArea);
        }
        statusDiv.textContent = message;
    }

    updateCards() {
        // Aktuelle Karten anzeigen
        if (this.game.blackPlayer.currentCard) {
            const blackCard = this.game.blackPlayer.currentCard;
            this.showCard('black', blackCard);
        }

        if (this.game.whitePlayer.currentCard) {
            const whiteCard = this.game.whitePlayer.currentCard;
            this.showCard('white', whiteCard);
        }
    }

    showCard(player, card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.textContent = card.isRevealed ? card.value : '?';

        const area = player === 'black' ? this.blackPlayerArea : this.whitePlayerArea;
        const existingCard = area.querySelector('.card');
        if (existingCard) {
            area.removeChild(existingCard);
        }
        area.appendChild(cardDiv);
    }
}

export default GameUI;