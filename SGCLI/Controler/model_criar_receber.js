
const sequelize_db = require('../Banco/db')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');

// models/Usuario.js

const Receber = sequelize_db.define(
    'Receber', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    n_caixa: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    Localidade: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'caixarecebida'
        
    },
    userId:{
            type: DataTypes.INTEGER,
            allowNull: false,
        }

}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//Receber.sync({force: true});
module.exports = Receber;