import { setMyInterviews } from "@/redux/interviewSlice";
import { INTERVIEW_API_END_POINT } from "@/utils/constant";
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const useGetMyInterviews = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchMyInterviews = async () => {
            try {
                const res = await axios.get(`${INTERVIEW_API_END_POINT}/my`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setMyInterviews(res.data.interviews));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchMyInterviews();
    }, [])
};
export default useGetMyInterviews;
