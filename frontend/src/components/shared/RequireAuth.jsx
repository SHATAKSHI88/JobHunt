import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

// Guards pages that require *any* logged-in user (student or recruiter),
// unlike ProtectedRoute which additionally requires the recruiter role.
// Used for pages like Profile and Saved Jobs that were previously
// reachable while logged out and just silently failing their API calls.
const RequireAuth = ({ children }) => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            toast.info("Please log in to continue.");
            navigate("/login", { state: { from: location.pathname } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (!user) return null;

    return <>{children}</>;
};

export default RequireAuth;
