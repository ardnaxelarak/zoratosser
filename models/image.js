"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.user, { as: "channel", foreignKey: "channel_twitch_id", targetKey: "twitch_id" });
      Image.belongsTo(models.image_set, { as: "image_set", foreignKey: "image_set_id", targetKey: "id" });
    }
    sanitize() {
      return {
        id: this.id,
        name: this.name,
        generic: this.channel_twitch_id == null,
        url: this.url,
      };
    }
  }
  Image.init({
    channel_twitch_id: DataTypes.STRING,
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    image_set_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: "image",
  });
  return Image;
};
