'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("images", {
      name: "images_fkey_twitch_id",
      type: "foreign key",
      fields: ["channel_twitch_id"],
      references: {
        table: "users",
        field: "twitch_id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("images", "images_fkey_twitch_id");
  }
};
