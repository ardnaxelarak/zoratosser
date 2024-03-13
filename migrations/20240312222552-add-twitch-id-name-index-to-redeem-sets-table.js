'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex("sets", {
      name: "twitch_id_name",
      fields: ["channel_twitch_id", "name"],
      unique: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex("sets", "twitch_id_name");
  }
};
