const expressPackage = require("express");
const router = expressPackage.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

module.exports = router;
