const express = require("express");
const router = express.Router();
const Director = require("../models/Director");
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");

router.post("/", verifyToken, async (req, res) => {
  try {
    const directorData = {
      ...req.body,
      userId: req.user.id // per-user ownership
    };

    const director = new Director(directorData);
    await director.save();
    res.status(201).json(director);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all directors for authenticated user OR by any admin
router.get("/", verifyToken, async (req, res) => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map(u => u._id);

    const directors = await Director.find({
      $or: [
        { userId: req.user.id },
        { userId: { $in: adminIds } }
      ]
    })
      .populate("userId", "role _id")
      .sort({ createdAt: -1 });
    res.json(directors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single director by _id for authenticated user OR by any admin
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map(u => u._id);

    const director = await Director.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user.id },
        { userId: { $in: adminIds } }
      ]
    }).populate("userId", "role _id");
    if (!director) {
      return res.status(404).json({ message: "Director not found" });
    }
    res.json(director);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update director by _id for authenticated user
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const director = await Director.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!director) {
      return res.status(404).json({ message: "Director not found or unauthorized" });
    }
    res.json(director);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete director by _id for authenticated user
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const director = await Director.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!director) {
      return res.status(404).json({ message: "Director not found or unauthorized" });
    }
    res.json({ message: "Director deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
