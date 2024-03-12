const axios = require("axios");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const express = require("express");

const cache = require("./cache.js");
const consts = require("./consts.js");
const database = require("./database.js");
const models = require("./models");
const twitch_api = require("./twitch_api.js");
const util = require("./util.js");

const app = express();
const port = process.env.PORT || 3444;

const notifications = new Map();

function deduplicateNotification(id) {
  if (notifications.has(id)) {
    return false;
  }
  notifications.set(id, Date.now());
  return true;
}

app.use(bodyParser.json({
    verify: (req, res, buf) => { req.rawBody = buf }
}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/authenticate", (req, res) => {
  const scopes = [
    "channel:read:redemptions",
  ];
  const state = crypto.randomBytes(20).toString('hex');
  const url = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.HOSTNAME}/twitch_callback&state=${state}&response_type=code&scope=${scopes.join("+")}`;
  res.redirect(url);
});

app.get("/twitch_callback", async (req, res) => {
  try {
    const authResponse = await axios.post(consts.AUTH_URL, null, {params: {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      code: req.query.code,
      grant_type: "authorization_code",
      redirect_uri: process.env.HOSTNAME + "/twitch_callback",
    }});

    const access_token = authResponse.data.access_token;
    const refresh_token = authResponse.data.refresh_token;

    const token = await twitch_api.validateToken(access_token);
    if (!token) {
      res.send("Error");
      return;
    }
    const userId = token.user_id;

    const [channel, created] = await models.Channel.findOrCreate({where: {twitch_id: userId}});
    channel.access_token = access_token;
    channel.refresh_token = refresh_token;
    channel.save();

    res.send(`Successfully authenticated as ${token.login}`);
  } catch (err) {
    util.logAxiosError(err);
    res.send("Error");
  }
});

app.post("/redeem", async (req, res) => {
  const hmac = crypto.createHmac('sha256', process.env.TWITCH_WEBHOOK_SECRET);
  const hmacMessage =
      req.header('Twitch-Eventsub-Message-Id')
          + req.header('Twitch-Eventsub-Message-Timestamp')
          + req.rawBody;
  hmac.update(hmacMessage);
  const expectedSignature = 'sha256=' + hmac.digest('hex');

  const actualSignature = req.header('Twitch-Eventsub-Message-Signature');
  if (actualSignature != expectedSignature) {
    console.error(`expected sig: ${expectedSignature}, actual sig: ${actualSignature}`);
    res.sendStatus(403);
    return;
  }

  if (!deduplicateNotification(req.header('Twitch-Eventsub-Message-Id'))) {
    console.log("Received duplicate notification; ignoring.");
    return;
  }

  const type = req.header('Twitch-Eventsub-Message-Type');
  if (type == "webhook_callback_verification") {
    console.log("replying with challenge");
    res.send(req.body.challenge);
    return;
  } else if (type == "notification") {
    redemptionReceived(req.body.event);
    res.sendStatus(200);
    return;
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function redemptionReceived(event) {
  console.log("Channel Id: " + event.broadcaster_user_id);
  console.log("User Id: " + event.user_id);
  console.log("User Name: " + event.user_name);
  console.log("Redemption: " + event.reward.title);
}
