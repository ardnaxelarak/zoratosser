const crypto = require("crypto");

const models = require("./models");

exports.giveItem = async function(channelId, setId, userId) {
  const set = await models.set.findOne({where: {channel_twitch_id: channelId, id: setId}, include: "items"});

  if (!set) {
    return null;
  }

  const weightedItems = set.items.reduce((list, item) => {
    const weight = Math.round(item.item_weight.weight * 1000);
    if (weight <= 0) {
      return list;
    }
    list.push({
      item: item,
      weight: weight,
    });
    return list;
  }, []);

  const item = getWeightedItem(weightedItems);
  if (!item) {
    return null;
  }

  const channel = await models.user.findOne({where: {twitch_id: channelId}});
  const [user, _unused1] = await models.user.findOrCreate({where: {twitch_id: userId}});
  const [userItem, _unused2] = await models.user_item.findOrCreate({
    where: {
      channel_id: channel.id,
      user_id: user.id,
      item_id: item.id
    },
    defaults: {
      quantity: 0,
    }
  });

  const image_url = (await item.getImage()).url;

  await userItem.increment("quantity");

  return {
    name: item.name,
    url: image_url,
  };
};

function getWeightedItem(weightedItems) {
  const totalWeights = weightedItems.reduce((total, item) => {
    return total + item.weight;
  }, 0);

  if (totalWeights <= 0) {
    return null;
  }

  var value = crypto.randomInt(totalWeights);

  for (const item of weightedItems) {
    if (value < item.weight) {
      return item.item;
    }
    value -= item.weight;
  }

  return weightedItems[weightedItems.length - 1].item;
}
