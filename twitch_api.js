const axios = require("axios");
const crypto = require("crypto");

const cache = require("./cache.js");
const consts = require("./consts.js");
const models = require("./models");
const util = require("./util.js");

exports.getAppToken = async function() {
  try {
    const response = await axios.post(consts.AUTH_URL, {
      "client_id": process.env.TWITCH_CLIENT_ID,
      "client_secret": process.env.TWITCH_CLIENT_SECRET,
      "grant_type": "client_credentials",
    });

    return response.data.access_token;
  } catch (err) {
    util.logAxiosError(err);
    return null;
  }
};

exports.refreshToken = async function(token) {
  try {
    const response = await axios.post(consts.AUTH_URL, {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: encodeURI(token),
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  } catch (err) {
    util.logAxiosError(err);
    return null;
  }
};

exports.validateToken = async function(token) {
  try {
    const response = await axios.get(consts.VALIDATE_URL, {
      headers: {
        "Authorization": `Bearer ${token}`,
      }});

    return response.data;
  } catch (err) {
    util.logAxiosError(err);
    return null;
  }
};

exports.validateUserToken = async function(userId) {
  const user = await models.user.findOne({where: {twitch_id: userId}});

  if (await exports.validateToken(user.access_token)) {
    return user.access_token;
  }

  const refresh = await exports.refreshToken(user.refresh_token);
  if (!refresh) {
    return null;
  }

  user.access_token = refresh.access_token;
  user.refresh_token = refresh.refresh_token;
  user.save();

  if (await exports.validateToken(user.access_token)) {
    return user.access_token;
  }

  return null;
};

exports.createEventSubWebhook = async function(userId, type, version, callback) {
  try {
    const accessToken = await cache.getAppToken();
    const response = await axios.post(consts.EVENT_SUB_URL, {
      version: version,
      type: type,
      condition: {broadcaster_user_id: userId},
      transport: {
        method: "webhook",
        callback: process.env.HOSTNAME + callback,
        secret: process.env.TWITCH_WEBHOOK_SECRET,
      },
    },
    {
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
      },
    });

    return true;
  } catch (err) {
    util.logAxiosError(err);
    return false;
  }
};

exports.getEventSubs = async function(userId) {
  try {
    var list = [];
    const accessToken = await cache.getAppToken();

    var response = await axios.get(consts.EVENT_SUB_URL, {
      params: {
        "user_id": userId,
      },
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
      }});

    list = list.concat(response.data.data);
    while (response.data.pagination.cursor) {
      var response = await axios.get(consts.EVENT_SUB_URL, {
        params: {
          "user_id": userId,
          "after": response.data.pagination.cursor,
        },
        headers: {
          "Authorization": "Bearer " + accessToken,
          "Client-Id": process.env.TWITCH_CLIENT_ID,
        }});

      list = list.concat(response.data.data);
    }

    return list;
  } catch (err) {
    util.logAxiosError(err);
    return null;
  }
};

exports.verifyRedeemWebhook = async function(userId) {
  if (!await exports.validateUserToken(userId)) {
    return false;
  }

  const eventSubs = await exports.getEventSubs(userId);

  if (eventSubs) {
    for (const eventSub of eventSubs) {
      if (eventSub.type == consts.CHANNEL_POINT_REDEEM && eventSub.transport.method == "webhook"
          && eventSub.transport.callback == `${process.env.HOSTNAME}/redeem`) {
        return true;
      }
    }
  }

  return await exports.createEventSubWebhook(userId, consts.CHANNEL_POINT_REDEEM, 1, "/redeem");
};

exports.createChannelReward = async function(userId, opts) {
  const user = await models.user.findOne({where: {twitch_id: userId}});
  const accessToken = await exports.validateUserToken(userId);

  if (!accessToken) {
    return null;
  }

  try {
    const response = await axios.post(consts.CHANNEL_REWARD_URL, {
      title: opts.title,
      cost: opts.cost,
      prompt: opts.description,
      is_enabled: false,
      background_color: opts.color,
    },
    {
      params: {
        "broadcaster_id": userId,
      },
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
      },
    });

    return response.data.data[0].id;
  } catch (err) {
    util.logAxiosError(err);
    return null;
  }
};
