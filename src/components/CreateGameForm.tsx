'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import { SimpleButton } from './SimpleButton'
import LoadingSpinner from './LoadingSpinner'
import toast from './ToastProvider'
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/gameTypes'
import { GameSettingsPanel } from './GameSettingsPanel'
import { useGameController } from '../hooks/useGameController'
import { validateTestUser } from '../util/testHelpers'

const FormContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
`

const FormTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
`

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    border-color: #4a69bd;
    outline: none;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 5px;
`

const Divider = styled.div`
  border-top: 1px solid #eee;
  margin: 25px 0;
`

interface CreateGameFormProps {
    onCancel: () => void;
}

const CreateGameForm: React.FC<CreateGameFormProps> = ({ onCancel }) => {
    const router = useRouter();
    const [gameName, setGameName] = useState('');
    const [playerName, setPlayerName] = useState('Player 1'); // Default player name
    const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
    const [formError, setFormError] = useState<string | null>(null);
    const [isGameCreated, setIsGameCreated] = useState(false);
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get a persistent user ID for testing
    useEffect(() => {
        const id = validateTestUser();
        setUserId(id);
        console.log("CreateGameForm using user ID:", id);
    }, []);

    // Use the game controller hook
    const {
        createGame,
        gameState,
        isLoading: controllerLoading,
        error: controllerError,
        updateSettings
    } = useGameController(userId);

    // Update controller settings when local settings change
    useEffect(() => {
        if (userId) {
            updateSettings(gameSettings);
        }
    }, [gameSettings, updateSettings, userId]);

    // If game is created successfully, track it
    useEffect(() => {
        if (gameState && !isGameCreated) {
            setIsGameCreated(true);
            toast.success(`Game created with ID: ${ gameState.gameId }`);

            // Debug log
            console.log("Game created successfully:", gameState);
        }
    }, [gameState, isGameCreated]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset any previous errors
        setFormError(null);

        if (!gameName.trim()) {
            setFormError('Game name is required');
            return;
        }

        if (!playerName.trim()) {
            setFormError('Player name is required');
            return;
        }

        if (!userId) {
            setFormError('User ID not initialized. Please refresh the page.');
            return;
        }

        try {
            console.log('Creating game with settings:', {
                gameName,
                playerName,
                gameSettings,
                userId
            });

            // Set loading state
            setIsLoading(true);

            // Create the game using the controller
            const newGameState = await createGame(gameName, playerName, gameSettings);

            if (newGameState) {
                toast.success('Game created successfully!');
                console.log('Game created:', newGameState);

                // Save game ID to localStorage for debugging
                if (typeof window !== 'undefined') {
                    localStorage.setItem('lastCreatedGameId', newGameState.gameId || '');
                }

                // Ensure we have a valid game ID
                const gameId = newGameState.gameId || `game${ Date.now() }-${ Math.floor(Math.random() * 1000) }`;

                // Route to the new game
                router.push(`/game/${ gameId }`);
            } else {
                // Handle case where no game state is returned
                setFormError('Failed to create game. Server did not return a valid game state.');
            }
        } catch (err: any) {
            console.error('Failed to create game:', err);

            // Display a more helpful error message
            const errorMessage = err?.message || 'Failed to create game. Please try again.';
            setFormError(`Error: ${ errorMessage }`);

            // If in development mode, generate a mock game anyway
            if (process.env.NODE_ENV === 'development') {
                console.warn('Creating mock game despite error');
                const mockGameId = `game${ Date.now() }-${ Math.floor(Math.random() * 1000) }`;

                // Save mock game ID to localStorage for debugging
                if (typeof window !== 'undefined') {
                    localStorage.setItem('lastCreatedGameId', mockGameId);
                }

                router.push(`/game/${ mockGameId }`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (controllerLoading && !gameState) {
        return <LoadingSpinner />;
    }

    return (
        <FormContainer>
            <FormTitle>Create New Game</FormTitle>

            <form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="gameName">Game Name</Label>
                    <Input
                        id="gameName"
                        type="text"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        placeholder="Enter a name for your game"
                        disabled={isLoading}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="playerName">Your Name</Label>
                    <Input
                        id="playerName"
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your player name"
                        disabled={isLoading}
                    />
                </FormGroup>

                <Divider />

                <GameSettingsPanel
                    initialSettings={gameSettings}
                    onSettingsChange={setGameSettings}
                    readOnly={isLoading}
                />

                {(formError || controllerError) &&
                    <ErrorMessage>{formError || controllerError}</ErrorMessage>
                }

                <ButtonGroup>
                    <SimpleButton
                        type="button"
                        color="secondary"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </SimpleButton>
                    <SimpleButton
                        type="submit"
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create Game'}
                    </SimpleButton>
                </ButtonGroup>
            </form>
        </FormContainer>
    );
};

export default CreateGameForm;