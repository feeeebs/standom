import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        userInfo: {
            id: null,
            email: "",
            name: "",
        },
        albumJourney: {}
    },
    reducers: {
        updateId: (state, action) => {
            state.userInfo.id = action.payload;
        },
        updateEmail: (state, action) => {
            state.userInfo.email = action.payload;
        },
        updateName: (state, action) => {
            state.userInfo.name = action.payload;
        },
        updateAll: (state, action) => {
            state.userInfo = { ...state.userInfo, ...action.payload };
        },
    }
})

export const { updateAll, updateId, updateEmail, updateName } = userSlice.actions
export default userSlice.reducer