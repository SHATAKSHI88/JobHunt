import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name:"job",
    initialState:{
        allJobs:[],
        allAdminJobs:[],
        singleJob:null, 
        searchJobByText:"",
        allAppliedJobs:[],
        searchedQuery:"",
        isLoading:false,
        // real, DB-derived filter options (replaces the old hardcoded lists)
        filterOptions: {
            locations: [],
            jobTypes: [],
            salaryRange: { min: 0, max: 0 },
        },
        // the filters currently applied by the user
        filters: {
            location: "",
            jobType: "",
            minSalary: "",
            maxSalary: "",
        },
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalJobs: 0,
        },
    },
    reducers:{
        // actions
        setAllJobs:(state,action) => {
            state.allJobs = action.payload;
        },
        setIsLoading:(state,action) => {
            state.isLoading = action.payload;
        },
        setSingleJob:(state,action) => {
            state.singleJob = action.payload;
        },
        setAllAdminJobs:(state,action) => {
            state.allAdminJobs = action.payload;
        },
        setSearchJobByText:(state,action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs:(state,action) => {
            state.allAppliedJobs = action.payload;
        },
        setSearchedQuery:(state,action) => {
            state.searchedQuery = action.payload;
        },
        setFilterOptions:(state,action) => {
            state.filterOptions = action.payload;
        },
        setFilters:(state,action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters:(state) => {
            state.filters = { location: "", jobType: "", minSalary: "", maxSalary: "" };
        },
        setPagination:(state,action) => {
            state.pagination = action.payload;
        },
    }
});
export const {
    setAllJobs, 
    setSingleJob, 
    setAllAdminJobs,
    setSearchJobByText, 
    setAllAppliedJobs,
    setSearchedQuery,
    setIsLoading,
    setFilterOptions,
    setFilters,
    resetFilters,
    setPagination,
} = jobSlice.actions;
export default jobSlice.reducer;
