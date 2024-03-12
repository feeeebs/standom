import { createSlice } from '@reduxjs/toolkit'

export const lyricsSlice = createSlice({
    name: 'lyrics',
    initialState: {
        favoriteLyrics: [],
    },
    reducers: {
        addNewFavoriteLyrics: (state, action) => {
            state.favoriteLyrics = [...state.favoriteLyrics, ...action.payload];
        }
    }
});



export const { addNewFavoriteLyrics } = lyricsSlice.actions;
export default lyricsSlice.reducer;


