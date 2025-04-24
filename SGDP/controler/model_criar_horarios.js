
const sequelize_db = require('../db/conexão')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');

// models/Usuario.js

const Horario = sequelize_db.define(
    'Horario', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    Horario: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },

}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//Horario.sync({force: true});
module.exports = Horario;