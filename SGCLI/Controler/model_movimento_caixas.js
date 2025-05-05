
const sequelize_db = require('../Banco/db')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');
const Vincular = require('./model_criar_vinculos')
const Usuario = require('./model_criar_usuario')

// models/Usuario.js

const movicaixa = sequelize_db.define(
    'movicaixa', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    n_rfid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    userId:{
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
//movicaixa.sync({force: true});
//movicaixa.belongsTo(Vincular, { foreignKey: 'clienteId' });
movicaixa.belongsTo(Usuario, { foreignKey: 'userId'});
module.exports = movicaixa;