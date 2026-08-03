import { createSlice } from "@reduxjs/toolkit";

const MAX_COMPARE = 3;

const compareSlice = createSlice({
    name: "compare",
    initialState: {
        // small trimmed job snapshots, not full objects — this only needs
        // to survive within the current session/tab, not persist
        items: [],
    },
    reducers: {
        toggleCompare: (state, action) => {
            const job = action.payload;
            const exists = state.items.some((j) => j._id === job._id);
            if (exists) {
                state.items = state.items.filter((j) => j._id !== job._id);
            } else if (state.items.length < MAX_COMPARE) {
                state.items.push(job);
            }
        },
        removeFromCompare: (state, action) => {
            state.items = state.items.filter((j) => j._id !== action.payload);
        },
        clearCompare: (state) => {
            state.items = [];
        },
    },
});

export const { toggleCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export const MAX_COMPARE_ITEMS = MAX_COMPARE;
export default compareSlice.reducer;
