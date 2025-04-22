const sequelize_db = require('../Banco/db');
const { DataTypes } = require('sequelize');
const cliente = require('./model_criar_cliente')


// Modelo Categoria
const categoria = sequelize_db.define('categoria', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    idcliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey:true,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId:{
        type: DataTypes.INTEGER,
         allowNull: false,
    }
    
}, {
    timestamps: true, // Adiciona createdAt e updatedAt
});
//categoria.sync({ force: true });
cliente.hasMany(categoria, { foreignKey: 'idcliente' });
categoria.belongsTo(cliente, { foreignKey: 'idcliente' });
module.exports = categoria;
