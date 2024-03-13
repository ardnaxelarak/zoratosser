'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      twitch_id: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      twitch_display_name: {
        type: Sequelize.STRING,
      },
      access_token: {
        type: Sequelize.STRING,
      },
      refresh_token: {
        type: Sequelize.STRING,
      },
      zora_host: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
