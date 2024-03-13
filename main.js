require("@dotenvx/dotenvx").config();

const models = require("./models");
const server = require("./server.js");
const twitch_api = require("./twitch_api.js");

async function main() {
  const users = await models.user.findAll();
  for (const user of users) {
    if (user.zora_host) {
      const sets = await models.set.findAll({ where: { channel_twitch_id: user.twitch_id } });
      for (const set of sets) {
        console.log(set.name);
        const items = await set.getItems();
        for (const item of items) {
          console.log(item.item_weight);
        }
      }
      if (await twitch_api.verifyRedeemWebhook(user.twitch_id)) {
        console.log(`${user.twitch_display_name} Webhook: true`);
      } else {
        console.log(`${user.twitch_display_name} Webhook: false`);
      }
    }
  }
}

main();
