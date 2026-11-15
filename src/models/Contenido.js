const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Contenido = sequelize.define('Contenido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  sinopsis: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  temporadas: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  poster: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  trailer: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'contenido',
  timestamps: false,
});

module.exports = Contenido;
