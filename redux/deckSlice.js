import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deckService } from '../services/api';

const initialState = {
    decks: [],
    currentDeck: null,
    isLoading: false,
    error: null
};

// Async thunks
export const getUserDecks = createAsyncThunk(
    'decks/getUserDecks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await deckService.getUserDecks();
            return response.decks;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch decks');
        }
    }
);

export const getDeckById = createAsyncThunk(
    'decks/getDeckById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await deckService.getDeckById(id);
            return response.deck;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch deck');
        }
    }
);

export const createDeck = createAsyncThunk(
    'decks/createDeck',
    async (deckData, { rejectWithValue }) => {
        try {
            const response = await deckService.createDeck(deckData);
            return response.deck;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create deck');
        }
    }
);

export const updateDeck = createAsyncThunk(
    'decks/updateDeck',
    async ({ id, deckData }, { rejectWithValue }) => {
        try {
            const response = await deckService.updateDeck(id, deckData);
            return response.deck;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update deck');
        }
    }
);

export const deleteDeck = createAsyncThunk(
    'decks/deleteDeck',
    async (id, { rejectWithValue }) => {
        try {
            await deckService.deleteDeck(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete deck');
        }
    }
);

// Deck slice
const deckSlice = createSlice({
    name: 'decks',
    initialState,
    reducers: {
        clearCurrentDeck: (state) => {
            state.currentDeck = null;
        },
        clearDeckError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get user decks
            .addCase(getUserDecks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserDecks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.decks = action.payload;
            })
            .addCase(getUserDecks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get deck by ID
            .addCase(getDeckById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDeckById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentDeck = action.payload;
            })
            .addCase(getDeckById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create deck
            .addCase(createDeck.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDeck.fulfilled, (state, action) => {
                state.isLoading = false;
                state.decks.push(action.payload);
                state.currentDeck = action.payload;
            })
            .addCase(createDeck.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update deck
            .addCase(updateDeck.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDeck.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.decks.findIndex(deck => deck._id === action.payload._id);
                if (index !== -1) {
                    state.decks[index] = action.payload;
                }
                state.currentDeck = action.payload;
            })
            .addCase(updateDeck.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete deck
            .addCase(deleteDeck.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDeck.fulfilled, (state, action) => {
                state.isLoading = false;
                state.decks = state.decks.filter(deck => deck._id !== action.payload);
                if (state.currentDeck && state.currentDeck._id === action.payload) {
                    state.currentDeck = null;
                }
            })
            .addCase(deleteDeck.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearCurrentDeck, clearDeckError } = deckSlice.actions;
export default deckSlice.reducer;