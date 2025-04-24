
const sequelize_db = require('../db/conexão')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');

// models/Usuario.js

const Usuario = sequelize_db.define(
    'Usuarios', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    cpf: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    unidade: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    senha: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//Usuario.sync({force: true});
module.exports = Usuario;