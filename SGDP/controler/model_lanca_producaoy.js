
const sequelize_db = require('../db/conexão')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');

// models/Usuario.js

const Producao = sequelize_db.define(
    'Producao', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    data: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    unidade: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    atividade: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    horario: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    producao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    meta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    eficiencia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    gap: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    n_lote: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    observacao: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    ocorrencia: {
        type: DataTypes.STRING,
        allowNull: false,
        
    }, type: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//Producao.sync({force: true});
module.exports = Producao;