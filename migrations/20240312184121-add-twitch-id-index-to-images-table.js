'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex("images", {
      name: "twitch_id",
      fields: ["channel_twitch_id"],
      unique: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex("images", "twitch_id");
  }
};
