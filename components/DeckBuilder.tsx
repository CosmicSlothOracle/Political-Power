import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAllCards, getCardsByType, getCardsByRarity } from '../game/mockCards';
import { Card, Deck, DeckStats } from '../types/gameTypes';
import { SimpleButton } from './SimpleButton';

interface DeckBuilderProps {
    userId?: string;
    onSaveDeck?: (deck: Deck) => void;
    initialDeck?: Deck;
}

const DeckBuilderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const CardCollection = styled.div`
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
`;

const CurrentDeck = styled.div`
  width: 350px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f4f4f4;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
  max-height: 500px;
  overflow-y: auto;
`;

const CardItem = styled.div<{ isInDeck?: boolean }>`
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 12px;
  background-color: ${ props => props.isInDeck ? '#e6f7ff' : 'white' };
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CardName = styled.h3`
  margin: 0 0 5px 0;
  font-size: 16px;
`;

const CardDetails = styled.div`
  font-size: 14px;
  color: #666;
`;

const CardType = styled.span<{ type: string }>`
  background-color: ${ props => {
        switch (props.type) {
            case 'ally': return '#4a69bd'; // Blue for allies
            case 'action': return '#b71540'; // Red for actions
            case 'plot': return '#6ab04c'; // Green for plots
            default: return '#aaa';
        }
    } };
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 5px;
`;

const CardRarity = styled.span<{ rarity: string }>`
  background-color: ${ props => {
        switch (props.rarity?.toLowerCase?.() || 'common') {
            case 'common': return '#aaa';
            case 'rare': return '#5c7cfa';
            case 'legendary': return '#fcc419';
            default: return '#aaa';
        }
    } };
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
`;

const CardInfluence = styled.div`
  margin-top: 8px;
  font-weight: bold;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const FilterButton = styled.button<{ $isActive: boolean }>`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: ${ props => props.$isActive ? '#0070f3' : 'white' };
  color: ${ props => props.$isActive ? 'white' : 'black' };
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: ${ props => props.$isActive ? '#0070f3' : '#f0f0f0' };
  }
`;

const DeckHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const DeckNameInput = styled.input`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 100%;
  margin-bottom: 10px;
`;

const DeckStats = styled.div`
  background-color: #eee;
  border-radius: 6px;
  padding: 10px;
  margin-top: 15px;
  font-size: 14px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

// Add a new styled component for the button description
const ButtonDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  text-align: center;
`;

const ButtonWithTooltip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BarChart = styled.div`
  margin-top: 10px;
  margin-bottom: 15px;
`;

const BarContainer = styled.div`
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  margin-top: 5px;
`;

const Bar = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${ props => props.width }%;
  background-color: ${ props => props.color };
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  font-size: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${ props => props.color };
  margin-right: 5px;
`;

// Add the missing CardDisplay styled component
const CardDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: white;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

// Add the missing CardTitle styled component
const CardTitle = styled.h4`
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: bold;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTypeRarity = styled.div`
  display: flex;
  align-items: center;
`;

const DeckBuilder: React.FC<DeckBuilderProps> = ({ userId, onSaveDeck, initialDeck }) => {
    const [availableCards, setAvailableCards] = useState<Card[]>([]);
    const [deckCards, setDeckCards] = useState<Card[]>(initialDeck?.cards || []);
    const [deckName, setDeckName] = useState<string>(initialDeck?.name || 'New Deck');
    const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
    const [activeRarityFilter, setActiveRarityFilter] = useState<string>('all');

    // Load cards on component mount
    useEffect(() => {
        setAvailableCards(getAllCards());
    }, []);

    // Apply filters to cards
    const filterCards = () => {
        let filteredCards = getAllCards();

        if (activeTypeFilter !== 'all') {
            filteredCards = getCardsByType(activeTypeFilter as 'ally' | 'action' | 'plot');
        }

        if (activeRarityFilter !== 'all') {
            const rarityFiltered = getCardsByRarity(activeRarityFilter as 'common' | 'rare' | 'legendary');
            filteredCards = filteredCards.filter(card => rarityFiltered.some(rc => rc.id === card.id));
        }

        return filteredCards;
    };

    // Add card to deck
    const addCardToDeck = (card: Card) => {
        if (deckCards.length < 20) {
            setDeckCards([...deckCards, card]);
        } else {
            alert('Maximum deck size (20) reached!');
        }
    };

    // Remove card from deck
    const removeCardFromDeck = (card: Card) => {
        const indexToRemove = deckCards.findIndex(c => c.id === card.id);
        if (indexToRemove !== -1) {
            const newDeckCards = [...deckCards];
            newDeckCards.splice(indexToRemove, 1);
            setDeckCards(newDeckCards);
        }
    };

    // Calculate deck stats
    const calculateDeckStats = (): DeckStats => {
        const charakterCount = deckCards.filter(card => card.type === 'charakterkarte').length;
        const spezialCount = deckCards.filter(card => card.type === 'spezialkarte').length;
        const fallenCount = deckCards.filter(card => card.type === 'fallenkarte').length;

        const totalInfluence = deckCards.reduce((sum, card) => sum + card.influence, 0);

        const rarityDistribution = {
            common: deckCards.filter(card => card.rarity === 'common').length,
            rare: deckCards.filter(card => card.rarity === 'rare').length,
            legendary: deckCards.filter(card => card.rarity === 'legendary').length
        };

        return {
            cardCount: deckCards.length,
            maxSize: 20,
            typeCounts: {
                charakterkarte: charakterCount,
                spezialkarte: spezialCount,
                fallenkarte: fallenCount
            },
            rarityDistribution,
            totalInfluence,
            averageInfluence: totalInfluence / (deckCards.length || 1)
        };
    };

    // Save deck
    const saveDeck = () => {
        if (deckCards.length < 10) {
            alert('Your deck needs at least 10 cards!');
            return;
        }

        const newDeck: Deck = {
            id: initialDeck?.id,
            name: deckName,
            cards: deckCards,
            userId: userId,
            createdAt: initialDeck?.createdAt || new Date(),
            updatedAt: new Date()
        };

        if (onSaveDeck) {
            onSaveDeck(newDeck);
        }
    };

    // Reset deck
    const resetDeck = () => {
        if (window.confirm('Are you sure you want to reset your deck?')) {
            setDeckCards([]);
            setDeckName('New Deck');
        }
    };

    const deckStats = calculateDeckStats();
    const filteredCards = filterCards();

    return (
        <DeckBuilderContainer>
            <h1>Deck Builder</h1>

            <DeckNameInput
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Enter deck name..."
            />

            <CardsContainer>
                <CardCollection>
                    <h2>Card Collection</h2>
                    <FiltersContainer>
                        <FilterButton
                            $isActive={activeTypeFilter === 'all'}
                            onClick={() => setActiveTypeFilter('all')}
                        >
                            All Types
                        </FilterButton>
                        <FilterButton
                            $isActive={activeTypeFilter === 'ally'}
                            onClick={() => setActiveTypeFilter('ally')}
                        >
                            Allies
                        </FilterButton>
                        <FilterButton
                            $isActive={activeTypeFilter === 'action'}
                            onClick={() => setActiveTypeFilter('action')}
                        >
                            Actions
                        </FilterButton>
                        <FilterButton
                            $isActive={activeTypeFilter === 'plot'}
                            onClick={() => setActiveTypeFilter('plot')}
                        >
                            Plots
                        </FilterButton>
                    </FiltersContainer>
                    <FiltersContainer>
                        <FilterButton
                            $isActive={activeRarityFilter === 'all'}
                            onClick={() => setActiveRarityFilter('all')}
                        >
                            All Rarities
                        </FilterButton>
                        <FilterButton
                            $isActive={activeRarityFilter === 'common'}
                            onClick={() => setActiveRarityFilter('common')}
                        >
                            Common
                        </FilterButton>
                        <FilterButton
                            $isActive={activeRarityFilter === 'rare'}
                            onClick={() => setActiveRarityFilter('rare')}
                        >
                            Rare
                        </FilterButton>
                        <FilterButton
                            $isActive={activeRarityFilter === 'legendary'}
                            onClick={() => setActiveRarityFilter('legendary')}
                        >
                            Legendary
                        </FilterButton>
                    </FiltersContainer>
                    <CardGrid>
                        {filteredCards.map(card => (
                            <CardItem
                                key={card.id || `card-${ Math.random() }`}
                                onClick={() => addCardToDeck(card)}
                                isInDeck={deckCards.some(dc => dc.id === card.id)}
                            >
                                <CardName>{card.name || 'Unnamed Card'}</CardName>
                                <CardDetails>
                                    <CardType type={card.type || 'unknown'}>
                                        {card.type ? card.type.charAt(0).toUpperCase() + card.type.slice(1) : 'Unknown'}
                                    </CardType>
                                    <CardRarity rarity={card.rarity || 'common'}>
                                        {card.rarity ? card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1) : 'Common'}
                                    </CardRarity>
                                </CardDetails>
                                <CardInfluence>Influence: {card.influence !== null && card.influence !== undefined ? card.influence : 'N/A'}</CardInfluence>
                                <p>{card.description || 'No description'}</p>
                            </CardItem>
                        ))}
                    </CardGrid>
                </CardCollection>

                <CurrentDeck>
                    <h3>Current Deck ({deckCards.length}/30)</h3>
                    {deckCards.map(card => (
                        <CardDisplay
                            key={card.id || `deck-card-${ Math.random() }`}
                            onClick={() => removeCardFromDeck(card)}
                        >
                            <CardTitle>{card.name || 'Unnamed Card'}</CardTitle>
                            <CardInfo>
                                <CardTypeRarity>
                                    <CardType type={card.type || 'unknown'}>
                                        {card.type ? card.type.charAt(0).toUpperCase() + card.type.slice(1) : 'Unknown'}
                                    </CardType>
                                    <CardRarity rarity={card.rarity || 'common'}>
                                        {card.rarity ? card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1) : 'Common'}
                                    </CardRarity>
                                </CardTypeRarity>
                                <CardInfluence>
                                    Influence: {card.influence !== null && card.influence !== undefined ? card.influence : 'N/A'}
                                </CardInfluence>
                            </CardInfo>
                        </CardDisplay>
                    ))}

                    <DeckStats>
                        <h3>Deck Statistics</h3>
                        <StatItem>
                            <span>Cards:</span>
                            <span>{deckStats.cardCount}/20</span>
                        </StatItem>
                        <StatItem>
                            <span>Avg. Influence:</span>
                            <span>{deckStats.averageInfluence}</span>
                        </StatItem>

                        <h4>Card Types:</h4>

                        <BarChart>
                            <BarContainer>
                                {deckStats.cardCount > 0 && (
                                    <>
                                        {deckStats.typeCounts.charakterkarte > 0 && (
                                            <Bar
                                                width={(deckStats.typeCounts.charakterkarte / deckStats.cardCount) * 100}
                                                color="#4a69bd"
                                            />
                                        )}
                                        {deckStats.typeCounts.spezialkarte > 0 && (
                                            <Bar
                                                width={(deckStats.typeCounts.spezialkarte / deckStats.cardCount) * 100}
                                                color="#b71540"
                                            />
                                        )}
                                        {deckStats.typeCounts.fallenkarte > 0 && (
                                            <Bar
                                                width={(deckStats.typeCounts.fallenkarte / deckStats.cardCount) * 100}
                                                color="#6ab04c"
                                            />
                                        )}
                                    </>
                                )}
                            </BarContainer>

                            <Legend>
                                <LegendItem>
                                    <LegendColor color="#4a69bd" />
                                    <span>Ally: {deckStats.typeCounts.charakterkarte || 0}</span>
                                </LegendItem>
                                <LegendItem>
                                    <LegendColor color="#b71540" />
                                    <span>Action: {deckStats.typeCounts.spezialkarte || 0}</span>
                                </LegendItem>
                                <LegendItem>
                                    <LegendColor color="#6ab04c" />
                                    <span>Plot: {deckStats.typeCounts.fallenkarte || 0}</span>
                                </LegendItem>
                            </Legend>
                        </BarChart>

                        <h4>Card Rarities:</h4>
                        <BarChart>
                            <BarContainer>
                                {deckStats.cardCount > 0 && (
                                    <>
                                        {deckStats.rarityDistribution.common > 0 && (
                                            <Bar
                                                width={(deckStats.rarityDistribution.common / deckStats.cardCount) * 100}
                                                color="#aaa"
                                            />
                                        )}
                                        {deckStats.rarityDistribution.rare > 0 && (
                                            <Bar
                                                width={(deckStats.rarityDistribution.rare / deckStats.cardCount) * 100}
                                                color="#5c7cfa"
                                            />
                                        )}
                                        {deckStats.rarityDistribution.legendary > 0 && (
                                            <Bar
                                                width={(deckStats.rarityDistribution.legendary / deckStats.cardCount) * 100}
                                                color="#fcc419"
                                            />
                                        )}
                                    </>
                                )}
                            </BarContainer>

                            <Legend>
                                <LegendItem>
                                    <LegendColor color="#aaa" />
                                    <span>Common: {deckStats.rarityDistribution.common || 0}</span>
                                </LegendItem>
                                <LegendItem>
                                    <LegendColor color="#5c7cfa" />
                                    <span>Rare: {deckStats.rarityDistribution.rare || 0}</span>
                                </LegendItem>
                                <LegendItem>
                                    <LegendColor color="#fcc419" />
                                    <span>Legendary: {deckStats.rarityDistribution.legendary || 0}</span>
                                </LegendItem>
                            </Legend>
                        </BarChart>
                    </DeckStats>

                    <ButtonGroup>
                        <ButtonWithTooltip>
                            <SimpleButton
                                onClick={saveDeck}
                                disabled={deckCards.length < 10}
                                color={deckCards.length < 10 ? "secondary" : "primary"}
                            >
                                Save Deck
                            </SimpleButton>
                            <ButtonDescription>
                                {deckCards.length < 10
                                    ? `Need at least 10 cards (${ deckCards.length }/10)`
                                    : "Save your deck to your collection"}
                            </ButtonDescription>
                        </ButtonWithTooltip>

                        <ButtonWithTooltip>
                            <SimpleButton
                                onClick={resetDeck}
                                color="danger"
                            >
                                Reset Deck
                            </SimpleButton>
                            <ButtonDescription>
                                Clear all cards from your deck
                            </ButtonDescription>
                        </ButtonWithTooltip>
                    </ButtonGroup>
                </CurrentDeck>
            </CardsContainer>
        </DeckBuilderContainer>
    );
};

export default DeckBuilder;