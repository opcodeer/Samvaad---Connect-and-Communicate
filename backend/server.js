import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js"; // Import from socket.js

dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "https://samvaad-connect-and-communicate-client.vercel.app", // Allow frontend URL
    credentials: true, // Allow cookies
}));

// Handle CORS preflight requests
app.options("*", cors({
    origin: "https://samvaad-connect-and-communicate-client.vercel.app",
    credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, "frontend", "dist")));

app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

// Debugging middleware (optional)
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    console.log("Headers:", req.headers);
    next();
});

// Start server
server.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server Running on port ${PORT}`);
});
