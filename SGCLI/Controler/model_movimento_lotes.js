
const sequelize_db = require('../Banco/db')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');
const Lote = require('./model_criar_lote')
const Usuario = require('./model_criar_usuario')

// models/Usuario.js

const movilotes = sequelize_db.define(
    'movilotes', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    n_loteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    qtdfolhas:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    localidade: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },

}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//movilotes.sync({force: true});
movilotes.belongsTo(Lote, { foreignKey: 'n_loteId' });
movilotes.belongsTo(Usuario, { foreignKey: 'userId'});

module.exports = movilotes;
