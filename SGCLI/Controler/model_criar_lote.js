
const sequelize_db = require('../Banco/db')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');
const Usuario = require('./model_criar_usuario')

// models/Usuario.js

const Lote = sequelize_db.define(
    'Lote', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    n_lote: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    localidade: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'lotedisponivel'
            
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//Lote.sync({force: true});
Lote.belongsTo(Usuario, { foreignKey: 'userId'});
module.exports = Lote;