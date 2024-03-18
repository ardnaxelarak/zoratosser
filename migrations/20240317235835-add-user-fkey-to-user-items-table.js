'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("user_items", {
      name: "user_items_fkey_user",
      type: "foreign key",
      fields: ["user_id"],
      references: {
        table: "users",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("user_items", "user_items_fkey_user");
  }
};
