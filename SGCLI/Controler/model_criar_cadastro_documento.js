
const sequelize_db = require('../Banco/db')
//const Sequelize = require('sequelize')
const { DataTypes } = require('sequelize');
const Cliente = require('./model_criar_cliente')
const Categoria = require('./model_criar_categoria')
const Subcategoria = require('./model_criar_subcategoria')
const Usuario = require('./model_criar_usuario')

// models/Usuario.js

const Documento = sequelize_db.define(
    'Documento', {
    // Definindo os campos da 
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey: true
    },
    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    lote: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    categoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    subcategoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    tipodocumento: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    processo: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    volume: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: false,
        
    },
    qtdfolhas: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    localidade: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'lotedocumentalcadastrado'
        
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
    }

}, {
    // Outras opções do modelo
    timestamps: true, // Adiciona createdAt e updatedAt
});
//Documento.sync({force: true});
Documento.belongsTo(Cliente, { foreignKey: 'clienteId' });
Documento.belongsTo(Categoria, { foreignKey: 'categoriaId'});
Documento.belongsTo(Subcategoria, { foreignKey: 'subcategoriaId'});
Documento.belongsTo(Usuario, { foreignKey: 'userId'});

module.exports = Documento;