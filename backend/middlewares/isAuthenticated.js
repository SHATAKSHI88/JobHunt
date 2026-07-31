import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false,
            });
        }

        req.id = decode.userId;
        req.role = decode.role;
        next();
    } catch (error) {
        // jwt.verify throws for expired/invalid tokens instead of
        // rejecting silently, so this always needs to respond.
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
        });
    }
};

// Optional companion middleware: restricts a route to specific roles.
// Usage: router.post('/post', isAuthenticated, authorizeRoles('recruiter'), postJob)
export const authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.role)) {
        return res.status(403).json({
            message: "You are not authorized to perform this action.",
            success: false,
        });
    }
    next();
};

export default isAuthenticated;
