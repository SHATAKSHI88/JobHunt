import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setSavedJobIds } from '@/redux/authSlice'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

// Shared save/unsave logic used by both the Jobs grid and the Latest Jobs
// cards, so the bookmark icon and "Save for later" button always agree
// with each other and with the server.
const useSaveJob = (jobId) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [pending, setPending] = useState(false);

    const isSaved = !!user?.savedJobs?.some((id) => id === jobId || id?._id === jobId);

    const toggleSave = async (e) => {
        e?.stopPropagation();
        e?.preventDefault();

        if (!user) {
            toast.info("Log in to save jobs.");
            navigate("/login");
            return;
        }

        try {
            setPending(true);
            const res = await axios.post(`${USER_API_END_POINT}/save-job/${jobId}`, {}, { withCredentials: true });
            if (res.data.success) {
                dispatch(setSavedJobIds(res.data.savedJobs));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't update saved jobs.");
        } finally {
            setPending(false);
        }
    }

    return { isSaved, toggleSave, pending };
}

export default useSaveJob
