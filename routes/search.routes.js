const express = require("express");
const router = express.Router();
const Artist = require("./../models/Artist.model");

//SPOTIFY API

const SpotifyWebApi = require("spotify-web-api-node");
const User = require("../models/User.model");

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
      res.render("artists-results", { artistsResults, search });
    })
    .catch(err => console.log("The error while searching artists occurred: ", err));
});

router.post("/artist/favorite", (req, res, next) => {
  const { name, image, search } = req.body;
  const { currentUser } = req.session; //objeto deconstruido

  Artist.findOne({ name })
    .then(artist => {
      // si el artista no existe en nuestra database lo creamos (esto sirve para no poder añadir mas de una vez al artista como favorito)
      if (!artist) {
        return Artist.create({ name, image }).then(newArtist => {
          return User.findByIdAndUpdate(currentUser._id, { $push: { favoriteArtists: newArtist._id } });
        });
      } else {
        return User.findById(currentUser._id)
          .populate("favoriteArtists")
          .then(user => {
            const artists = user.favoriteArtists;

            const artistExist = artists.some(eachArtist => {
              if (eachArtist.name === artist.name) {
                return true;
              }
            });

            if (artistExist) {
              return;
            } else {
              return User.findByIdAndUpdate(currentUser._id, { $push: { favoriteArtists: artist._id } });
            }
          });
      }
    })
    .then(() => res.redirect(`/search/artists?search=${search}`))
    .catch(error => console.error(error));
});

router.get("/albums/:artistId", (req, res) => {
  const { artistId } = req.params;
  //console.log(artistId);
  spotifyApi
    .getArtistAlbums(artistId)
    .then(response => {
      const albumsList = response.body.items;
      // console.log(response);
      res.render("albums", { albumsList });
    })
    .catch(err => console.log(err));
});

router.get("/tracks/:albumId", (req, res) => {
  const { albumId } = req.params;

  spotifyApi
    .getAlbumTracks(albumId)
    .then(response => {
      const tracksList = response.body.items;

      res.render("tracks", { tracksList });
    })
    .catch(err => console.log(err));
});

module.exports = router;
