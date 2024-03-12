require("@dotenvx/dotenvx").config();

const models = require("./models");
const server = require("./server.js");
const twitch_api = require("./twitch_api.js");

async function main() {
  const channels = await models.Channel.findAll();
  for (const channel of channels) {
    if (await twitch_api.verifyRedeemWebhook(channel.twitch_id)) {
      console.log(`${channel.twitch_id} Webhook: true`);
    } else {
      console.log(`${channel.twitch_id} Webhook: false`);
    }
  }
}

main();
