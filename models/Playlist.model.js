const { Schema, model } = require("mongoose");

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    playlistImage: {
      type: String,
      default:
        "/images/default-playlist-image.png"
    },
    description: String,
    tracks: [Object]
  },

  {
    timestamps: true
  }
);

const Playlist = model("Playlist", playlistSchema);
module.exports = Playlist;
