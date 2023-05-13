const express = require("express");
const router = express.Router();
const Artist = require("./../models/Artist.model");
const Playlist = require("./../models/Playlist.model");
const { isLoggedIn } = require("../middlewares/route-guard");

//SPOTIFY API

const SpotifyWebApi = require("spotify-web-api-node");
const User = require("../models/User.model");
const { request } = require("../app");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch(error => console.error("Something went wrong when retrieving an access token", error));

router.get("/artists", isLoggedIn, (req, res, next) => {
  //ruta de los artistas
  //query mongo a los datos logueados. Hacerlo con map para hacer un array quitando el ya añadido
  const { search } = req.query;
  let artistsResults = undefined;
  let tracksResults = undefined;

  spotifyApi
    .searchArtists(search, { limit: 1 })
    .then(data => {
      artistsResults = data.body.artists.items;

      return spotifyApi.searchTracks(search);
    })

    .then(data => {
      tracksResults = data.body.tracks.items;
      res.render("music/artists-results", { artistsResults, tracksResults, search });
    })
    .catch(err => console.error("The error while searching artists occurred: ", err));
});

router.post("/artist/favorite", isLoggedIn, (req, res, next) => {
  const { name, image, search } = req.body;
  const { currentUser } = req.session; //objeto deconstruido
  //buscamos artista que se asocie con name
  Artist.findOne({ name })
    .then(artist => {
      // si ese artista no existe en nuestra database lo creamos (esto sirve para no poder añadir mas de una vez al artista en la coleccion de artists de la database) y a continuación buscamos al currentUser y actualizamos su campo favArtist haciendo push del id del artista creado
      if (!artist) {
        return Artist.create({ name, image }).then(newArtist => {
          return User.findByIdAndUpdate(currentUser._id, { $push: { favoriteArtists: newArtist._id } });
        });
        // Si el artista ya existe en basedatos... localizamos User + identificamos que el artista NO exista ya como favorito en su campo de favoriteArtists (de esta manera evitamos que se pueda repetir un mismo artista en dicho array)
      } else {
        return User.findById(currentUser._id)
          .populate("favoriteArtists") // populando accedemos a todos los campos del modelo de Artist
          .then(user => {
            const artists = user.favoriteArtists;
            // buscamos en el array de favoriteArtists si ya existe uno
            const artistExist = artists.some(eachArtist => {
              if (eachArtist.name === artist.name) {
                //este artist.name se refiere al encontrado previamente con Artist.findOne
                return true;
              }
            });

            if (artistExist) {
              return {
                //errorMessage: "Este artista ya esta añadido"
                // alert('Este artista ya esta añadido')
              };
              //si el if anterior se cumple devuelve true y con este return lo que hace es parar la app
            } else {
              return User.findByIdAndUpdate(currentUser._id, { $push: { favoriteArtists: artist._id } }); // si el if no se cumple, es decir si no existe ya, lo añade
            }
          });
      }
    })
    .then(() => res.redirect(`/search/artists?search=${search}`)) // este search corresponde con la palabra que haya utiliado el usuario para hacer la busqueda, es decir a la query que le pasamos a la función en la linea 22
    .catch(error => console.error(error));
});

router.get("/albums/:artistId", isLoggedIn, (req, res) => {
  const { artistId } = req.params;
  spotifyApi
    .getArtistAlbums(artistId)
    .then(response => {
      const albumsList = response.body.items;
      res.render("music/albums", { albumsList });
    })
    .catch(err => console.error(err));
});

router.get("/tracks/:albumId", isLoggedIn, (req, res) => {
  const { albumId } = req.params;

  spotifyApi
    .getAlbumTracks(albumId)
    .then(response => {
      const tracksList = response.body.items;

      res.render("music/tracks", { tracksList });
    })
    .catch(err => console.error(err));
});

// router.get("/tracks/add", (req, res) => {
//   Playlist.find()
//   .then((dbPlaylists) => {

//   })
// })

module.exports = router;
