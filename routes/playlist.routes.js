const express = require("express");
const router = express.Router();
const User = require("./../models/User.model");
const Playlist = require("./../models/Playlist.model");
const uploader = require("../config/cloudinary.config");
const { isLoggedIn } = require("../middlewares/route-guard");





router.post("/create", isLoggedIn, uploader.single("playlistImage"), (req, res, next) => {
  const data = { ...req.body };
  const { currentUser } = req.session;
  if (req.file) {
    data.playlistImage = req.file.path;
  }
  Playlist.create(data)
    .then(playlist => {
      return User.findByIdAndUpdate(currentUser._id, { $push: { playlists: playlist._id } }); // con este return indicamos al primer then que tiene que esperar a que se resuelva la promesa del user antes de continuar con el siguiente then
    })
    .then(() => {
      res.redirect("/profile");
    })
    .catch(error => console.error(error));
});

router.get("/:id", isLoggedIn, (req, res, next) => {
  const { id } = req.params;
  const { currentUser } = req.session;

  User.findById(currentUser._id).then(user => {
    return Playlist.findById(id)
    .then(playlistDetails => {
      res.render("playlist/playlist-details", { playlistDetails, user });
    });
  });
});

router.post(":id/delete-track", isLoggedIn, (req, res, next) => {
const { id } = req.params;
const { track } = req.body
Playlist.findByIdAndUpdate(id, { $pull: { tracks: track }})
.then(() => {
res.redirect(`/playlist/${_id}`)
})
})



module.exports = router;
