const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Genero = sequelize.define('Genero', {
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
  tableName: 'generos',
  timestamps: false,
});

module.exports = Genero;
