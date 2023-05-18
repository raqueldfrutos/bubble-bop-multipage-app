// ℹ️ Gets access to environment variables/settings
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");
// Register partials

// Handles http requests (express is node js framework)
const express = require("express");

// Handles the handlebars
const path = require("path");
const hbs = require("hbs");
hbs.registerPartials(path.join(__dirname, "views", "partials"));

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);
require("./config/session.config")(app);

// 👇 Start handling routes here
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

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
