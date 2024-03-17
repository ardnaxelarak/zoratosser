'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex("users", {
      name: "twitch_lower_name",
      fields: ["twitch_lower_name"],
      unique: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex("users", "twitch_lower_name");
  }
};
