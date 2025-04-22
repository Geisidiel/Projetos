
const sequelize_db = require('../db/conexão')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');

// models/Usuario.js

const Meta_atividade = sequelize_db.define(
    'Meta_atividade', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    atividade: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    meta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    }
    
}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//Meta_atividade.sync({force: true});
module.exports = Meta_atividade;