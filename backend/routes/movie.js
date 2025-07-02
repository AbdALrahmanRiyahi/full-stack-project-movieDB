const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");

// Create Movie (Protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    // Attach userId from authenticated user (set by verifyToken middleware)
    const movieData = {
      ...req.body,
      userId: req.user.id
    };
    const movie = new Movie(movieData);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all movies created by the authenticated user OR by any admin
router.get("/", verifyToken, async (req, res) => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map(u => u._id);

    const movies = await Movie.find({
      $or: [
        { userId: req.user.id },
        { userId: { $in: adminIds } }
      ]
    })
      .populate("director", "name imageUrl nationality bio")
      .populate("actors", "name imageUrl nationality bio")
      .populate("userId", "role _id")
      .sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single movie by ID, only if it belongs to the authenticated user OR was created by an admin
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map(u => u._id);

    const movie = await Movie.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user.id },
        { userId: { $in: adminIds } }
      ]
    }).populate("director", "name imageUrl nationality bio").populate("actors", "name imageUrl nationality bio").populate("userId", "role _id");
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a movie by ID, only if it belongs to the authenticated user
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    ).populate("director", "name imageUrl nationality bio").populate("actors", "name imageUrl nationality bio");

    if (!movie) {
      return res.status(404).json({ message: "Movie not found or unauthorized" });
    }

    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a movie by ID, only if it belongs to the authenticated user
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found or unauthorized" });
    }
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
