'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Altera a coluna loteId de STRING para INTEGER na tabela Documentos
    await queryInterface.changeColumn('Documentos', 'loteId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Reverte a alteração: volta a ser STRING
    await queryInterface.changeColumn('Documentos', 'loteId', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
