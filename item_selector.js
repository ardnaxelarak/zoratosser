const crypto = require("crypto");

const models = require("./models");

exports.giveItem = async function(channelId, setId, userId) {
  const set = await models.set.findOne({where: {channel_twitch_id: channelId, id: setId}, include: "items"});

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

  const image_url = (await item.getImage()).url;

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
