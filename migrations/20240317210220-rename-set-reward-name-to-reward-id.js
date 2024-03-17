'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn("sets", "redeem_name", "redeem_id");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn("sets", "redeem_id", "redeem_name");
  }
};
