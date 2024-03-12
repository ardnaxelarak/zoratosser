require("@dotenvx/dotenvx").config();

const models = require("./models");
const server = require("./server.js");
const twitch_api = require("./twitch_api.js");

async function main() {
  const users = await models.User.findAll();
  for (const user of users) {
    if (user.zora_host) {
      if (await twitch_api.verifyRedeemWebhook(user.twitch_id)) {
        console.log(`${user.twitch_display_name} Webhook: true`);
      } else {
        console.log(`${user.twitch_display_name} Webhook: false`);
      }
    }
  }
}

main();
