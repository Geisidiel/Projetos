
const sequelize_db = require('../Banco/db')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');
const Usuario = require('./model_criar_usuario')


// models/Usuario.js

const vincular = sequelize_db.define(
    'vincular', {
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
    n_caixa: {
            type: DataTypes.STRING,
            allowNull: false,
            
     },
     n_caixa_secundary: {
        type: DataTypes.STRING,
        allowNull: true,
    
    },
    n_rfid: {
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
//vincular.sync({force: true});
vincular.belongsTo(Usuario, { foreignKey: 'userId'});
module.exports = vincular;