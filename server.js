const axios = require("axios");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const crypto = require("crypto");
const express = require("express");
const history = require("connect-history-api-fallback");
const passport = require("passport");
const twitchStrategy = require("passport-twitch-new").Strategy;

const api = require("./api.js");
const cache = require("./cache.js");
const consts = require("./consts.js");
const models = require("./models");
const twitch_api = require("./twitch_api.js");
const util = require("./util.js");

const app = express();
const port = process.env.PORT || 3444;

const notifications = new Map();

const channelScopes = [
  "channel:read:redemptions",
];

const userScopes = [
];

app.set("view engine", "ejs");

app.use(bodyParser.json({
    verify: (req, res, buf) => { req.rawBody = buf }
}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(cookieSession({secret: process.env.COOKIE_SECRET}));

// register regenerate & save after the cookieSession middleware initialization
app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb();
        };
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb();
        };
    }
    next();
});

app.use(passport.initialize());

passport.use(new twitchStrategy({
    clientID: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    callbackURL: process.env.HOSTNAME + "/twitch_callback",
    scope: userScopes.join("+"),
  },
  async function(accessToken, refreshToken, profile, done) {
    const [user, created] = await models.user.findOrCreate({where: {twitch_id: profile.id}});
    user.twitch_display_name = profile.display_name;
    user.access_token = accessToken;
    user.refresh_token = refreshToken;
    user.save();
    return done(null, user);
  }));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use("/api", api);

app.get("/authenticate", passport.authenticate("twitch", { scope: channelScopes.join("+") }));
app.get("/twitch_callback", passport.authenticate("twitch", { failureRedirect: "/" }), (req, res) => {
  res.redirect("/");
});

app.get("/add_image", (req, res) => {
  res.render("add_image.html.ejs");
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

app.use(history());
app.use(express.static("dist"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function redemptionReceived(event) {
  console.log("Channel Id: " + event.broadcaster_user_id);
  console.log("User Id: " + event.user_id);
  console.log("User Name: " + event.user_name);
  console.log("Redemption: " + event.reward.title);
}

function deduplicateNotification(id) {
  if (notifications.has(id)) {
    return false;
  }
  notifications.set(id, Date.now());
  return true;
}

