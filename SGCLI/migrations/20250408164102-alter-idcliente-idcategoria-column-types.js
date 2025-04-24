'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alterar as colunas 'idcliente' e 'idcategoria' para o tipo INTEGER
    await queryInterface.changeColumn('categoria', 'idcliente', {
      type: Sequelize.INTEGER,  // Tipo alterado para INTEGER
      allowNull: false,         // A coluna não pode ser nula
    });

    await queryInterface.changeColumn('subcategoria', 'idcategoria', {
      type: Sequelize.INTEGER,  // Tipo alterado para INTEGER
      allowNull: false,         // A coluna não pode ser nula
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter as alterações para o tipo VARCHAR, caso a migração precise ser desfeita
    await queryInterface.changeColumn('categoria', 'idcliente', {
      type: Sequelize.STRING,   // Revertido para STRING
      allowNull: false,         // A coluna não pode ser nula
    });

    await queryInterface.changeColumn('subcategoria', 'idcategoria', {
      type: Sequelize.STRING,   // Revertido para STRING
      allowNull: false,         // A coluna não pode ser nula
    });
  }
};

