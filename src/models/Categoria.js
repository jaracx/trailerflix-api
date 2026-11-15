const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'categorias',
  timestamps: false,
});

module.exports = Categoria;
