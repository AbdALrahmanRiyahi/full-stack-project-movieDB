const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director', required: true },
  actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }], // Array of actors
  rating: { type: Number, min: 0, max: 10, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String }, // URL for the movie image
  country: { type: String }, // Country of the movie
  teaserUrl: { type: String }, // Teaser/trailer video URL

  // Link movie to user who created it
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });


module.exports = mongoose.model('Movie', MovieSchema);
