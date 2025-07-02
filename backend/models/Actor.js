const mongoose = require("mongoose");

const ActorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nationality: { type: String, required: true },
  birthDate: { type: Date, required: true },
  bio: { type: String, required: true },
  imageUrl: { type: String }, // URL for the actor image

  // Link actor to user who created it
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Actor', ActorSchema); 