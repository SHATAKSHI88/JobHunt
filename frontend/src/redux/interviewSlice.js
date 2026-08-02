import { createSlice } from "@reduxjs/toolkit";

const interviewSlice = createSlice({
    name: 'interview',
    initialState: {
        // application._id -> interview object, so ApplicantsTable/AppliedJobTable
        // can look up "does this application have an interview?" in O(1).
        byApplication: {},
        myInterviews: [],
    },
    reducers: {
        setInterviewForApplication: (state, action) => {
            const { applicationId, interview } = action.payload;
            state.byApplication[applicationId] = interview;
        },
        setMyInterviews: (state, action) => {
            state.myInterviews = action.payload;
        },
    },
});

export const { setInterviewForApplication, setMyInterviews } = interviewSlice.actions;
export default interviewSlice.reducer;
