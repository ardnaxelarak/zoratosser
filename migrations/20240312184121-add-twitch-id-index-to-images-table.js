'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex("Images", {
      name: "images_twitch_id",
      fields: ["channel_twitch_id"],
      unique: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex("Images", "images_twitch_id");
  }
};
