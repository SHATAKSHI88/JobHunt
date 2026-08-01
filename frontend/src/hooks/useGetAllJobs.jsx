import { setAllJobs, setIsLoading, setPagination } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Fetches jobs from the server using the current search keyword, the
// active filters (location / jobType / salary range), and pagination.
// Re-runs whenever any of those change so filtering happens server-side
// instead of the old client-side Array.filter approach.
const useGetAllJobs = (page = 1, limit = 12) => {
    const dispatch = useDispatch();
    const { searchedQuery, filters } = useSelector(store => store.job);
    const { location, jobType, minSalary, maxSalary } = filters;

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                dispatch(setIsLoading(true));
                const params = new URLSearchParams();
                if (searchedQuery) params.set("keyword", searchedQuery);
                if (location) params.set("location", location);
                if (jobType) params.set("jobType", jobType);
                if (minSalary) params.set("minSalary", minSalary);
                if (maxSalary) params.set("maxSalary", maxSalary);
                params.set("page", page);
                params.set("limit", limit);

                const res = await axios.get(`${JOB_API_END_POINT}/get?${params.toString()}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                    dispatch(setPagination({
                        currentPage: res.data.currentPage,
                        totalPages: res.data.totalPages,
                        totalJobs: res.data.totalJobs,
                    }));
                }
            } catch (error) {
                console.log(error);
            } finally {
                dispatch(setIsLoading(false));
            }
        }
        fetchAllJobs();
    }, [searchedQuery, location, jobType, minSalary, maxSalary, page, limit])
}

export default useGetAllJobs
