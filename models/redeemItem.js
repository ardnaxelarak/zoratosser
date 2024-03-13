"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RedeemItem extends Model {
    static associate(models) {
      RedeemItem.belongsTo(models.user, { as: "channel", foreignKey: "channel_twitch_id", sourceKey: "twitch_id" });
      RedeemItem.belongsTo(models.image, { as: "image", foreignKey: "image_id" });
      RedeemItem.belongsTo(models.item, { as: "single_item", foreignKey: "single_id" });
    }
  }
  RedeemItem.init({
    channel_twitch_id: DataTypes.STRING,
    name: DataTypes.STRING,
    image_id: DataTypes.INTEGER,
    single_id: DataTypes.INTEGER,
    single_quantity: DataTypes.INTEGER,
    weigh_by_remainder: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: "item",
  });
  return RedeemItem;
};

