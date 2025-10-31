import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Establish connection to MongoDB using Mongoose
const connectDB = async () => {
    try {
        // Attempt to connect using the environment URI and database name
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        // Log successful connection with the host name
        console.log(`\nMongoDB connected successfully | HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        // Log the error and terminate the process on failure
        console.error("MongoDB connection failed:", error);
        throw error; // Propagate error for higher-level handling if needed
        process.exit(1); // Exit process with failure code
    }
};

// Export asynchronous database connection function
export default connectDB;
