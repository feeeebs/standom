import { createSlice } from '@reduxjs/toolkit'

export const albumSlice = createSlice({
    name: 'albums',
    initialState: {
        albumList: [],
    },
    reducers: {
        addAlbum: (state, action) => {
            state.albumList = action.payload; // Append new album to the end of the list
        },
    }
})

export const { addAlbum } = albumSlice.actions
export default albumSlice.reducer