'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex("Users", {
      name: "users_twitch_id",
      fields: ["twitch_id"],
      unique: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex("Users", "users_twitch_id");
  }
};
