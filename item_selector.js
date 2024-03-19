const crypto = require("crypto");

const models = require("./models");

exports.giveItem = async function(channelId, setId, userId) {
  const set = await models.set.findOne({where: {channel_twitch_id: channelId, id: setId}, include: "items"});

  if (!set) {
    return null;
  }

  const channel = await models.user.findOne({where: {twitch_id: channelId}});
  const [user, _unused1] = await models.user.findOrCreate({where: {twitch_id: userId}, include: "obtained_items"});

  if (!user.obtained_items) {
    user.obtained_items = [];
  }

  const itemMap = user.obtained_items.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});

  const weightedItems = set.items.reduce((list, item) => {
    const max = item.item_weight.max_quantity;
    var weight = Math.round(item.item_weight.weight * 1000);

    if (max > 0) {
      const has = itemMap[item.id]?.user_item.quantity || 0;

      if (has >= max) {
        return list;
      }

      if (item.weigh_by_remainder) {
        weight *= max - has;
      }
    }

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
