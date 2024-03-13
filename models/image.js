"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.user, { as: "channel", foreign_key: "channel_twitch_id", target_key: "twitch_id" });
    }
  }
  Image.init({
    channel_twitch_id: DataTypes.STRING,
    name: DataTypes.STRING,
    url: DataTypes.STRING,
  }, {
    sequelize,
    modelName: "image",
  });
  return Image;
};
