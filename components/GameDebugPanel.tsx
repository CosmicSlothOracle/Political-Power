'use client'

import React, { useState } from 'react';
import styled from 'styled-components';
import { GameState, GamePhase, GameStatus } from '../types/gameTypes';
import { processPhase } from '../game/GameEngine';
import { DeckManager } from '../game/DeckManager';

interface GameDebugPanelProps {
    gameState: GameState | null;
    gamePhase?: GamePhase;
    gameStatus?: GameStatus;
    userId?: string;
    className?: string;
    onProcessPhase?: (phase: GamePhase) => void;
    onEndTurn?: () => void;
    onDrawCard?: () => void;
}

const DebugContainer = styled.div`
    background-color: #1a202c;
    color: #a0aec0;
    border-radius: 8px;
    padding: 1.5rem;
    font-family: monospace;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 2rem;
`;

const DebugHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    border-bottom: 1px solid #2d3748;
    padding-bottom: 0.5rem;
`;

const DebugTitle = styled.h3`
    font-size: 1.25rem;
    color: #e2e8f0;
    margin: 0;
`;

const ToggleButton = styled.button`
    background-color: #2d3748;
    color: #e2e8f0;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    font-family: monospace;

    &:hover {
        background-color: #4a5568;
    }
`;

const DebugContent = styled.div`
    max-height: 500px;
    overflow-y: auto;
    font-size: 0.875rem;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
`;

const InfoItem = styled.div`
    padding: 0.5rem;
    background-color: #2d3748;
    border-radius: 4px;
`;

const PropertyName = styled.span`
    color: #63b3ed;
`;

const PropertyValue = styled.span<{ type?: string; highlight?: boolean }>`
    color: ${ props => {
        if (props.highlight) return '#fc8181';
        switch (props.type) {
            case 'string': return '#68d391';
            case 'number': return '#f6ad55';
            case 'boolean': return '#fc8181';
            case 'object': return '#d6bcfa';
            default: return '#cbd5e0';
        }
    } };
    font-weight: ${ props => props.highlight ? 'bold' : 'normal' };
`;

const ButtonsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
    border-top: 1px solid #2d3748;
    padding-top: 1rem;
`;

const DebugButton = styled.button<{ primary?: boolean; phase?: string; current?: boolean }>`
    background-color: ${ props => {
        if (props.current) return '#4c1d95';
        if (props.primary) return '#2b6cb0';

        // Phase-specific colors
        switch (props.phase) {
            case 'setup': return '#2c7a7b';
            case 'play': return '#2f855a';
            case 'effect': return '#9f580a';
            case 'resolution': return '#9b2c2c';
            case 'final': return '#702459';
            case 'finished': return '#1a202c';
            default: return '#4a5568';
        }
    } };
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    cursor: pointer;
    font-weight: ${ props => props.current ? 'bold' : 'normal' };

    &:hover {
        filter: brightness(1.2);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const LogContainer = styled.div`
    margin-top: 1rem;
    background-color: #2d3748;
    border-radius: 4px;
    padding: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
`;

const LogEntry = styled.div`
    padding: 0.25rem 0;
    border-bottom: 1px solid #4a5568;
    font-size: 0.75rem;

    &:last-child {
        border-bottom: none;
    }
`;

const formatValue = (value: any): JSX.Element => {
    const type = typeof value;

    if (value === null) {
        return <PropertyValue type="object">null</PropertyValue>;
    }

    if (value === undefined) {
        return <PropertyValue>undefined</PropertyValue>;
    }

    if (type === 'string') {
        return <PropertyValue type="string">"{value}"</PropertyValue>;
    }

    if (type === 'number' || type === 'boolean') {
        return <PropertyValue type={type}>{String(value)}</PropertyValue>;
    }

    if (Array.isArray(value)) {
        return (
            <span>
                <PropertyValue type="object">[</PropertyValue>
                {value.length > 0 ? ' ... ' : ''}
                <PropertyValue type="object">]</PropertyValue>
                <span style={{ color: '#718096' }}> {`(${ value.length } items)`}</span>
            </span>
        );
    }

    if (type === 'object') {
        return (
            <span>
                <PropertyValue type="object">{'{'}</PropertyValue>
                {' ... '}
                <PropertyValue type="object">{'}'}</PropertyValue>
            </span>
        );
    }

    return <PropertyValue>{String(value)}</PropertyValue>;
};

// Helper to format timestamps
const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${ date.toLocaleTimeString() }`;
};

// Local implementation of addLogEntry
const addLogEntry = (state: GameState, message: string, type: 'info' | 'action' | 'system' | 'error' | 'game' = 'info'): GameState => {
    return {
        ...state,
        log: [
            ...state.log,
            {
                timestamp: Date.now(),
                message,
                type
            }
        ]
    };
};

const GameDebugPanel: React.FC<GameDebugPanelProps> = ({
    gameState,
    gamePhase,
    gameStatus,
    userId,
    className,
    onProcessPhase,
    onEndTurn,
    onDrawCard
}) => {
    const [expanded, setExpanded] = useState(false);

    // Return early if gameState is null
    if (!gameState) {
        return (
            <DebugContainer className={className}>
                <DebugHeader>
                    <DebugTitle>Game Debug Panel</DebugTitle>
                    <ToggleButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? 'Collapse' : 'Expand'}
                    </ToggleButton>
                </DebugHeader>
                <div>Waiting for game state...</div>
            </DebugContainer>
        );
    }

    // Safely access properties with fallbacks
    const currentPhase = gamePhase || gameState.phase || 'setup';
    const currentStatus = gameStatus || gameState.status || 'lobby';
    const players = gameState.players || [];
    const activePlayerId = gameState.activePlayerId || '';
    const logs = gameState.log || [];

    // Determine if the user is the active player
    const isActivePlayer = userId && activePlayerId === userId;

    // Get the active player's name
    const activePlayer = players.find(p => p.id === activePlayerId);
    const activePlayerName = activePlayer ? activePlayer.name : 'None';

    // Helper function to add a log entry
    const handleProcessPhase = (phase: GamePhase) => {
        if (onProcessPhase) {
            onProcessPhase(phase);
        } else if (gameState) {
            // Use the imported processPhase function directly
            const updatedState = processPhase(gameState, phase);
            console.log(`Processed phase ${ phase }`, updatedState);
            // You would typically update state here, but we can't in this component directly
        }
    };

    const handleDrawCard = () => {
        if (onDrawCard) {
            onDrawCard();
        } else if (gameState && isActivePlayer) {
            try {
                // Use DeckManager instead of drawCardsFromDeck function
                const result = DeckManager.drawCards(gameState.deck, 1);
                console.log('Drew card(s):', result.drawnCardIds);

                // Create an updated state with the drawn card - just for logging
                const updatedGameState = {
                    ...gameState,
                    deck: result.updatedDeck
                };

                // Add a log entry
                const stateWithLog = addLogEntry(
                    updatedGameState,
                    `${ activePlayerName } draws a card`,
                    'game'
                );

                console.log('Updated state after draw:', stateWithLog);
                // You would typically update state here, but we can't in this component directly
            } catch (error) {
                console.error('Error drawing card:', error);
            }
        }
    };

    const handleEndTurn = () => {
        if (onEndTurn) {
            onEndTurn();
        } else if (gameState && isActivePlayer) {
            // Process effect phase, then resolution phase
            let updatedState = processPhase(gameState, 'effect');
            updatedState = processPhase(updatedState, 'resolution');

            // Add a log entry
            updatedState = addLogEntry(
                updatedState,
                `${ activePlayerName } ends their turn`,
                'game'
            );

            console.log('Ended turn, processed effect and resolution phases', updatedState);
            // You would typically update state here, but we can't in this component directly
        }
    };

    return (
        <DebugContainer className={className}>
            <DebugHeader>
                <DebugTitle>Game Debug Panel</DebugTitle>
                <ToggleButton onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Collapse' : 'Expand'}
                </ToggleButton>
            </DebugHeader>

            <InfoGrid>
                <InfoItem>
                    <PropertyName>Game ID:</PropertyName> {formatValue(gameState.gameId)}
                </InfoItem>
                <InfoItem>
                    <PropertyName>Status:</PropertyName>
                    <PropertyValue type="string" highlight={currentStatus === 'active'}>
                        {currentStatus.toUpperCase()}
                    </PropertyValue>
                </InfoItem>
                <InfoItem>
                    <PropertyName>Phase:</PropertyName>
                    <PropertyValue type="string" highlight={true}>
                        {currentPhase.toUpperCase()}
                    </PropertyValue>
                </InfoItem>
                <InfoItem>
                    <PropertyName>Round:</PropertyName> {formatValue(gameState.round)} / {formatValue(gameState.maxRounds)}
                </InfoItem>
                <InfoItem>
                    <PropertyName>Active Player:</PropertyName> {formatValue(activePlayerName)}
                    {isActivePlayer && <span style={{ color: '#FC8181' }}> (YOU)</span>}
                </InfoItem>
                <InfoItem>
                    <PropertyName>Players:</PropertyName> {formatValue(gameState.players.length)} total
                </InfoItem>
            </InfoGrid>

            {/* Phase control buttons */}
            <ButtonsContainer>
                <DebugButton phase="setup" current={currentPhase === 'setup'} onClick={() => handleProcessPhase('setup')}>
                    Process Setup Phase
                </DebugButton>
                <DebugButton phase="play" current={currentPhase === 'play'} onClick={() => handleProcessPhase('play')}>
                    Process Play Phase
                </DebugButton>
                <DebugButton phase="effect" current={currentPhase === 'effect'} onClick={() => handleProcessPhase('effect')}>
                    Process Effect Phase
                </DebugButton>
                <DebugButton phase="resolution" current={currentPhase === 'resolution'} onClick={() => handleProcessPhase('resolution')}>
                    Process Resolution Phase
                </DebugButton>
                <DebugButton phase="final" current={currentPhase === 'final'} onClick={() => handleProcessPhase('final')}>
                    Process Final Phase
                </DebugButton>
            </ButtonsContainer>

            {/* Player action buttons */}
            <ButtonsContainer>
                <DebugButton primary onClick={handleDrawCard} disabled={!isActivePlayer}>
                    Draw Card
                </DebugButton>
                <DebugButton primary onClick={handleEndTurn} disabled={!isActivePlayer}>
                    End Turn
                </DebugButton>
            </ButtonsContainer>

            {/* Game log (most recent entries) */}
            {logs.length > 0 && (
                <>
                    <DebugTitle>Recent Game Log</DebugTitle>
                    <LogContainer>
                        {logs.slice(-5).map((entry, index) => (
                            <LogEntry key={index}>
                                <span style={{ color: '#63b3ed' }}>[{formatTimestamp(entry.timestamp)}]</span> {entry.message}
                            </LogEntry>
                        ))}
                    </LogContainer>
                </>
            )}

            {expanded && (
                <DebugContent>
                    <DebugTitle style={{ marginTop: '1rem' }}>Full Game State</DebugTitle>
                    <pre style={{ margin: 0 }}>
                        {JSON.stringify(gameState, null, 2)}
                    </pre>

                    {logs.length > 0 && (
                        <>
                            <DebugTitle style={{ marginTop: '1rem' }}>Complete Game Log</DebugTitle>
                            {logs.map((entry, index) => (
                                <LogEntry key={index}>
                                    <div>
                                        <PropertyName>timestamp:</PropertyName> {formatTimestamp(entry.timestamp)}
                                    </div>
                                    <div>
                                        <PropertyName>message:</PropertyName> {entry.message}
                                    </div>
                                    <div>
                                        <PropertyName>type:</PropertyName> {entry.type}
                                    </div>
                                </LogEntry>
                            ))}
                        </>
                    )}
                </DebugContent>
            )}
        </DebugContainer>
    );
};

export default GameDebugPanel;