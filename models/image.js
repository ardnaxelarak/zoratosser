"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.user, { as: "channel", foreignKey: "channel_twitch_id", targetKey: "twitch_id" });
      Image.belongsTo(models.image_set, { as: "image_set", foreignKey: "image_set_id", targetKey: "id" });
      Image.hasMany(models.item, { as: "items", sourceKey: "id", foreignKey: "image_id" });
    }
    sanitize() {
      const result = {
        id: this.id,
        name: this.name,
        pixelated: this.pixelated,
        url: this.url,
      };
      if (this.items) {
        result.in_use = this.items.length > 0;
      }
      return result;
    }
  }
  Image.init({
    channel_twitch_id: DataTypes.STRING,
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    image_set_id: DataTypes.INTEGER,
    pixelated: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: "image",
  });
  return Image;
};
