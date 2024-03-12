'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.User, { as: "Channel", foreign_key: "channel_twitch_id" });
    }
  }
  Image.init({
    channel_twitch_id: DataTypes.STRING,
    name: DataTypes.STRING,
    url: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};

