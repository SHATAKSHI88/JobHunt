import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({children}) => {
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();

    useEffect(()=>{
        if (user === null) {
            toast.info("Please log in as a recruiter to continue.");
            navigate("/login");
        } else if (user.role !== 'recruiter') {
            toast.error("This page is only available to recruiters.");
            navigate("/");
        }
    },[]);

    if (!user || user.role !== 'recruiter') return null;

    return (
        <>
        {children}
        </>
    )
};
export default ProtectedRoute;
