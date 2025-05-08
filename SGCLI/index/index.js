// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../Banco/db');

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Carregue todos os modelos

db.Documento = require('../Controler/model_criar_cadastro_documento');
db.vincular = require('../Controler/model_criar_vinculos');

// Defina associações aqui
db.Documento.belongsTo(db.vincular, {
    foreignKey: 'loteId',
    targetKey: 'loteId',
    as: 'vinculo'
});

db.vincular.hasMany(db.Documento, {
    foreignKey: 'loteId',
    sourceKey: 'loteId',
    as: 'documentos'
});

module.exports = db;
