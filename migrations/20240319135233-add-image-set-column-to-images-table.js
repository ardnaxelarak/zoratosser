'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("images", "image_set_id", Sequelize.INTEGER);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("images", "image_set_id");
  }
};
