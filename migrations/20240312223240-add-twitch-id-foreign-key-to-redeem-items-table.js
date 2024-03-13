'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("items", {
      name: "items_fkey_twitch_id",
      type: "foreign key",
      fields: ["channel_twitch_id"],
      references: {
        table: "users",
        field: "twitch_id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("items", "items_fkey_twitch_id");
  }
};
