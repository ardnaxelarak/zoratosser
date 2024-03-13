'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex("images", {
      name: "twitch_id_name",
      fields: ["channel_twitch_id", "name"],
      unique: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex("images", "twitch_id_name");
  }
};
