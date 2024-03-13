'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex("items", {
      name: "twitch_id",
      fields: ["channel_twitch_id"],
      unique: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex("items", "twitch_id");
  }
};
