import {
    GameState,
    Player,
    Card,
    GamePhase,
    ActionType,
    Coalition
} from '../types/gameTypes';
import { v4 as uuidv4 } from 'uuid';

/**
 * GameLogic - Implementiert komplexere Spiellogik und Karteneffekte
 */
export class GameLogic {
    /**
     * Spielt eine Charakterkarte für einen Spieler
     */
    playCharacterCard(gameState: GameState, playerId: string, cardId: string): GameState {
        // Prüfen, ob in der richtigen Phase
        if (gameState.phase !== GamePhase.CHARACTER) {
            throw new Error('Charakterkarten können nur in der Charakterphase gespielt werden');
        }

        // Spieler finden
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) {
            throw new Error('Spieler nicht gefunden');
        }

        // Karte finden
        const cardIndex = player.hand.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            throw new Error('Karte nicht in der Hand');
        }

        const card = player.hand[cardIndex];

        // Prüfen, ob es eine Charakterkarte ist
        if (card.type !== 'charakterkarte') {
            throw new Error('Nur Charakterkarten können in dieser Phase gespielt werden');
        }

        // Karte spielen
        const updatedHand = [...player.hand];
        updatedHand.splice(cardIndex, 1);

        const updatedPlayer = {
            ...player,
            hand: updatedHand,
            playedCharacters: [...player.playedCharacters, card]
        };

        // Spielzustand aktualisieren
        return {
            ...gameState,
            players: gameState.players.map(p => p.id === playerId ? updatedPlayer : p),
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: `${ player.name } hat ${ card.name } gespielt`,
                    type: 'action',
                    playerId
                }
            ]
        };
    }

    /**
     * Spielt eine Spezialkarte für einen Spieler
     */
    playSpecialCard(gameState: GameState, playerId: string, cardId: string): GameState {
        // Prüfen, ob in der richtigen Phase
        if (gameState.phase !== GamePhase.SPECIAL) {
            throw new Error('Spezialkarten können nur in der Spezialphase gespielt werden');
        }

        // Spieler finden
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) {
            throw new Error('Spieler nicht gefunden');
        }

        // Karte finden
        const cardIndex = player.hand.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            throw new Error('Karte nicht in der Hand');
        }

        const card = player.hand[cardIndex];

        // Prüfen, ob es eine Spezialkarte ist
        if (card.type !== 'spezialkarte') {
            throw new Error('Nur Spezialkarten können in dieser Phase gespielt werden');
        }

        // Karte spielen
        const updatedHand = [...player.hand];
        updatedHand.splice(cardIndex, 1);

        const updatedPlayer = {
            ...player,
            hand: updatedHand,
            playedSpecials: [...player.playedSpecials, card]
        };

        // Spielzustand aktualisieren
        return {
            ...gameState,
            players: gameState.players.map(p => p.id === playerId ? updatedPlayer : p),
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: `${ player.name } hat ${ card.name } gespielt`,
                    type: 'action',
                    playerId
                }
            ]
        };
    }

    /**
     * Spielt eine Fallenkarte verdeckt
     */
    playTrapCard(gameState: GameState, playerId: string, cardId: string): GameState {
        // Prüfen, ob in der richtigen Phase
        if (gameState.phase !== GamePhase.SPECIAL) {
            throw new Error('Fallenkarten können nur in der Spezialphase gespielt werden');
        }

        // Spieler finden
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) {
            throw new Error('Spieler nicht gefunden');
        }

        // Prüfen, ob der Spieler eine Charakterkarte gespielt hat
        if (player.playedCharacters.length === 0) {
            throw new Error('Fallenkarten können nur gespielt werden, wenn auch eine Charakterkarte gespielt wurde');
        }

        // Karte finden
        const cardIndex = player.hand.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            throw new Error('Karte nicht in der Hand');
        }

        const card = player.hand[cardIndex];

        // Prüfen, ob es eine Fallenkarte ist
        if (card.type !== 'fallenkarte' && card.type !== 'bonuskarte') {
            throw new Error('Nur Fallenkarten oder Bonuskarten können so gespielt werden');
        }

        // Karte spielen
        const updatedHand = [...player.hand];
        updatedHand.splice(cardIndex, 1);

        const updatedPlayer = {
            ...player,
            hand: updatedHand,
            playedTraps: [...player.playedTraps, card]
        };

        // Spielzustand aktualisieren
        return {
            ...gameState,
            players: gameState.players.map(p => p.id === playerId ? updatedPlayer : p),
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: `${ player.name } hat eine verdeckte Karte gespielt`,
                    type: 'action',
                    playerId
                }
            ]
        };
    }

    /**
     * Auflösung der Spielphase und Berechnung des Rundengewinners
     */
    resolveRound(gameState: GameState): GameState {
        if (gameState.phase !== GamePhase.RESOLUTION) {
            throw new Error('Auflösung nur in der Auflösungsphase möglich');
        }

        let updatedGameState = { ...gameState };

        // 1. Verdeckte Karten aufdecken
        updatedGameState = this.revealCards(updatedGameState);

        // 2. Einfluss berechnen (mit Karteneffekten)
        updatedGameState = this.calculateInfluence(updatedGameState);

        // 3. Gewinner bestimmen und Mandate vergeben
        updatedGameState = this.determineWinnerAndAwardMandates(updatedGameState);

        return updatedGameState;
    }

    /**
     * Berechnet den Einfluss für alle Spieler unter Berücksichtigung von Karteneffekten
     */
    private calculateInfluence(gameState: GameState): GameState {
        // Einfluss für jeden Spieler berechnen
        const playersWithInfluence = gameState.players.map(player => {
            // Einfluss aller gespielten Karten summieren
            let totalInfluence = 0;

            // Basiseinfluss der Charakterkarte
            if (player.playedCharacters.length > 0) {
                const characterCard = player.playedCharacters[0];
                totalInfluence += characterCard.influence || 0;

                // Karteneffekte anwenden
                totalInfluence += this.applyCharacterEffects(gameState, player, characterCard);
            }

            // Einfluss von Spezialkarten
            player.playedSpecials.forEach(card => {
                totalInfluence += card.influence || 0;
                // Spezialkarteneffekte werden später angewendet
            });

            // Einfluss von Fallenkarten/Bonuskarten
            player.playedTraps.forEach(card => {
                totalInfluence += card.influence || 0;
                // Fallenkarten-Effekte wurden bereits in revealCards angewendet
            });

            // Koalitionseffekte
            if (player.coalitionWith) {
                const coalition = gameState.coalitions.find(
                    c => (c.player1Id === player.id && c.player2Id === player.coalitionWith) ||
                        (c.player1Id === player.coalitionWith && c.player2Id === player.id)
                );

                if (coalition) {
                    // Koalitionseffekte anwenden
                    totalInfluence += this.applyCoalitionEffects(gameState, player, coalition);
                }
            }

            return {
                ...player,
                currentInfluence: totalInfluence // temporäres Feld für den berechneten Einfluss
            };
        });

        // Spezialkarten-Effekte anwenden
        const playersAfterSpecialEffects = this.applyAllSpecialCardEffects(gameState, playersWithInfluence);

        // Logbuch aktualisieren
        const influenceLog = playersAfterSpecialEffects.map(player => {
            return {
                timestamp: new Date(),
                message: `${ player.name } hat Einfluss: ${ player.currentInfluence }`,
                type: 'result' as const,
                playerId: player.id
            };
        });

        return {
            ...gameState,
            players: playersAfterSpecialEffects,
            log: [...gameState.log, ...influenceLog]
        };
    }

    /**
     * Wendet Charakterkarten-Effekte an und gibt den Bonus-Einfluss zurück
     */
    private applyCharacterEffects(gameState: GameState, player: Player, characterCard: Card): number {
        let bonusInfluence = 0;

        if (!characterCard.effect) {
            return bonusInfluence;
        }

        // Effekttext auswerten und entsprechende Boni anwenden
        // Hier exemplarische Implementierung für häufige Effektmuster

        // Momentum-abhängige Effekte
        if (characterCard.effect.includes('Bei Momentum')) {
            if (characterCard.effect.includes('1-2') && (gameState.momentum === 1 || gameState.momentum === 2)) {
                bonusInfluence += 1;
            } else if (characterCard.effect.includes('3-4') && (gameState.momentum === 3 || gameState.momentum === 4)) {
                bonusInfluence += 2;
            } else if (characterCard.effect.includes('5-6') && (gameState.momentum === 5 || gameState.momentum === 6)) {
                bonusInfluence += 2;
            }
        }

        // Mandat-abhängige Effekte
        if (characterCard.effect.includes('0 Mandate') && player.mandates === 0) {
            bonusInfluence += 3;
        } else if (characterCard.effect.includes('4+ eigenen Mandaten') && player.mandates >= 4) {
            bonusInfluence += 1;
        } else if (characterCard.effect.includes('weniger als 3 Mandaten') && player.mandates < 3) {
            bonusInfluence += 2;
        }

        // Koalitionseffekte
        if (characterCard.effect.includes('Bei Koalition') && player.coalitionWith) {
            if (characterCard.effect.includes('+1 Einfluss')) {
                bonusInfluence += 1;
            }
        }

        // Spezialkarten-abhängige Effekte
        if (characterCard.effect.includes('gespielte Spezialkarte') && player.playedSpecials.length > 0) {
            bonusInfluence += player.playedSpecials.length;
        }

        // Fallenkarten-abhängige Effekte
        if (characterCard.effect.includes('Fallenkarten im Spiel') &&
            gameState.players.some(p => p.playedTraps.length > 0)) {
            bonusInfluence += 2;
        }

        return bonusInfluence;
    }

    /**
     * Wendet Koalitionseffekte an
     */
    private applyCoalitionEffects(gameState: GameState, player: Player, coalition: Coalition): number {
        let bonusInfluence = 0;

        // Prüfen, ob die Koalition durch andere Charakterkarten verstärkt wird
        const coalitionPartner = gameState.players.find(p => p.id === player.coalitionWith);
        if (!coalitionPartner) return 0;

        // Koalitionseffekte von Charakterkarten
        const partnerCharacters = coalitionPartner.playedCharacters;
        if (partnerCharacters.length > 0) {
            const partnerCard = partnerCharacters[0];

            if (partnerCard.effect?.includes('Bei Koalition: Beide Partner erhalten +1 Einfluss')) {
                bonusInfluence += 1;
            }
        }

        // Abzug für wiederholte Koalitionen
        if (coalition.consecutiveRounds > 1) {
            // Prüfen, ob diese Abzüge durch Karten verhindert werden
            const preventPenalty = player.playedCharacters.some(
                card => card.effect?.includes('Keine Mandatsverluste durch wiederholte Koalitionen')
            ) || coalitionPartner.playedCharacters.some(
                card => card.effect?.includes('Keine Mandatsverluste durch wiederholte Koalitionen')
            );

            if (!preventPenalty) {
                bonusInfluence -= (coalition.consecutiveRounds - 1);
            }
        }

        return bonusInfluence;
    }

    /**
     * Wendet alle Spezialkarten-Effekte an
     */
    private applyAllSpecialCardEffects(gameState: GameState, players: Array<Player & { currentInfluence: number }>): Array<Player & { currentInfluence: number }> {
        // Alle gespielten Spezialkarten sammeln
        const allSpecialCards = players.flatMap(player =>
            player.playedSpecials.map(card => ({ player, card }))
        );

        // Nach Priorität sortieren (falls notwendig)

        // Alle Effekte anwenden
        let updatedPlayers = [...players];

        allSpecialCards.forEach(({ player, card }) => {
            if (!card.effect) return;

            // Effekttext auswerten und entsprechende Änderungen vornehmen
            if (card.effect.includes('Erhöhe den Einfluss deiner Charakterkarte um +2')) {
                // Spieler finden und Einfluss erhöhen
                const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
                if (playerIndex !== -1) {
                    updatedPlayers[playerIndex] = {
                        ...updatedPlayers[playerIndex],
                        currentInfluence: updatedPlayers[playerIndex].currentInfluence + 2
                    };
                }
            }
            else if (card.effect.includes('Setze den Momentumwert auf 3')) {
                // Dies würde den Spielzustand ändern und sollte in einer komplexeren Implementierung behandelt werden
                // Für jetzt ignorieren wir dies
            }
            else if (card.effect.includes('Alle Koalitionen erhalten +1 Einfluss')) {
                // Alle Spieler in Koalitionen finden und Einfluss erhöhen
                updatedPlayers = updatedPlayers.map(p => {
                    if (p.coalitionWith) {
                        return {
                            ...p,
                            currentInfluence: p.currentInfluence + 1
                        };
                    }
                    return p;
                });
            }
        });

        return updatedPlayers;
    }

    /**
     * Deckt alle verdeckten Karten auf und wendet Falleneffekte an
     */
    private revealCards(gameState: GameState): GameState {
        // Alle Spieler mit ihren gespielten Fallen durchgehen
        const playersWithRevealedTraps = gameState.players.map(player => {
            // Fallen aufdecken
            const revealedTraps = player.playedTraps;

            return {
                ...player,
                playedTraps: revealedTraps
            };
        });

        // Log-Einträge für aufgedeckte Fallen erstellen
        const trapLogs = [];
        for (const player of playersWithRevealedTraps) {
            for (const trap of player.playedTraps) {
                trapLogs.push({
                    timestamp: new Date(),
                    message: `${ player.name } deckt ${ trap.name } auf`,
                    type: 'effect' as const,
                    playerId: player.id
                });
            }
        }

        // Fallen-Effekte anwenden würde hier folgen...
        // Dies ist komplex und würde eine eigene Methode erfordern

        return {
            ...gameState,
            players: playersWithRevealedTraps,
            log: [...gameState.log, ...trapLogs]
        };
    }

    /**
     * Ermittelt den Gewinner der Runde und vergibt Mandate
     */
    private determineWinnerAndAwardMandates(gameState: GameState): GameState {
        // Spieler nach Einfluss sortieren (absteigend)
        const sortedPlayers = [...gameState.players]
            .sort((a, b) => {
                // Typumwandlung, da currentInfluence ein temporäres Feld ist
                const aInfluence = (a as any).currentInfluence || 0;
                const bInfluence = (b as any).currentInfluence || 0;
                return bInfluence - aInfluence;
            });

        // Höchsten Einfluss bestimmen
        const highestInfluence = (sortedPlayers[0] as any).currentInfluence || 0;

        // Alle Spieler mit höchstem Einfluss finden (für den Fall eines Gleichstands)
        const winners = sortedPlayers.filter(p => (p as any).currentInfluence === highestInfluence);

        // Mandate vergeben
        let updatedPlayers = [...gameState.players];
        const mandateLogs = [];

        if (winners.length === 1) {
            // Eindeutiger Gewinner (Solosieg)
            const winner = winners[0];
            const isSolo = !winner.coalitionWith;

            // Mandate berechnen
            const mandatesGained = isSolo ? gameState.momentum + 2 : gameState.momentum - 1;

            // Spieler aktualisieren
            const winnerIndex = updatedPlayers.findIndex(p => p.id === winner.id);
            if (winnerIndex !== -1) {
                updatedPlayers[winnerIndex] = {
                    ...updatedPlayers[winnerIndex],
                    mandates: updatedPlayers[winnerIndex].mandates + mandatesGained
                };

                mandateLogs.push({
                    timestamp: new Date(),
                    message: `${ winner.name } gewinnt die Runde mit ${ highestInfluence } Einfluss und erhält ${ mandatesGained } Mandate`,
                    type: 'result' as const,
                    playerId: winner.id
                });
            }

            // Bei Koalition auch dem Partner Mandate geben
            if (!isSolo) {
                const partner = updatedPlayers.find(p => p.id === winner.coalitionWith);
                if (partner) {
                    const partnerIndex = updatedPlayers.findIndex(p => p.id === partner.id);

                    if (partnerIndex !== -1) {
                        updatedPlayers[partnerIndex] = {
                            ...updatedPlayers[partnerIndex],
                            mandates: updatedPlayers[partnerIndex].mandates + mandatesGained
                        };

                        mandateLogs.push({
                            timestamp: new Date(),
                            message: `${ partner.name } erhält als Koalitionspartner ebenfalls ${ mandatesGained } Mandate`,
                            type: 'result' as const,
                            playerId: partner.id
                        });
                    }
                }
            }
        } else {
            // Gleichstand - komplexere Regeln
            // Für dieses Beispiel: Alle Gewinner erhalten 1 Mandat
            for (const winner of winners) {
                const winnerIndex = updatedPlayers.findIndex(p => p.id === winner.id);
                if (winnerIndex !== -1) {
                    updatedPlayers[winnerIndex] = {
                        ...updatedPlayers[winnerIndex],
                        mandates: updatedPlayers[winnerIndex].mandates + 1
                    };

                    mandateLogs.push({
                        timestamp: new Date(),
                        message: `${ winner.name } teilt sich den Sieg und erhält 1 Mandat`,
                        type: 'result' as const,
                        playerId: winner.id
                    });
                }
            }
        }

        // Temporäres Feld entfernen
        updatedPlayers = updatedPlayers.map(player => {
            const { currentInfluence, ...rest } = player as any;
            return rest;
        });

        return {
            ...gameState,
            players: updatedPlayers,
            log: [...gameState.log, ...mandateLogs]
        };
    }

    /**
     * Verarbeitet die Einflussverlustphase
     */
    processInfluenceLoss(gameState: GameState): GameState {
        // Implementierung des Einflussverlustmechanismus
        // Dies würde ähnlich wie die calculateInfluence und determineWinnerAndAwardMandates Methoden aussehen

        // Für dieses Beispiel: Einfache Implementierung
        return {
            ...gameState,
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: 'Einflussverlustphase abgeschlossen',
                    type: 'system'
                }
            ]
        };
    }

    /**
     * Lässt Spieler Karten ziehen für die nächste Runde
     */
    drawCards(gameState: GameState): GameState {
        const updatedPlayers = gameState.players.map(player => {
            // Eine Karte ziehen, falls verfügbar
            if (player.drawPile.length > 0) {
                const newCard = player.drawPile[0];
                const newDrawPile = player.drawPile.slice(1);

                return {
                    ...player,
                    hand: [...player.hand, newCard],
                    drawPile: newDrawPile,
                    // Gespielte Karten in den Ablagestapel
                    discardPile: [
                        ...player.discardPile,
                        ...player.playedCharacters,
                        ...player.playedSpecials,
                        ...player.playedTraps
                    ],
                    // Gespielte Karten zurücksetzen
                    playedCharacters: [],
                    playedSpecials: [],
                    playedTraps: [],
                    // Koalition zurücksetzen
                    coalitionWith: undefined
                };
            } else if (player.discardPile.length > 0) {
                // Ablagestapel mischen und als neuen Zugstapel verwenden
                const shuffledDiscard = [...player.discardPile].sort(() => 0.5 - Math.random());
                const newCard = shuffledDiscard[0];
                const newDrawPile = shuffledDiscard.slice(1);

                return {
                    ...player,
                    hand: [...player.hand, newCard],
                    drawPile: newDrawPile,
                    discardPile: [
                        ...player.playedCharacters,
                        ...player.playedSpecials,
                        ...player.playedTraps
                    ],
                    playedCharacters: [],
                    playedSpecials: [],
                    playedTraps: [],
                    coalitionWith: undefined
                };
            } else {
                // Keine Karten mehr zum Ziehen
                return {
                    ...player,
                    discardPile: [
                        ...player.discardPile,
                        ...player.playedCharacters,
                        ...player.playedSpecials,
                        ...player.playedTraps
                    ],
                    playedCharacters: [],
                    playedSpecials: [],
                    playedTraps: [],
                    coalitionWith: undefined
                };
            }
        });

        return {
            ...gameState,
            players: updatedPlayers,
            log: [
                ...gameState.log,
                {
                    timestamp: new Date(),
                    message: 'Spieler haben Karten für die nächste Runde gezogen',
                    type: 'system'
                }
            ]
        };
    }
}