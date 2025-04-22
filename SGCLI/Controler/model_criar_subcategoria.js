const sequelize_db = require('../Banco/db');
const { DataTypes } = require('sequelize');
const categoria = require('./model_criar_categoria');  // Ajuste o caminho conforme necessário

// Modelo Subcategoria
const subcategoria = sequelize_db.define('subcategoria', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    idcategoria: {
        type: DataTypes.INTEGER,     
        allowNull: false,
        foreignKey:true,
    },
    subcategoria: {
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
//subcategoria.sync({ force: true });
categoria.hasMany(subcategoria, { foreignKey: 'idcategoria' });
subcategoria.belongsTo(categoria, { foreignKey: 'idcategoria' });
module.exports = subcategoria;
