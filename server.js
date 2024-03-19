const axios = require("axios");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const crypto = require("crypto");
const express = require("express");
const history = require("connect-history-api-fallback");
const http = require("http");
const op = require("sequelize").Op;
const passport = require("passport");
const querystring = require('node:querystring');
const { Server } = require("socket.io");
const twitchStrategy = require("passport-twitch-new").Strategy;

const api = require("./api.js");
const cache = require("./cache.js");
const consts = require("./consts.js");
const item_selector = require("./item_selector.js");
const models = require("./models");
const twitch_api = require("./twitch_api.js");
const util = require("./util.js");

const app = express();
const port = process.env.PORT || 3444;

const notifications = new Map();

const channelScopes = [
  "channel:manage:redemptions",
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
    store: true,
    scope: userScopes,
  },
  async function(accessToken, refreshToken, profile, done) {
    const [user, created] = await models.user.findOrCreate({where: {twitch_id: profile.id}});
    user.twitch_display_name = profile.display_name;
    user.twitch_lower_name = profile.display_name.toLowerCase();
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

function authMiddleware(req, res, next) {
  const options = {
    failureRedirect: "/authfailure",
    state: {
      host: req.query.host,
      redirect: req.query.redirect,
    },
  };
  if (req.query.host) {
    options.scope = channelScopes;
  }
  passport.authenticate("twitch", options)(req, res, next);
};

app.get("/authenticate", authMiddleware);
app.get("/twitch_callback", authMiddleware, (req, res) => {
  const state = req.authInfo.state;
  if (state.host) {
    return res.redirect(`/onboard?redirect=${state.redirect || "/"}`);
  }
  return res.redirect(state.redirect || "/");
});

app.get("/onboard", async (req, res) => {
  if (!req.session.passport?.user) {
    return res.sendStatus(401);
  }

  const user = await models.user.findByPk(req.session.passport.user.id);
  if (!user) {
    return res.sendStatus(500);
  }

  if (!user.zora_host) {
    await user.update({zora_host: true});
    if (!await twitch_api.verifyRedeemWebhook(user.twitch_id)) {
      return res.sendStatus(500);
    }
  }

  const sets = await models.set.findAll({where: {channel_twitch_id: user.twitch_id}});
  if (sets.length == 0) {
    await models.set.create({channel_twitch_id: user.twitch_id, name: "default"});
  }

  const noIdSets = await models.set.findAll({where: {channel_twitch_id: user.twitch_id, redeem_id: {[op.is]: null}}});
  for (const set of noIdSets) {
    const redeemId = await twitch_api.createChannelReward(user.twitch_id, {
      title: `ZoraTosser - ${set.name} set`,
      cost: 500,
      background_color: "#4556a7",
    });
    if (redeemId) {
      set.update({redeem_id: redeemId});
    }
  }

  res.redirect(req.query.redirect || "/");
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

const server = http.createServer(app);
const io = new Server(server);

const authViewer = function(req, res, next) {
  if (!req.session.passport?.user) {
    const query = querystring.stringify({redirect: req.path});
    return res.redirect("/authenticate?" + query);
  }

  return next();
};

const authChannel = function(req, res, next) {
  if (!req.session.passport?.user) {
    const query = querystring.stringify({redirect: req.path, host: true});
    return res.redirect("/authenticate?" + query);
  }

  return next();
};

app.get("/myitems/:channel", authViewer);
app.get("/myzora/edit", authChannel);

app.use(history());
app.use(express.static(process.env.DIST_DIR));

const clients = [];

io.on("connection", client => {
  clients.push({client: client});

  client.on('disconnect', function (reason) {
    const index = clients.findIndex(el => el.client === client);
    if (index >= 0) {
      clients.splice(index, 1);
    }
  });

  client.on('message', async function(...args) {
    if (args.length >= 2 && args[0] === "register") {
      const found = clients.find(el => el.client === client);
      const channelName = args[1].toLowerCase();
      const channel = await models.user.findOne({where: {twitch_lower_name: channelName}});
      if (found && channel) {
        found.channel = channel.twitch_id;
      }
    }
  });
});

function zoraItem(channel, data) {
  for (const client of clients) {
    if (client.channel == channel) {
      client.client.send("zora", data);
    }
  }
};

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

async function redemptionReceived(event) {
  const set = await models.set.findOne({where: {channel_twitch_id: event.broadcaster_user_id, redeem_id: event.reward.id}});
  if (!set) {
    return;
  }

  const item = await item_selector.giveItem(event.broadcaster_user_id, set.id, event.user_id);
  if (!item) {
    return;
  }

  zoraItem(event.broadcaster_user_id, {
    username: event.user_name,
    itemDisplay: item.name,
    itemSrc: item.url,
  });
}

function deduplicateNotification(id) {
  if (notifications.has(id)) {
    return false;
  }
  notifications.set(id, Date.now());
  return true;
}
