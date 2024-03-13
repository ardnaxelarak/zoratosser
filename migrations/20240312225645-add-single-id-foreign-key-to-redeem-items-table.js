'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("items", {
      name: "items_fkey_single_id",
      type: "foreign key",
      fields: ["single_id"],
      references: {
        table: "items",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("items", "items_fkey_single_id");
  }
};
