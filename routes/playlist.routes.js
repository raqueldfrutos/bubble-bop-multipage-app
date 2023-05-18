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
      const updateUser = User.findByIdAndUpdate(currentUser._id, { $push: { playlists: playlist._id } }); // con este return indicamos al primer then que tiene que esperar a que se resuelva la promesa del user antes de continuar con el siguiente then
      const addSongToPlaylist = Playlist.findByIdAndUpdate(playlist._id, {
        $push: { tracks: { name: data.trackName, preview_url: data.trackUrl } }
      });

      return Promise.all([updateUser, addSongToPlaylist]);
    })
    .then(() => {
      if (!data.search) {
        res.redirect("/profile");
      } else {
        res.redirect(`/search/artists?search=${data.search}`);
      }
    })
    .catch(error => console.error(error));
});

router.get("/:id", isLoggedIn, (req, res, next) => {
  const { id } = req.params;
  const { currentUser } = req.session;

  User.findById(currentUser._id).then(user => {
    return Playlist.findById(id).then(playlistDetails => {
      res.render("playlist/playlist-details", { playlistDetails, user });
    });
  });
});

router.post("/:id/delete-track", isLoggedIn, (req, res, next) => {
  const { id } = req.params;
  const { track } = req.body;
  console.log("TRACK", track);
  Playlist.findByIdAndUpdate(id, { $pull: { tracks: { name: { $in: [track] } } } }, { new: true }).then(() => {
    res.redirect(`/playlist/${id}`);
  });
});

router.post("/:id/delete", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  await Playlist.findByIdAndRemove( id );
  res.redirect("/profile");
});



module.exports = router;
