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
      RedeemItem.belongsToMany(models.set, { as: "sets", through: models.item_weight, foreignKey: "item_id", otherKey: "set_id" });
      RedeemItem.hasMany(models.item_weight, { as: "weights", sourceKey: "id", foreignKey: "item_id" });
    }
    sanitize() {
      return {
        id: this.id,
        name: this.name,
        image_id: this.image_id,
        image_url: this.image.url,
        single_id: this.single_id,
        single_quantity: this.single_quantity,
        weigh_by_remainder: this.weigh_by_remainder,
        sets: this.getSets(),
      };
    }
    getSets() {
      if (!this.sets) {
        return null;
      }

      return this.sets.reduce((map, obj) => {
        map[obj.id] = {
          weight: obj.item_weight.weight,
          max_quantity: obj.item_weight.max_quantity,
        };
        return map;
      }, {});
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

