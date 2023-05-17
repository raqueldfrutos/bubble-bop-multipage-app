
const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/route-guard");



const SpotifyWebApi = require("spotify-web-api-node");
const { request } = require("../app");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch(error => console.error("Something went wrong when retrieving an access token", error));

 

  router.get("/", isLoggedIn, (req, res, next) => {
    spotifyApi
    .getPlaylist('37i9dQZF1DWU4xtX4v6Z9l')
    //.getFeaturedPlaylists({ limit : 10, offset: 1, country: 'ES', locale: 'sv_ES'})
    .then((data) =>{
      const tracks = data.body.tracks.items
      const trackslimit10 = tracks.slice (0, 10)
      console.log (tracks);
      //const playlists = data.body.playlists.items
      //console.log (playlists);      
      //res.render("trending",{playlists})
      res.render("trending",{tracks: trackslimit10})
    })
    .catch ((err) => {
      console.error("Something went wrong!", err);
    });
   
  });


  module.exports = router;
