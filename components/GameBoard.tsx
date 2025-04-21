import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Player, Card, GameLogEntry } from '../types/gameTypes';
import GameCard from './GameCard';
import Button from './Button';
import toast from './ToastProvider';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #1a1a2e;
  color: #fff;
  overflow: hidden;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #16213e;
`;

const GameInfo = styled.div`
  display: flex;
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .label {
    font-size: 12px;
    opacity: 0.7;
  }

  .value {
    font-size: 18px;
    font-weight: bold;
  }
`;

const MomentumMeter = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const MomentumLevel = styled.div<{ active: boolean; level: number }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${ props => props.active ? getColorForLevel(props.level) : '#333' };
  transition: all 0.3s ease;
`;

const getColorForLevel = (level: number) => {
    switch (level) {
        case 1: return '#4a69bd';
        case 2: return '#6ab04c';
        case 3: return '#f9ca24';
        case 4: return '#f0932b';
        case 5: return '#eb4d4b';
        default: return '#333';
    }
};

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const GameBoardSection = styled.div`
  display: flex;
  flex: 1;
  position: relative;
`;

const CenterArea = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 300px;
  background-color: rgba(25, 42, 86, 0.7);
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2;
`;

const PlayedCardsArea = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const PlayedCardSlot = styled.div<{ isActive: boolean }>`
  width: 140px;
  height: 200px;
  background-color: ${ props => props.isActive ? 'rgba(106, 176, 76, 0.3)' : 'rgba(255, 255, 255, 0.1)' };
  border: 2px dashed ${ props => props.isActive ? '#6ab04c' : '#555' };
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const PlayerName = styled.div`
  position: absolute;
  bottom: -25px;
  font-size: 12px;
  text-align: center;
  width: 100%;
`;

const PlayerSlot = styled.div<{ position: string }>`
  position: absolute;
  ${ props => {
        switch (props.position) {
            case 'top':
                return 'top: 20px; left: 50%; transform: translateX(-50%);';
            case 'right':
                return 'top: 50%; right: 20px; transform: translateY(-50%);';
            case 'bottom':
                return 'bottom: 20px; left: 50%; transform: translateX(-50%);';
            case 'left':
                return 'top: 50%; left: 20px; transform: translateY(-50%);';
            default:
                return '';
        }
    } }
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const PlayerInfo = styled.div<{ isCurrentPlayer: boolean }>`
  background-color: ${ props => props.isCurrentPlayer ? '#0f3460' : 'rgba(15, 52, 96, 0.5)' };
  border: ${ props => props.isCurrentPlayer ? '2px solid #4a69bd' : '1px solid #333' };
  border-radius: 10px;
  padding: 10px;
  width: 200px;
  text-align: center;

  .name {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .stats {
    display: flex;
    justify-content: space-around;
    font-size: 12px;
  }
`;

const PlayerHand = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 600px;
`;

const HandCard = styled(motion.div) <{ isSelectable: boolean }>`
  transform-origin: bottom center;
  cursor: ${ props => props.isSelectable ? 'pointer' : 'default' };
  opacity: ${ props => props.isSelectable ? 1 : 0.7 };
`;

const LogSection = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 300px;
  height: 200px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const LogHeader = styled.div`
  padding: 10px;
  background-color: #16213e;
  font-weight: bold;
  border-bottom: 1px solid #333;
`;

const LogContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column-reverse;
`;

const LogEntry = styled.div<{ type?: string }>`
  margin-bottom: 5px;
  font-size: 12px;
  color: ${ props => {
        switch (props.type) {
            case 'action': return '#6ab04c';
            case 'system': return '#f9ca24';
            case 'error': return '#eb4d4b';
            default: return '#fff';
        }
    } };
`;

const DiceArea = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const Dice = styled(motion.div) <{ result: number | null }>`
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: black;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  margin: 0 auto;
`;

const CoalitionIndicator = styled.div`
  position: absolute;
  height: 5px;
  background-color: #f9ca24;
  z-index: 1;
`;

interface GameBoardProps {
    gameState: GameState;
    currentUserId: string;
    onPlayCard: (cardId: string) => void;
    onRevealCard: () => void;
    onProposeCoalition: (targetUserId: string) => void;
    onAcceptCoalition: (partnerUserId: string) => void;
    onDeclineCoalition: (partnerUserId: string) => void;
    onRollDice: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
    gameState,
    currentUserId,
    onPlayCard,
    onRevealCard,
    onProposeCoalition,
    onAcceptCoalition,
    onDeclineCoalition,
    onRollDice
}) => {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [diceAnimating, setDiceAnimating] = useState(false);

    // Get the current player
    const currentPlayer = gameState.players.find(p => p.userId === currentUserId);

    // Determine player positions based on gameState.players array and current player
    const getPlayerPositions = () => {
        const positions = ['bottom', 'right', 'top', 'left'];
        const currentPlayerIndex = gameState.players.findIndex(p => p.userId === currentUserId);

        if (currentPlayerIndex === -1) return {};

        let positionMap: Record<string, string> = {};

        gameState.players.forEach((player, index) => {
            const positionIndex = (index - currentPlayerIndex + positions.length) % positions.length;
            positionMap[player.userId] = positions[positionIndex];
        });

        return positionMap;
    };

    const playerPositions = getPlayerPositions();

    // Check if the current player can play a card
    const canPlayCard = () => {
        return (
            gameState.status === 'active' &&
            gameState.phase === 'playing' &&
            gameState.activePlayerId === currentUserId &&
            currentPlayer &&
            !currentPlayer.playedCard
        );
    };

    // Check if the current player can roll dice
    const canRollDice = () => {
        return (
            gameState.status === 'active' &&
            gameState.phase === 'resolving' &&
            gameState.activePlayerId === currentUserId
        );
    };

    // Handle card selection
    const handleCardSelect = (cardId: string) => {
        if (!canPlayCard()) return;

        if (selectedCardId === cardId) {
            onPlayCard(cardId);
            setSelectedCardId(null);
        } else {
            setSelectedCardId(cardId);
        }
    };

    // Handle dice roll
    const handleRollDice = () => {
        if (!canRollDice()) return;

        setDiceAnimating(true);

        // Animate dice rolling
        const rollInterval = setInterval(() => {
            setDiceResult(Math.floor(Math.random() * 6) + 1);
        }, 100);

        // Stop animation after 1.5 seconds and trigger roll action
        setTimeout(() => {
            clearInterval(rollInterval);
            setDiceAnimating(false);
            onRollDice();
        }, 1500);
    };

    // Add a function to handle card reveals
    const handleReveal = () => {
        if (canRevealCard()) {
            onRevealCard();
        } else {
            toast.error('You cannot reveal a card now');
        }
    };

    // Add a function to check if the current user can reveal a card
    const canRevealCard = () => {
        return (
            gameState.status === 'active' &&
            gameState.phase === 'revealing' &&
            gameState.activePlayerId === currentUserId
        );
    };

    // Get coalition lines between players
    const getCoalitionLines = () => {
        const coalitions = gameState.coalitions.filter(c => c.active);

        return coalitions.map((coalition, index) => {
            const player1Pos = playerPositions[coalition.player1Id];
            const player2Pos = playerPositions[coalition.player2Id];

            // Calculate line position and rotation based on player positions
            let props = {};

            if ((player1Pos === 'bottom' && player2Pos === 'right') ||
                (player1Pos === 'right' && player2Pos === 'bottom')) {
                props = {
                    bottom: '200px',
                    right: '200px',
                    width: '200px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'bottom right'
                };
            } else if ((player1Pos === 'right' && player2Pos === 'top') ||
                (player1Pos === 'top' && player2Pos === 'right')) {
                props = {
                    top: '200px',
                    right: '200px',
                    width: '200px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'top right'
                };
            } else if ((player1Pos === 'top' && player2Pos === 'left') ||
                (player1Pos === 'left' && player2Pos === 'top')) {
                props = {
                    top: '200px',
                    left: '200px',
                    width: '200px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'top left'
                };
            } else if ((player1Pos === 'left' && player2Pos === 'bottom') ||
                (player1Pos === 'bottom' && player2Pos === 'left')) {
                props = {
                    bottom: '200px',
                    left: '200px',
                    width: '200px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'bottom left'
                };
            } else if ((player1Pos === 'bottom' && player2Pos === 'top') ||
                (player1Pos === 'top' && player2Pos === 'bottom')) {
                props = {
                    left: '50%',
                    height: 'calc(100% - 400px)',
                    width: '5px',
                    transform: 'translateX(-50%)',
                    top: '200px'
                };
            } else if ((player1Pos === 'left' && player2Pos === 'right') ||
                (player1Pos === 'right' && player2Pos === 'left')) {
                props = {
                    top: '50%',
                    width: 'calc(100% - 400px)',
                    height: '5px',
                    transform: 'translateY(-50%)',
                    left: '200px'
                };
            }

            return <CoalitionIndicator key={index} style={props as React.CSSProperties} />;
        });
    };

    const centerCards = gameState.players.map(player => {
        const centerCard = gameState.centerCards.find(cc => cc.playerId === player.userId);
        return {
            playerId: player.userId,
            playerName: player.username,
            card: centerCard?.card || null,
            revealed: centerCard?.revealed || false
        };
    });

    return (
        <GameContainer>
            <TopSection>
                <GameInfo>
                    <InfoItem>
                        <div className="label">Round</div>
                        <div className="value">{gameState.round}/{gameState.maxRounds}</div>
                    </InfoItem>

                    <InfoItem>
                        <div className="label">Phase</div>
                        <div className="value">{gameState.phase}</div>
                    </InfoItem>

                    <InfoItem>
                        <div className="label">Momentum</div>
                        <MomentumMeter>
                            {[1, 2, 3, 4, 5].map((level) => (
                                <MomentumLevel
                                    key={level}
                                    active={gameState.momentumLevel >= level}
                                    level={level}
                                />
                            ))}
                        </MomentumMeter>
                    </InfoItem>
                </GameInfo>

                <ActionButtons>
                    <Button
                        variant="outline"
                        onClick={() => {/* Handle button click */ }}
                    >
                        Rules
                    </Button>

                    <Button
                        variant="danger"
                        onClick={() => {/* Handle button click */ }}
                    >
                        Leave Game
                    </Button>

                    {canPlayCard() && (
                        <Button onClick={() => handleCardSelect(currentPlayer.hand[0].id)}>
                            Play Card
                        </Button>
                    )}

                    {canRevealCard() && (
                        <Button onClick={handleReveal}>
                            Reveal Card
                        </Button>
                    )}

                    {canRollDice() && (
                        <Button onClick={handleRollDice}>
                            Roll Dice
                        </Button>
                    )}
                </ActionButtons>
            </TopSection>

            <GameBoardSection>
                {/* Coalition lines */}
                {getCoalitionLines()}

                {/* Player positions */}
                {gameState.players.map((player) => (
                    <PlayerSlot key={player.userId} position={playerPositions[player.userId] || 'bottom'}>
                        <PlayerInfo isCurrentPlayer={gameState.activePlayerId === player.userId}>
                            <div className="name">
                                {player.username}
                                {player.userId === currentUserId && ' (You)'}
                            </div>
                            <div className="stats">
                                <div>Mandates: {player.mandates}</div>
                                <div>Cards: {player.hand.length}</div>
                            </div>
                        </PlayerInfo>

                        {player.userId === currentUserId && (
                            <PlayerHand>
                                {player.hand.map((card) => (
                                    <HandCard
                                        key={card.id}
                                        isSelectable={canPlayCard()}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        onClick={() => handleCardSelect(card.id)}
                                        whileHover={{ y: -15, scale: 1.05 }}
                                    >
                                        <GameCard
                                            card={card}
                                            isRevealed={true}
                                            isSelected={selectedCardId === card.id}
                                        />
                                    </HandCard>
                                ))}
                            </PlayerHand>
                        )}
                    </PlayerSlot>
                ))}

                {/* Center area */}
                <CenterArea>
                    <PlayedCardsArea>
                        {centerCards.map((centerCard) => (
                            <PlayedCardSlot
                                key={centerCard.playerId}
                                isActive={gameState.activePlayerId === centerCard.playerId}
                            >
                                {centerCard.card ? (
                                    <AnimatePresence>
                                        <motion.div
                                            initial={{ rotateY: 180, opacity: 0 }}
                                            animate={{ rotateY: centerCard.revealed ? 0 : 180, opacity: 1 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <GameCard
                                                card={centerCard.card}
                                                isRevealed={centerCard.revealed}
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                ) : (
                                    'Empty'
                                )}
                                <PlayerName>{centerCard.playerName}</PlayerName>
                            </PlayedCardSlot>
                        ))}
                    </PlayedCardsArea>

                    <DiceArea>
                        {gameState.phase === 'resolving' && (
                            <>
                                <Dice
                                    result={diceResult}
                                    animate={diceAnimating ? {
                                        rotate: [0, 90, 180, 270, 360],
                                        scale: [1, 1.2, 1]
                                    } : {}}
                                    transition={{ repeat: diceAnimating ? Infinity : 0, duration: 0.5 }}
                                >
                                    {diceResult || '?'}
                                </Dice>

                                {canRollDice() && (
                                    <Button
                                        variant="primary"
                                        onClick={handleRollDice}
                                        style={{ marginTop: '10px' }}
                                    >
                                        Roll Dice
                                    </Button>
                                )}
                            </>
                        )}
                    </DiceArea>
                </CenterArea>

                {/* Game log */}
                <LogSection>
                    <LogHeader>Game Log</LogHeader>
                    <LogContent>
                        {gameState.log.map((entry, index) => (
                            <LogEntry key={index} type={entry.type}>
                                {entry.text}
                            </LogEntry>
                        ))}
                    </LogContent>
                </LogSection>
            </GameBoardSection>
        </GameContainer>
    );
};

export default GameBoard;