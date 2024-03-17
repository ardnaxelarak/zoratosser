require("@dotenvx/dotenvx").config();

const op = require("sequelize").Op;

const models = require("./models");
const server = require("./server.js");
const twitch_api = require("./twitch_api.js");

async function main() {
  const users = await models.user.findAll();
  for (const user of users) {
    if (user.zora_host) {
      if (await twitch_api.verifyRedeemWebhook(user.twitch_id)) {
        console.log(`${user.twitch_display_name} Webhook: true`);
      } else {
        console.log(`${user.twitch_display_name} Webhook: false`);
      }
      const sets = await models.set.findAll({where: {channel_twitch_id: user.twitch_id, redeem_id: {[op.is]: null}}});
      for (const set of sets) {
        const redeemId = await twitch_api.createChannelReward(user.twitch_id, {
          title: `ZoraTosser - ${set.name} set`,
          cost: 500,
          background_color: "#4556a7",
        });
        if (redeemId) {
          set.update({redeem_id: redeemId});
        }
      }
    }
  }
}

main();
