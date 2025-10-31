import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Middleware to verify if a valid JWT is present for authentication
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Retrieve access token from cookies or Authorization header
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        // If no token is found, deny access
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify token and decode payload using secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetch the associated user and exclude sensitive fields
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        // If no valid user found, deny access
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Attach authenticated user object to the request
        req.user = user;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        // Handle invalid or expired token cases
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
