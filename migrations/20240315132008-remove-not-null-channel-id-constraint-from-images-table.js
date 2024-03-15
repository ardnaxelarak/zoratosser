'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('images', 'channel_twitch_id', {
      allowNull: true,
      type: Sequelize.STRING,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('images', 'channel_twitch_id', {
      allowNull: false,
      type: Sequelize.STRING,
    });
  }
};
