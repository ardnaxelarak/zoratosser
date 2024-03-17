"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RedeemSet extends Model {
    static associate(models) {
      RedeemSet.belongsTo(models.user, { as: "channel", foreignKey: "channel_twitch_id", targetKey: "twitch_id" });
      RedeemSet.belongsToMany(models.item, { as: "items", through: models.item_weight, foreignKey: "set_id", otherKey: "item_id" });
    }
    sanitize() {
      return {
        id: this.id,
        name: this.name,
        redeem_id: this.redeem_id,
      };
    }
  }
  RedeemSet.init({
    channel_twitch_id: DataTypes.STRING,
    name: DataTypes.STRING,
    redeem_id: DataTypes.STRING,
  }, {
    sequelize,
    modelName: "set",
  });
  return RedeemSet;
};
