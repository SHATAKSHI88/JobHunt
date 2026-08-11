import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        const token = headerToken || req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({ message: "Invalid token", success: false });
        }

        req.id = decode.userId;
        req.role = decode.role;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token", success: false });
    }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.role)) {
        return res.status(403).json({ message: "You are not authorized to perform this action.", success: false });
    }
    next();
};

export default isAuthenticated;