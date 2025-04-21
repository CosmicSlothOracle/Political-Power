import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cardService } from '../services/api';

const initialState = {
    cards: [],
    filteredCards: [],
    currentCard: null,
    isLoading: false,
    error: null
};

// Async thunks
export const getAllCards = createAsyncThunk(
    'cards/getAllCards',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cardService.getAllCards();
            return response.cards;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cards');
        }
    }
);

export const getCardById = createAsyncThunk(
    'cards/getCardById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await cardService.getCardById(id);
            return response.card;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch card');
        }
    }
);

export const getCardsByType = createAsyncThunk(
    'cards/getCardsByType',
    async (type, { rejectWithValue }) => {
        try {
            const response = await cardService.getCardsByType(type);
            return { type, cards: response.cards };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cards by type');
        }
    }
);

export const seedCards = createAsyncThunk(
    'cards/seedCards',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cardService.seedCards();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to seed cards');
        }
    }
);

// Card slice
const cardSlice = createSlice({
    name: 'cards',
    initialState,
    reducers: {
        filterCardsByType: (state, action) => {
            const type = action.payload;
            state.filteredCards = type
                ? state.cards.filter(card => card.type === type)
                : [...state.cards];
        },
        clearCardFilters: (state) => {
            state.filteredCards = [...state.cards];
        },
        setCurrentCard: (state, action) => {
            state.currentCard = action.payload;
        },
        clearCurrentCard: (state) => {
            state.currentCard = null;
        },
        clearCardError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get all cards
            .addCase(getAllCards.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllCards.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cards = action.payload;
                state.filteredCards = action.payload;
            })
            .addCase(getAllCards.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get card by ID
            .addCase(getCardById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCardById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCard = action.payload;
            })
            .addCase(getCardById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get cards by type
            .addCase(getCardsByType.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCardsByType.fulfilled, (state, action) => {
                state.isLoading = false;
                state.filteredCards = action.payload.cards;
            })
            .addCase(getCardsByType.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Seed cards
            .addCase(seedCards.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(seedCards.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(seedCards.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const {
    filterCardsByType,
    clearCardFilters,
    setCurrentCard,
    clearCurrentCard,
    clearCardError
} = cardSlice.actions;

export default cardSlice.reducer;