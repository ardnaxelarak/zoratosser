"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.image, { as: "images", sourceKey: "twitch_id", foreignKey: "channel_twitch_id"});
      User.hasMany(models.set, { as: "sets", sourceKey: "twitch_id", foreignKey: "channel_twitch_id"});
      User.hasMany(models.item, { as: "items", sourceKey: "twitch_id", foreignKey: "channel_twitch_id"});
      User.belongsToMany(models.item, { as: "obtained_items", through: models.user_item, foreignKey: "user_id", otherKey: "item_id" });
    }
  }
  User.init({
    twitch_id: DataTypes.STRING,
    twitch_display_name: DataTypes.STRING,
    twitch_lower_name: DataTypes.STRING,
    access_token: DataTypes.STRING,
    refresh_token: DataTypes.STRING,
    zora_host: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: "user",
  });
  return User;
};
