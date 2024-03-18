'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("user_items", {
      name: "user_items_fkey_item",
      type: "foreign key",
      fields: ["item_id"],
      references: {
        table: "items",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("user_items", "user_items_fkey_item");
  }
};
