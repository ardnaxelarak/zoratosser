'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('item_weights', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      item_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      set_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      weight: {
        allowNull: false,
        type: Sequelize.DOUBLE,
      },
      max_quantity: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('item_weights');
  }
};
