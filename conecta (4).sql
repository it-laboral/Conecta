-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-08-2026 a las 23:40:37
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administrador`
--

INSERT INTO `administrador` (`id`, `nombre`, `email`, `password`, `creado_en`) VALUES
(3, 'Admin Conecta', 'admin@itbconecta.com.ar', '$2b$10$tY2SMNfv0Kg1ITVzZeeg9uHtW97M7y7xNS8hwLnMafr/i4AW5Q.H6', '2026-08-14 18:06:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria_skill`
--

CREATE TABLE `categoria_skill` (
  `categoria_id` int(11) NOT NULL,
  `Nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria_skill`
--

INSERT INTO `categoria_skill` (`categoria_id`, `Nombre`) VALUES
(1, 'Analista de Sistema & Desarrollo'),
(2, 'Inteligencia Artificial & Datos');

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
  `password` varchar(255) NOT NULL,
  `estado` enum('Pendiente','Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empresa`
--

INSERT INTO `empresa` (`id_empresa`, `razonSocial`, `fantasia`, `organizacion`, `cuit`, `sector`, `pais`, `provincia`, `ciudad`, `cp`, `calle`, `numero`, `piso`, `dpto`, `email`, `web`, `telefono`, `responsable`, `password`, `estado`) VALUES
(6, 'TecnoSolution', '', 'S.A.', '30-22333444-1', 'Tecnologia', 'Argentina', 'Buenos Aires', 'Avellaneda', 1870, 'Av. Belgrano', 1800, 0, '0', 'info@tecnosolution.com.ar', 'www,tecnosolution.com.ar', '011-2223234444', 'Alba Gonzalez', '$2b$10$Osiqm3NsY/Ni59Khg.k..efY.2Uh0qj.uWVEo3UCl04c.x2.m46ie', 'Activo'),
(7, 'Nexora', 'TechMach', 'S.R.L', '30-25444555-6', 'Comunicaciones', 'Argentina', 'Buenos Aires', 'Lomas de Zamora', 1832, 'Amancay', 1555, 1, 'A', 'rrhh@nexora.com.ar', 'www.nexora.com.ar', '011-78896565', 'Alberto Facundo', '$2b$10$tpNppIVQ/R/QWmmN5A5j6.nDGvi0jGYV.iY53QqPgdT0.cn7ETCry', 'Activo'),
(8, 'Orbita', '', 'S.R.L', '30-27666555-4', 'Tecnologia', 'Argentina', 'Buenos Aires', 'Lanus', 1824, '25 de Mayo', 2000, 0, '0', 'admin@orbita.com.ar', 'www.orbita.com.ar', '011-76764545', 'Sonia Aguirre', '$2b$10$ZH07scYGJKB.ocs4CLxjXe4DjwbI8HHsw0BO8TttZkMh/w9a6meHq', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ofertas`
--

CREATE TABLE `ofertas` (
  `id_oferta` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `titulo` varchar(30) NOT NULL,
  `descripcion` text NOT NULL,
  `modalidad` enum('Presencial','Remoto','Híbrido','') NOT NULL,
  `experiencia` enum('Trainee','Junior','Semi-Senior','Senior') NOT NULL,
  `fecha_publicacion` datetime NOT NULL DEFAULT current_timestamp(),
  `dias_duracion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ofertas`
--

INSERT INTO `ofertas` (`id_oferta`, `id_empresa`, `titulo`, `descripcion`, `modalidad`, `experiencia`, `fecha_publicacion`, `dias_duracion`) VALUES
(106, 6, 'Asistente de Base de Datos', 'Buscamos estudiantes avanzados o graduados, Para incorporarse al equipo dedicados al analisis de datos y BD. Excelente ambiente de trabajo. Remuneracion y beneficios a convenir', 'Presencial', 'Trainee', '2026-08-13 18:30:31', 15),
(109, 6, 'Analista de Sistema', 'Jovenes estudiantes avanzados o graduados para integrarse al equipo de desarrolloParticipar en la implementación y mantenimiento de sistemas.\nColaborar con equipos de desarrollo, infraestructura y negocio.\nGenerar reportes e indicadores para la toma de decisiones.\nDar seguimiento a proyectos tecnológicos y mejoras continuas. Salario competitivo acorde a la experiencia y formación.', 'Híbrido', 'Junior', '2026-08-13 19:09:52', 14),
(110, 7, 'Analista de Datos', 'Buscamos personas con vocación por el análisis de datos, el aprendizaje automático y las nuevas tecnologías, con ganas de desarrollarse profesionalmente en proyectos de alto impacto.\nDiseñar y desarrollar modelos predictivos y algoritmos de Machine Learning.\nAnalizar grandes volúmenes de información para detectar patrones y tendencias.\nCrear dashboards e informes ejecutivos.\nParticipar en proyectos de Inteligencia Artificial Generativa.\nSalario competitivo acorde al mercado.\nRevisión salarial periódica.\nBono anual por objetivos.', 'Híbrido', 'Trainee', '2026-08-14 13:12:41', 19);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oferta_skill`
--

CREATE TABLE `oferta_skill` (
  `id_oferta` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `oferta_skill`
--

INSERT INTO `oferta_skill` (`id_oferta`, `skill_id`) VALUES
(109, 1),
(109, 2),
(109, 3),
(109, 9),
(110, 10),
(110, 12),
(110, 13),
(110, 16),
(110, 18);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil_empresa`
--

CREATE TABLE `perfil_empresa` (
  `id_perfil` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `trayectoria` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil_postulante`
--

CREATE TABLE `perfil_postulante` (
  `id_perfil` int(11) NOT NULL,
  `id_postulante` int(11) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulacion`
--

CREATE TABLE `postulacion` (
  `id_postulacion` int(11) NOT NULL,
  `id_postulante` int(11) NOT NULL,
  `id_oferta` int(11) NOT NULL,
  `fecha_postulacion` datetime DEFAULT current_timestamp(),
  `estado` enum('Pendiente','En Revisión','Aceptado','Rechazado') DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `password` varchar(255) NOT NULL,
  `estado` enum('Pendiente','Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `postulante`
--

INSERT INTO `postulante` (`id_postulante`, `nombres`, `apellidos`, `dni`, `legajo`, `carrera`, `email`, `password`, `estado`) VALUES
(7, 'Azucena', 'Garcia', 19200200, 10106, 'Analista de Sistema', 'azucenag@itbeltran.com.ar', '$2b$10$jdYY3GdaIdRBxk8o9y1hhOQMgkKIOXJ/aX6esYncM6t2ECu4CA7IG', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante_skill`
--

CREATE TABLE `postulante_skill` (
  `id_postulante` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `skill`
--

CREATE TABLE `skill` (
  `skill_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `skill`
--

INSERT INTO `skill` (`skill_id`, `categoria_id`, `nombre`) VALUES
(1, 1, 'Angular'),
(2, 1, 'Node.js'),
(3, 1, 'MySQL'),
(4, 1, 'PostgreSQL'),
(5, 1, 'Git / GitHub'),
(6, 1, 'Metodologías Ágiles'),
(7, 1, 'TypeScript'),
(8, 1, 'JavaScript'),
(9, 1, 'HTML & CSS / SCSS'),
(10, 2, 'Python'),
(11, 2, 'TensorFlow'),
(12, 2, 'Machine Learning'),
(13, 2, 'Deep Learning'),
(14, 2, 'Prompt Engineering'),
(15, 2, 'Power BI'),
(16, 2, 'Ciencia de Datos'),
(17, 2, 'SQL Server'),
(18, 2, 'Modelos de Lenguaje (LLMs)');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `categoria_skill`
--
ALTER TABLE `categoria_skill`
  ADD PRIMARY KEY (`categoria_id`);

--
-- Indices de la tabla `empresa`
--
ALTER TABLE `empresa`
  ADD PRIMARY KEY (`id_empresa`);

--
-- Indices de la tabla `ofertas`
--
ALTER TABLE `ofertas`
  ADD PRIMARY KEY (`id_oferta`),
  ADD KEY `Foreign Key` (`id_empresa`);

--
-- Indices de la tabla `oferta_skill`
--
ALTER TABLE `oferta_skill`
  ADD PRIMARY KEY (`id_oferta`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indices de la tabla `perfil_empresa`
--
ALTER TABLE `perfil_empresa`
  ADD PRIMARY KEY (`id_perfil`),
  ADD KEY `id_empresa` (`id_empresa`);

--
-- Indices de la tabla `perfil_postulante`
--
ALTER TABLE `perfil_postulante`
  ADD PRIMARY KEY (`id_perfil`),
  ADD KEY `id_postulante` (`id_postulante`);

--
-- Indices de la tabla `postulacion`
--
ALTER TABLE `postulacion`
  ADD PRIMARY KEY (`id_postulacion`),
  ADD UNIQUE KEY `unique_postulacion` (`id_postulante`,`id_oferta`),
  ADD KEY `id_oferta` (`id_oferta`);

--
-- Indices de la tabla `postulante`
--
ALTER TABLE `postulante`
  ADD PRIMARY KEY (`id_postulante`);

--
-- Indices de la tabla `postulante_skill`
--
ALTER TABLE `postulante_skill`
  ADD PRIMARY KEY (`id_postulante`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indices de la tabla `skill`
--
ALTER TABLE `skill`
  ADD PRIMARY KEY (`skill_id`),
  ADD KEY `FK` (`categoria_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `categoria_skill`
--
ALTER TABLE `categoria_skill`
  MODIFY `categoria_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `id_empresa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `ofertas`
--
ALTER TABLE `ofertas`
  MODIFY `id_oferta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT de la tabla `postulacion`
--
ALTER TABLE `postulacion`
  MODIFY `id_postulacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `postulante`
--
ALTER TABLE `postulante`
  MODIFY `id_postulante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `skill`
--
ALTER TABLE `skill`
  MODIFY `skill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ofertas`
--
ALTER TABLE `ofertas`
  ADD CONSTRAINT `Foreign Key` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `oferta_skill`
--
ALTER TABLE `oferta_skill`
  ADD CONSTRAINT `oferta_skill_ibfk_1` FOREIGN KEY (`id_oferta`) REFERENCES `ofertas` (`id_oferta`) ON DELETE CASCADE,
  ADD CONSTRAINT `oferta_skill_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `postulacion`
--
ALTER TABLE `postulacion`
  ADD CONSTRAINT `postulacion_ibfk_1` FOREIGN KEY (`id_postulante`) REFERENCES `postulante` (`id_postulante`) ON DELETE CASCADE,
  ADD CONSTRAINT `postulacion_ibfk_2` FOREIGN KEY (`id_oferta`) REFERENCES `ofertas` (`id_oferta`) ON DELETE CASCADE;

--
-- Filtros para la tabla `postulante_skill`
--
ALTER TABLE `postulante_skill`
  ADD CONSTRAINT `postulante_skill_ibfk_1` FOREIGN KEY (`id_postulante`) REFERENCES `postulante` (`id_postulante`) ON DELETE CASCADE,
  ADD CONSTRAINT `postulante_skill_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `skill`
--
ALTER TABLE `skill`
  ADD CONSTRAINT `FK` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_skill` (`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
