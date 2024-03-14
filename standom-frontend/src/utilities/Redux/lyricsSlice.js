import { createSlice } from '@reduxjs/toolkit'

export const lyricsSlice = createSlice({
    name: 'lyrics',
    initialState: {
        favoriteLyrics: [],
        fetched: false,
    },
    reducers: {
        addNewFavoriteLyrics: (state, action) => {
            state.favoriteLyrics = [...state.favoriteLyrics, ...action.payload];
        },
        updateLyricsFetched: (state) => {
            state.fetched = true
        }
    }
});



export const { addNewFavoriteLyrics, updateLyricsFetched } = lyricsSlice.actions;
export default lyricsSlice.reducer;


