'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      channel_twitch_id: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      image_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      single_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      single_quantity: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      weigh_by_remainder: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('items');
  }
};
