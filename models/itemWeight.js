"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ItemWeight extends Model {
    static associate(models) {
      ItemWeight.belongsTo(models.set, { as: "set", foreignKey: "set_id", targetKey: "id" });
      ItemWeight.belongsTo(models.item, { as: "item", foreignKey: "item_id", targetKey: "id" });
    }
    sanitize() {
      return {
        set: this.set.name,
        item: this.item.name,
        weight: this.weight,
        max_quantity: this.max_quantity,
      };
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

