'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("user_items", {
      name: "user_items_fkey_channel",
      type: "foreign key",
      fields: ["channel_id"],
      references: {
        table: "users",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("user_items", "user_items_fkey_channel");
  }
};
