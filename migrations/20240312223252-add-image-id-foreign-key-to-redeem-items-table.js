'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("items", {
      name: "items_fkey_image_id",
      type: "foreign key",
      fields: ["image_id"],
      references: {
        table: "images",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("items", "items_fkey_image_id");
  }
};
