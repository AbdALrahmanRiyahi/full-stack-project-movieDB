const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Enable CORS for frontend communication (more strict)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parser (express has built-in now)
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const directorRoutes = require("./routes/director");
const actorRoutes = require("./routes/actor");
const movieRoutes = require("./routes/movie");

// Use routes under /api path
app.use('/api/auth', authRoutes);
app.use('/api/directors', directorRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/movies', movieRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
