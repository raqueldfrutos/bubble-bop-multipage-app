const { Schema, model } = require("mongoose");

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    tracks: {
      type: [String]
    }
  },

  {
    timestamps: true
  }
);

const Playlist = model ("Playlist", playlistSchema);
module.exports = Playlist;
