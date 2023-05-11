const express = require("express");
const router = express.Router();
const User = require("./../models/User.model");
const Playlist = require("./../models/Playlist.model");
const uploader = require("../config/cloudinary.config");
const { isLoggedIn } = require("../middlewares/route-guard");

router.get("/create", isLoggedIn, (req, res, next) => {
  res.render("playlist/create-playlist");
});

router.post("/create", isLoggedIn, uploader.single("playlistImage"), (req, res, next) => {
  const data = { ...req.body };
  const { currentUser } = req.session;
  if (req.file) {
    data.playlistImage = req.file.path;
  }
  Playlist.create(data)
    .then(playlist => {
      console.log(playlist);
      return User.findByIdAndUpdate(currentUser._id, { $push: { playlists: playlist._id } }); // con este return indicamos al primer then que tiene que esperar a que se resuelva la promesa del user antes de continuar con el siguiente then
    })
    .then(() => {
      res.redirect("/profile");
    })
    .catch(error => console.error(error));
});

module.exports = router;
