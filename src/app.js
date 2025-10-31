// Express app configuration with global middlewares and route mounting

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Enable CORS for specified origins and credentials (cookies, auth headers)
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Parse incoming JSON and URL-encoded payloads with size limits
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files (e.g., images, PDFs) from the public directory
app.use(express.static("public"));

// Enable parsing and manipulation of cookies for request/response
app.use(cookieParser());

// Route imports
import userRouter from "./routes/user.routes.js";

// Mount user routes under versioned API namespace
app.use("/api/v1/users", userRouter);

export { app };
