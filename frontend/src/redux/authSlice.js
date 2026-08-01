import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null
    },
    reducers:{
        // actions
        setLoading:(state, action) => {
            state.loading = action.payload;
        },
        setUser:(state, action) => {
            state.user = action.payload;
        },
        // keeps the navbar/job-card bookmark state in sync immediately,
        // without needing to refetch the whole user after every toggle
        setSavedJobIds:(state, action) => {
            if (state.user) {
                state.user.savedJobs = action.payload;
            }
        }
    }
});
export const {setLoading, setUser, setSavedJobIds} = authSlice.actions;
export default authSlice.reducer;