
const sequelize_db = require('../Banco/db')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');
const Usuario = require('./model_criar_usuario')

// models/Usuario.js

const Tipodocumento = sequelize_db.define(
    'Tipodocumento', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    tipodocumento: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    userId:{
            type: DataTypes.INTEGER,
            allowNull: false,
    }

}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//Tipodocumento.sync({force: true});
Tipodocumento.belongsTo(Usuario, { foreignKey: 'userId'});
module.exports = Tipodocumento;