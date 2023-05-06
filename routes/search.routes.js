const express = require("express");
const router = express.Router();

//SPOTIFY API

const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch(error => console.log("Something went wrong when retrieving an access token", error));

router.get("/artists", (req, res, next) => {
  const { search } = req.query;
  spotifyApi
    .searchArtists(search)
    .then(data => {
     // console.log("The received data from the API", data.body);
      const artistsResults = data.body.artists.items;
      res.render("artists-results", { artistsResults });
    })
    .catch(err => console.log("The error while searching artists occurred: ", err));
});

router.get('/albums/:artistId', (req, res) => {
  const { artistId } = req.params
//console.log(artistId);
  spotifyApi
    .getArtistAlbums(artistId)
    .then(response => {
      const albumsList = response.body.items
// console.log(response);
      res.render('albums', { albumsList })
    })
    .catch(err => console.log(err))
})

router.get('/tracks/:albumId', (req, res) => {
  const { albumId } = req.params

  spotifyApi
    .getAlbumTracks(albumId)
    .then(response => {
      const tracksList = response.body.items

      res.render('tracks', { tracksList })
    })
    .catch(err => console.log(err))
})

module.exports = router;
