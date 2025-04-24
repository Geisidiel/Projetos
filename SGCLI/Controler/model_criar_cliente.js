const sequelize_db = require('../Banco/db');
const { DataTypes } = require('sequelize');
const Usuario= require('./model_criar_usuario')


// Modelo Cliente
const cliente = sequelize_db.define('cliente', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    
    },
    cliente: {
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


//cliente.sync({ force: true });
cliente.belongsTo(Usuario, { foreignKey: 'userId'});
module.exports = cliente;

