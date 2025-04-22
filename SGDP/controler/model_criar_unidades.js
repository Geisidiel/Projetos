
const sequelize_db = require('../db/conexão')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');

// models/Usuario.js

const Unidades = sequelize_db.define(
    'Unidades', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    unidades: {
        type: DataTypes.STRING,
        allowNull: false,
    
    },
    
}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//Unidades.sync({force: true});
module.exports = Unidades;