const express = require("express");
const router = express.Router();
const Playlist = require("./../models/Playlist.model");
const { isLoggedIn } = require("../middlewares/route-guard");

router.get("/create", isLoggedIn, (req, res, next) => {
    res.render("playlist/create-playlist")
})

router.post("/create", isLoggedIn, (req, res, next) => {
    const { body } = req;
    Playlist.create(body)
    .then(() =>{
        res.redirect("/profile")
    })
})



module.exports = router;
