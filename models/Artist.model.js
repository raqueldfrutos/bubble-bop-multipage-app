const { Schema, model } = require("mongoose");

const artistSchema = new Schema(
  {
    image: String,
    name: {
      type: String,
      required: true
    }
  },

  {
    timestamps: true
  }
);

const Artist = model("Artist", artistSchema);
module.exports = Artist;
