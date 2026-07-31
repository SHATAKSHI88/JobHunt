// Small helper so controllers can do:
//   throw new ApiError(404, "Job not found");
// and asyncHandler will turn it into the right JSON response.
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

export default ApiError;
