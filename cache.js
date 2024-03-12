const twitch_api = require("./twitch_api.js");

const cache = {};

exports.getAppToken = async function() {
  if (!cache.app_token) {
    cache.app_token = await twitch_api.getAppToken();
  }

  return cache.app_token;
};
