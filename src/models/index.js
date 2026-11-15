const Categoria = require('./Categoria');
const Genero = require('./Genero');
const Actor = require('./Actor');
const Contenido = require('./Contenido');

// Relación 1:N (Categoría -> Contenido)
Contenido.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });
Categoria.hasMany(Contenido, { foreignKey: 'id_categoria', as: 'contenidos' });

// Relación N:M (Contenido <-> Géneros)
Contenido.belongsToMany(Genero, {
  through: 'contenido_generos',
  foreignKey: 'id_contenido',
  otherKey: 'id_genero',
  timestamps: false,
  as: 'generos',
});
Genero.belongsToMany(Contenido, {
  through: 'contenido_generos',
  foreignKey: 'id_genero',
  otherKey: 'id_contenido',
  timestamps: false,
  as: 'contenidos',
});

// Relación N:M (Contenido <-> Actores)
Contenido.belongsToMany(Actor, {
  through: 'contenido_actores',
  foreignKey: 'id_contenido',
  otherKey: 'id_actor',
  timestamps: false,
  as: 'actores',
});
Actor.belongsToMany(Contenido, {
  through: 'contenido_actores',
  foreignKey: 'id_actor',
  otherKey: 'id_contenido',
  timestamps: false,
  as: 'contenidos',
});

module.exports = { Categoria, Genero, Actor, Contenido };
