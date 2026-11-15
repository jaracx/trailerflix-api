// Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS trailerflix_db;
USE trailerflix_db;
CREATE TABLE IF NOT EXISTS `categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(50) NOT NULL,
	PRIMARY KEY (`id`)
);
// Tablas principales
CREATE TABLE IF NOT EXISTS `generos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(50) NOT NULL,
	PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `actores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre_completo` varchar(100) NOT NULL,
	PRIMARY KEY (`id`)
);
// Tablas intermedias (Relaciones N:M)
CREATE TABLE IF NOT EXISTS `contenido` (
	`id` int NOT NULL,
	`titulo` varchar(150) NOT NULL,
	`sinopsis` text NOT NULL,
	`temporadas` int,
	`poster` varchar(255) NOT NULL,
	`trailer` varchar(255) NOT NULL,
	`id_categoria` int NOT NULL,
	PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `contenido_generos` (
	`id_contenido` int NOT NULL,
	`id_genero` int NOT NULL,
	PRIMARY KEY (`id_contenido`, `id_genero`)
);
CREATE TABLE IF NOT EXISTS `contenido_actores` (
	`id_contenido` int NOT NULL,
	`id_actor` int NOT NULL,
	PRIMARY KEY (`id_contenido`, `id_actor`)
);
// Relaciones (Foreign Keys)
ALTER TABLE `contenido` ADD CONSTRAINT `contenido_fk6` FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id`);
ALTER TABLE `contenido_generos` ADD CONSTRAINT `contenido_generos_fk0` FOREIGN KEY (`id_contenido`) REFERENCES `contenido`(`id`);
ALTER TABLE `contenido_generos` ADD CONSTRAINT `contenido_generos_fk1` FOREIGN KEY (`id_genero`) REFERENCES `generos`(`id`);
ALTER TABLE `contenido_actores` ADD CONSTRAINT `contenido_actores_fk0` FOREIGN KEY (`id_contenido`) REFERENCES `contenido`(`id`);
ALTER TABLE `contenido_actores` ADD CONSTRAINT `contenido_actores_fk1` FOREIGN KEY (`id_actor`) REFERENCES `actores`(`id`);