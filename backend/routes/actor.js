const express = require("express");
const router = express.Router();
const Actor = require("../models/Actor");
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");

router.post("/", verifyToken, async (req, res) => {
  try {
    const actorData = {
      ...req.body,
      userId: req.user.id // per-user ownership
    };

    const actor = new Actor(actorData);
    await actor.save();
    res.status(201).json(actor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all actors for authenticated user OR by any admin
router.get("/", verifyToken, async (req, res) => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map(u => u._id);

    const actors = await Actor.find({
      $or: [
        { userId: req.user.id },
        { userId: { $in: adminIds } }
      ]
    })
      .populate("userId", "role _id")
      .sort({ createdAt: -1 });
    res.json(actors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single actor by _id for authenticated user OR by any admin
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminIds = adminUsers.map(u => u._id);

    const actor = await Actor.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user.id },
        { userId: { $in: adminIds } }
      ]
    }).populate("userId", "role _id");
    if (!actor) {
      return res.status(404).json({ message: "Actor not found" });
    }
    res.json(actor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update actor by _id for authenticated user
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const actor = await Actor.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!actor) {
      return res.status(404).json({ message: "Actor not found or unauthorized" });
    }
    res.json(actor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete actor by _id for authenticated user
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const actor = await Actor.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!actor) {
      return res.status(404).json({ message: "Actor not found or unauthorized" });
    }
    res.json({ message: "Actor deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 