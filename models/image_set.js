"use strict";
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ImageSet extends Model {
    static associate(models) {
      ImageSet.hasMany(models.image, { as: "images", foreignKey: "image_set_id", targetKey: "id" });
    }
    sanitize() {
      return {
        name: this.name,
        description: this.description,
        images: this.images ? this.images.map(m => m.sanitize()) : null,
      };
    }
  }
  ImageSet.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    sequelize,
    modelName: "image_set",
  });
  return ImageSet;
};

