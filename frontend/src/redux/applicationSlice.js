import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name:'application',
    initialState:{
        applicants:null,
    },
    reducers:{
        setAllApplicants:(state,action) => {
            state.applicants = action.payload;
        },
        // used by the Kanban board so a drag-and-drop status change reflects
        // immediately, without waiting on a full refetch
        updateApplicationStatus:(state,action) => {
            const { applicationId, status } = action.payload;
            const application = state.applicants?.applications?.find((a) => a._id === applicationId);
            if (application) {
                application.status = status;
            }
        }
    }
});
export const {setAllApplicants, updateApplicationStatus} = applicationSlice.actions;
export default applicationSlice.reducer;