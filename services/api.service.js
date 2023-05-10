const axios = require("axios");

class Apiticketmaster {
  constructor() {
    this.api = axios.create({
      baseURL: "https://developer-acct.ticketmaster.com/user/40475/apps"
    });
}}

  module.exports = Apiticketmaster;