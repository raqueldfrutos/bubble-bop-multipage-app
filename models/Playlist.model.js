const { Schema, model } = require("mongoose");

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    playlistImage: String,
    description: String,
    tracks: [String]
  },

  {
    timestamps: true
  }
);

const Playlist = model("Playlist", playlistSchema);
module.exports = Playlist;
