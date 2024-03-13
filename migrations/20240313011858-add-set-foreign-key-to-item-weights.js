'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("item_weights", {
      name: "item_weights_fkey_set_id",
      type: "foreign key",
      fields: ["set_id"],
      references: {
        table: "sets",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("item_weights", "item_weights_fkey_set_id");
  }
};
