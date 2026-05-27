-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-05-2026 a las 00:23:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `conecta`
--
CREATE DATABASE IF NOT EXISTS `conecta` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `conecta`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresa`
--

CREATE TABLE `empresa` (
  `id_empresa` int(11) NOT NULL,
  `razonSocial` varchar(30) NOT NULL,
  `fantasia` varchar(40) NOT NULL,
  `organizacion` varchar(30) NOT NULL,
  `cuit` varchar(20) NOT NULL,
  `sector` varchar(30) NOT NULL,
  `pais` varchar(30) NOT NULL,
  `provincia` varchar(30) NOT NULL,
  `ciudad` varchar(30) NOT NULL,
  `cp` int(11) NOT NULL,
  `calle` varchar(40) NOT NULL,
  `numero` int(11) NOT NULL,
  `piso` int(11) NOT NULL,
  `dpto` varchar(10) DEFAULT NULL,
  `email` varchar(30) NOT NULL,
  `web` varchar(40) NOT NULL,
  `telefono` varchar(40) NOT NULL,
  `responsable` varchar(30) NOT NULL,
  `password` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empresa`
--

INSERT INTO `empresa` (`id_empresa`, `razonSocial`, `fantasia`, `organizacion`, `cuit`, `sector`, `pais`, `provincia`, `ciudad`, `cp`, `calle`, `numero`, `piso`, `dpto`, `email`, `web`, `telefono`, `responsable`, `password`) VALUES
(1, 'Tecnosolution', 'Conectando', 'S.H.', '33-18999777-0', 'Tecnologia', 'Argentina', 'Buenos Aires', 'Valentin Alsina', 1822, 'Chile', 1200, 0, '0', 'info@tecnosolution.com.ar', 'tecnosolution.com.ar', '011-7575-5757', 'Marisa Morales', 'Tecno2026'),
(2, 'TecMach', 'Nexora', 'S.R.L.', '30-33444555-6', 'Tecnologia', 'Argentina', 'Buenos Aires', 'San Martin', 1753, 'Roca', 1000, 1, 'A', 'rrhh@nexora.com.ar', 'nexora.com.ar', '011-7373-2525', 'Alba Angular', 'Nexora26'),
(3, 'Orbita', '', 'S.A.', '33-30999888-3', 'Comunicacion', 'Argentina', 'Córdoba', 'Dolores', 3050, 'Pampa', 3500, 0, '0', 'admin@orbita.com.ar', 'orbita.com.ar', '0353-303030', 'Luis Campos', 'Orbita26'),
(4, 'Luminar ', 'LumiLoks', 'S.A.', '33-25444222-4', 'Comunicacion', 'Argentina', 'Buenos Aires', 'Mar del Plata', 2888, 'Costanera Sur', 222, 0, '0', 'rrhh@luminar.com.ar', 'luminar.com.ar', '02228-333333', 'Maximo Paz', 'Lumi2026');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante`
--

CREATE TABLE `postulante` (
  `id_postulante` int(11) NOT NULL,
  `nombres` varchar(30) NOT NULL,
  `apellidos` varchar(30) NOT NULL,
  `dni` int(11) NOT NULL,
  `legajo` int(11) NOT NULL,
  `carrera` varchar(30) NOT NULL,
  `email` varchar(40) NOT NULL,
  `password` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `postulante`
--

INSERT INTO `postulante` (`id_postulante`, `nombres`, `apellidos`, `dni`, `legajo`, `carrera`, `email`, `password`) VALUES
(1, 'Juan Pablo', 'Perez Perez', 10000000, 10000, 'Analista de Sistema', '10000000@itbeltran.com.ar', 'Beltran2026'),
(2, 'Ana', 'Beltran', 12444555, 8008, 'Analista de Sistemas', 'anabel@itbeltran.com.ar', 'Beltran2026'),
(3, 'Alba', 'Amanecer', 12444555, 8000, 'Analista de Sistemas', 'albaam@itbeltran.com.ar', 'Alba2026'),
(4, 'Carlos', 'Castaño', 15333444, 8500, 'IA', 'carlosc@itbeltran.com.ar', 'Carlos2026'),
(5, 'Maria Mercedes', 'Marin', 30222333, 9999, 'IA', '30222333@ibeltran.com.ar', 'Mecha2026');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD PRIMARY KEY (`id_empresa`);

--
-- Indices de la tabla `postulante`
--
ALTER TABLE `postulante`
  ADD PRIMARY KEY (`id_postulante`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `id_empresa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `postulante`
--
ALTER TABLE `postulante`
  MODIFY `id_postulante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
