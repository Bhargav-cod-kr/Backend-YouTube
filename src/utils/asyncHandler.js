// Utility wrapper for handling async route handlers and forwarding errors cleanly
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err)); // Forward any async error to Express error middleware
    };
};

export { asyncHandler };
