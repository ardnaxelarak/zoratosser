"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserItem extends Model {
    static associate(models) {
      UserItem.belongsTo(models.user, { as: "channel", sourceKey: "id", foreignKey: "channel_id"});
      UserItem.belongsTo(models.user, { as: "user", sourceKey: "id", foreignKey: "user_id"});
      UserItem.belongsTo(models.item, { as: "item", sourceKey: "id", foreignKey: "item_id"});
    }
  }
  UserItem.init({
    channel_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    item_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: "user_item",
  });
  return UserItem;
};

