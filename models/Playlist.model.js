const { Schema, model } = require("mongoose");

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    playlistImage: {
      type: String,
      default: "https://yt3.googleusercontent.com/ytc/AGIKgqPmFbh4WiZlfw9spG8Dtoy8zY616IV9tAB7A9oGyg=s900-c-k-c0x00ffffff-no-rj"
    },
    description: String,
    tracks: [String]
  },

  {
    timestamps: true
  }
);

const Playlist = model("Playlist", playlistSchema);
module.exports = Playlist;
