# BubbleBop!

[Link to BubbleBop!](https://old-sound-6865.fly.dev/)

### Authors

Raquel de Frutos Álvarez
Daniel Salas Rodríguez

### UX/UI Team
Sara M. Alarcón Miguez
Nicolás Regueiro

## How it looks

![Screen_view_1](https://github.com/raqueldfrutos/project2-music-platform/blob/master/Images/inicio.png)
![Screen_view_2](https://github.com/raqueldfrutos/project2-music-platform/blob/master/Images/login.png)

## Description

BubbleBop is a space to find and share your favorite artists, find out more about their upcoming concerts and create playlists with your favorite music.

## MVP

Online page designed to search for artists, albums or songs to be able to add them to your playlist.

## Built with

 - HTML / CSS / JavaScript / Bootstrap
 - Handlebars / Axios / MongoDB / NodeJS / ExpressJS
 - APIs: Cloudinary / SpotifyApi

## User Stories

 - <b>Homepage</b> - As users, we need to log-in or sign up if we don't have an account.
 - <b>Login</b> - As users, we want to be able to log in and manage our profile and services.
 - <b>Signup</b> - As users, we want to be able to create an account and sell amazing services. 
 - <b>Profile page</b> - As users, we want to be able to edit our profile, see our saved favorite artist, create and listen to our playlists.
 - <b>secure password</b> - As users, we want our users to register with a strong password for added security.
 - <b>search page</b> - As users, we want our users to have an easy way to search for their favorite artists and songs.
 - <b>Trending top</b> - As users, we like that you can access the most popular songs of the moment.

## Data structure

### app.js

```

require("dotenv").config();
require("./db");
const express = require("express");
const path = require("path");
const hbs = require("hbs");
hbs.registerPartials(path.join(__dirname, "views", "partials"));
const app = express();
require("./config")(app);
require("./config/session.config")(app);
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);
const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);
const profileRoutes = require("./routes/profile.routes");
app.use("/profile", profileRoutes);
const searchRoutes = require("./routes/search.routes");
app.use("/search", searchRoutes);
const playlistRoutes = require("./routes/playlist.routes");
app.use("/playlist", playlistRoutes);
const trendingRoutes = require("./routes/trending.routes");
app.use("/trending", trendingRoutes);
require("./error-handling")(app);
module.exports = app;

```

### server.js

```

const app = require("./app");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

```

### capitalize.js

```

function capitalize (string) {
  return string[0].toUpperCase() + string.slice(1).toLowerCase();
}
module.exports = capitalize;

```

### Routes

#### auth.routes.js

```

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("./../models/User.model");
const { isLoggedOut, isLoggedIn } = require("../middlewares/route-guard");
const saltRounds = 10;

router.get("/signup", isLoggedOut,(req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, password, email, name, lastName } = req.body;

    if (!username || !email || !password || !name || !lastName) {
      res.render("auth/signup", {
        errorMessage: "Por favor rellena todos los campos."
      });
      return;
    }

    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    if (!regex.test(password)) {
      return res.render("auth/signup", {
        errorMessage:
          "Password needs to have 8 char, including lower/upper case and a digit"
      });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      res.render("auth/signup", {
        errorMessage: "El usuario y/o el email están en uso."
      });
      return;
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    await User.create({ username, email, name, lastName, password: hashedPassword });
    res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
});

router.get("/login",(req, res) => {
  res.render("auth/login");
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.render("auth/login", {
        errorMessage: "Por favor rellena todos los campos."
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.render("auth/login", {
        errorMessage: "Usuario o contraseña incorrectos."
      });
      return;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.render("auth/login", {
        errorMessage: "Usuario o contraseña incorrectos."
      });
      return;
    }
  
    req.session.currentUser = user;
    req.app.locals.isLogged = true;
    res.redirect("/profile");
  } catch (error) {
    next(error);
  }
});

router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("auth/profile");
});

router.get("/tremding", isLoggedIn, (req, res, next) => {
  res.render("auth/trending");
});

router.get('/logout', (req, res, next) => {
  req.app.locals.isLogged = false;
  req.session.destroy (() => res.redirect('/'))
  });
  
module.exports = router;

```

#### index.routes.js

```

const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/route-guard");

router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/discover", isLoggedIn, (req, res, next) => {
  res.render("discover", { currentUser: req.session.currentUser });
 });

module.exports = router;

```

#### playlist.routes.js

```

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

```

#### profile.routes 

```

const express = require("express");
const router = express.Router();
const User = require("./../models/User.model");
const uploader = require("../config/cloudinary.config");
const { isLoggedIn } = require("../middlewares/route-guard");

router.get("/", isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session;
  User.findById(currentUser._id)
    .populate("favoriteArtists")
    .populate("playlists")
    .then(user => {
      res.render("profile/profile", user);
    });
});

router.get("/edit", isLoggedIn, (req, res, next) => {
  const { currentUser } = req.session;
  User.findById(currentUser._id).then(user => {
    res.render("profile/edit-profile", user);
  });
});

router.post("/edit", isLoggedIn, uploader.single("imageProfile"), (req, res, next) => {
  const { currentUser } = req.session;
  const data = { ...req.body };

  if (req.file) {
    data.imageProfile = req.file.path;
  }
  User.findByIdAndUpdate(currentUser._id, data).then(() => {
    res.redirect("/profile");
  });
});

module.exports = router;

```

#### search.routes.js

```

const express = require("express");
const router = express.Router();
const Artist = require("./../models/Artist.model");
const Playlist = require("./../models/Playlist.model");
const { isLoggedIn } = require("../middlewares/route-guard");
const SpotifyWebApi = require("spotify-web-api-node");
const User = require("../models/User.model");
const { request } = require("../app");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch(error => console.error("Something went wrong when retrieving an access token", error))
 

router.get("/artists", isLoggedIn, (req, res, next) => {
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
      return User.findById(req.session.currentUser._id).populate("playlists");
    })
    .then(user => {
      userPlaylists = user.playlists;
      console.log(userPlaylists);
      res.render("music/artists-results", { artistsResults, tracksResults, search, playlists: userPlaylists });
    })
    .catch(err => console.error("The error while searching artists occurred: ", err));
});

router.post("/artist/favorite", isLoggedIn, (req, res, next) => {
  const { name, image, search } = req.body;
  const { currentUser } = req.session; //objeto deconstruido
  Artist.findOne({ name })
    .then(artist => {
      if (!artist) {
        return Artist.create({ name, image }).then(newArtist => {
          return User.findByIdAndUpdate(currentUser._id, {
            $push: { favoriteArtists: newArtist._id }
          });
        });
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
              res.render("music/artists-results", {
                errorMessage: "Ya has añadido este artista como favorito"
              });
              return;
            } else {
              return User.findByIdAndUpdate(currentUser._id, {
                $push: { favoriteArtists: artist._id }
              }); // si el if no se cumple, es decir si no existe ya, lo añade
            }
          });
      }
    })

    .then(() => res.redirect(`/search/artists?search=${search}`)) 
    .catch(error => console.error(error));
});

router.post("/add-track/:id", isLoggedIn, (req, res, next) => {
  const { id } = req.params;
  const { name, preview_url, search, albumId } = req.body;
  const trackFromForm = { ...req.body };

  Playlist.findById(id)
    .then(playlist => {
      const playlistTracks = playlist.tracks;
      const trackExists = playlistTracks.some(track => {
        if (track.name === trackFromForm.name) {
          return true;
        }
      });
      if (trackExists) {
        return;
      } else {
        return Playlist.findByIdAndUpdate(id, { $push: { tracks: { name, preview_url } } });
      }
    })
    .then(() => {
      if (search) {
        res.redirect(`/search/artists?search=${search}`);
      } else {
        res.redirect(`/search/tracks/${albumId}`);
      }
    })
    .catch(err => console.error(err));
});

router.post("/artist/:id/delete", isLoggedIn, async (req, res, next) => {
  const { currentUser } = req.session;
  const { id } = req.params;

  await User.findByIdAndUpdate(currentUser._id, {
    $pull: { favoriteArtists: id }
  });
  res.redirect("/profile");
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
  const { currentUser } = req.session;
  let tracksList = undefined;
  spotifyApi
    .getAlbumTracks(albumId)

    .then(response => {
      tracksList = response.body.items;
      return User.findById(currentUser).populate("playlists");
    })
    .then(user => {
      const playlists = user.playlists;
      res.render("music/tracks", { tracksList, albumId, playlists });
    })
    .catch(err => console.error(err));
});

module.exports = router;

```

#### trending.routes

```

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
    .then((data) =>{
      const tracks = data.body.tracks.items
      const trackslimit10 = tracks.slice (0, 10)
      console.log (tracks);
      res.render("trending",{tracks: trackslimit10})
    })
    .catch ((err) => {
      console.error("Something went wrong!", err);
    });
   
  });

module.exports = router;

```

### Middlewares

#### route-guard.js

```

const isLoggedIn = (req, res, next) => {
    if(req.session.currentUser){
      next();
    } else {
      res.render('auth/login', { errorMessage: 'Debes iniciar sesión.'})
      return
    }
  }
  
  const isLoggedOut = (req, res, next) => {
    if(req.session.currentUser){
      res.redirect('/profile')
    } else {
      next()
    }
  }
  
  module.exports = { isLoggedIn, isLoggedOut };

  ```

### Config

#### cloudinary.config.js

```

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ["jpg", "png", "jpeg"],
    folder: "user-store"
  }
});

module.exports = multer({ storage });

```

#### index.js

```

const logger = require("morgan");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");
const path = require("path");

module.exports = (app) => {
  
  app.use(logger("dev")); 
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());  
  app.set("views", path.join(__dirname, "..", "views")); 
  app.set("view engine", "hbs");  
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(favicon(path.join(__dirname, "..", "public", "images", "favicon.ico")));
};

```

#### session.config.js

```

const session = require("express-session");
const MongoStore = require("connect-mongo");

module.exports = app => {
  app.set("trust proxy", 1);
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
      cookie: {
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 6000000000000
      },
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
      })
    })
  );
};

```

## Links

### Trello

[Link url](https://trello.com/b/OuXEbHcL/project-2-ironhack)

### Git 

[Link Repo](https://github.com/raqueldfrutos/project2-music-platform)

### Figma

[Link presentation](https://www.figma.com/file/J1DjwDoyRURp39Xg7nQU4d/Proyecto-2---Web?type=design&node-id=80-372&t=mcXUPk7tJeA5pGyY-0)





 
