'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Image);
    }
  }
  User.init({
    twitch_id: DataTypes.STRING,
    twitch_display_name: DataTypes.STRING,
    access_token: DataTypes.STRING,
    refresh_token: DataTypes.STRING,
    zora_host: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
