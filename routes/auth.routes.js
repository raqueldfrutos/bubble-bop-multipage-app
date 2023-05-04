const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')

const User = require('./../models/User.model')


//Sign up

router.get("/sign-up", (req, res, next) => {
    res.render ('auth/signup')
})

router.post("/sign-up", (req, res, next) => {


});


module.exports = router;