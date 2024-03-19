'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("images", {
      name: "images_fkey_image_set",
      type: "foreign key",
      fields: ["image_set_id"],
      references: {
        table: "image_sets",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("images", "images_fkey_image_set");
  }
};
