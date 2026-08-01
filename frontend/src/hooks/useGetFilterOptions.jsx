import { setFilterOptions } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

// Pulls real, DB-derived filter values (distinct locations, job types,
// and the current salary range) so FilterCard never shows a hardcoded
// option that doesn't actually exist in the data.
const useGetFilterOptions = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/filters`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setFilterOptions({
                        locations: res.data.locations,
                        jobTypes: res.data.jobTypes,
                        salaryRange: res.data.salaryRange,
                    }));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchFilterOptions();
    }, [])
}

export default useGetFilterOptions
