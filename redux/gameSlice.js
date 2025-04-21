import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gameService } from '../services/api';

const initialState = {
    games: [],
    currentGame: null,
    hand: [],
    playedCard: null,
    gameLog: [],
    isLoading: false,
    error: null
};

// Async thunks
export const getUserGames = createAsyncThunk(
    'games/getUserGames',
    async (_, { rejectWithValue }) => {
        try {
            const response = await gameService.getUserGames();
            return response.games;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch games');
        }
    }
);

export const getGameById = createAsyncThunk(
    'games/getGameById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await gameService.getGameById(id);
            return response.game;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch game');
        }
    }
);

export const createGame = createAsyncThunk(
    'games/createGame',
    async (gameData, { rejectWithValue }) => {
        try {
            const response = await gameService.createGame(gameData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create game');
        }
    }
);

export const joinGame = createAsyncThunk(
    'games/joinGame',
    async (joinData, { rejectWithValue }) => {
        try {
            const response = await gameService.joinGame(joinData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to join game');
        }
    }
);

export const leaveGame = createAsyncThunk(
    'games/leaveGame',
    async (gameId, { rejectWithValue }) => {
        try {
            await gameService.leaveGame(gameId);
            return gameId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to leave game');
        }
    }
);

// Game slice
const gameSlice = createSlice({
    name: 'games',
    initialState,
    reducers: {
        // Socket-related actions
        setCurrentGame: (state, action) => {
            state.currentGame = action.payload;

            // Extract player's hand from the game state
            if (action.payload && action.payload.players) {
                const player = action.payload.players.find(
                    p => p.userId === JSON.parse(localStorage.getItem('user'))?.id
                );

                if (player) {
                    state.hand = player.hand || [];
                    state.playedCard = player.playedCard;
                }
            }
        },

        updateGameState: (state, action) => {
            if (state.currentGame) {
                state.currentGame = {
                    ...state.currentGame,
                    ...action.payload
                };
            }
        },

        updatePlayerState: (state, action) => {
            if (!state.currentGame) return;

            const userId = action.payload.userId;
            const playerIndex = state.currentGame.players.findIndex(
                p => p.userId === userId
            );

            if (playerIndex !== -1) {
                state.currentGame.players[playerIndex] = {
                    ...state.currentGame.players[playerIndex],
                    ...action.payload
                };
            }
        },

        setHand: (state, action) => {
            state.hand = action.payload;
        },

        setPlayedCard: (state, action) => {
            state.playedCard = action.payload;

            // Update player's played card in the game state
            if (state.currentGame) {
                const userId = JSON.parse(localStorage.getItem('user'))?.id;
                const playerIndex = state.currentGame.players.findIndex(
                    p => p.userId === userId
                );

                if (playerIndex !== -1) {
                    state.currentGame.players[playerIndex].playedCard = action.payload;
                }
            }
        },

        addLogEntry: (state, action) => {
            state.gameLog.push({
                text: action.payload,
                timestamp: new Date().toISOString()
            });
        },

        resetGameState: () => initialState,

        clearGameError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get user games
            .addCase(getUserGames.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserGames.fulfilled, (state, action) => {
                state.isLoading = false;
                state.games = action.payload;
            })
            .addCase(getUserGames.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get game by ID
            .addCase(getGameById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getGameById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentGame = action.payload;

                // Extract player's hand from the game state
                if (action.payload && action.payload.players) {
                    const player = action.payload.players.find(
                        p => p.userId === JSON.parse(localStorage.getItem('user'))?.id
                    );

                    if (player) {
                        state.hand = player.hand || [];
                        state.playedCard = player.playedCard;
                    }
                }
            })
            .addCase(getGameById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Create game
            .addCase(createGame.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createGame.fulfilled, (state, action) => {
                state.isLoading = false;
                state.games.push(action.payload.game);
            })
            .addCase(createGame.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Join game
            .addCase(joinGame.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(joinGame.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update game status in the games list
                const gameIndex = state.games.findIndex(
                    g => g.gameId === action.payload.game.gameId
                );

                if (gameIndex !== -1) {
                    state.games[gameIndex] = {
                        ...state.games[gameIndex],
                        ...action.payload.game
                    };
                } else {
                    state.games.push(action.payload.game);
                }
            })
            .addCase(joinGame.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Leave game
            .addCase(leaveGame.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(leaveGame.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.currentGame && state.currentGame.gameId === action.payload) {
                    state.currentGame = null;
                    state.hand = [];
                    state.playedCard = null;
                }
            })
            .addCase(leaveGame.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const {
    setCurrentGame,
    updateGameState,
    updatePlayerState,
    setHand,
    setPlayedCard,
    addLogEntry,
    resetGameState,
    clearGameError
} = gameSlice.actions;

export default gameSlice.reducer;