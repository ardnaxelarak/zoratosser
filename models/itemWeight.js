"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ItemWeight extends Model {
    static associate(models) {
    }
  }
  ItemWeight.init({
    set_id: DataTypes.INTEGER,
    item_id: DataTypes.INTEGER,
    weight: DataTypes.DOUBLE,
    max_quantity: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: "item_weight",
  });
  return ItemWeight;
};

