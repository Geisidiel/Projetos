
const sequelize_db = require('../Banco/db')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');

// models/Usuario.js

const User = sequelize_db.define(
    'User', {
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
    sobrenome: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
        
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    age: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '0'
        
    },
   
}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//User.sync({force: true});
module.exports = User;