// Wraps an async controller so any thrown/rejected error is caught
// and sent back as a proper JSON error response instead of being
// swallowed by console.log (which left the client hanging before).
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error(error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong on the server.",
            success: false,
        });
    });
};

export default asyncHandler;
