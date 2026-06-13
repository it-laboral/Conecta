-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-06-2026 a las 18:41:52
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
  `password` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empresa`
--

INSERT INTO `empresa` (`id_empresa`, `razonSocial`, `fantasia`, `organizacion`, `cuit`, `sector`, `pais`, `provincia`, `ciudad`, `cp`, `calle`, `numero`, `piso`, `dpto`, `email`, `web`, `telefono`, `responsable`, `password`) VALUES
(1, 'Tecnosolution', 'Conectando', 'S.H.', '33-18999777-0', 'Tecnologia', 'Argentina', 'Buenos Aires', 'Valentin Alsina', 1822, 'Chile', 1200, 0, '0', 'info@tecnosolution.com.ar', 'tecnosolution.com.ar', '011-7575-5757', 'Marisa Morales', 'Tecno2026'),
(2, 'TecMach', 'Nexora', 'S.R.L.', '30-33444555-6', 'Tecnologia', 'Argentina', 'Buenos Aires', 'San Martin', 1753, 'Roca', 1000, 1, 'A', 'rrhh@nexora.com.ar', 'nexora.com.ar', '011-7373-2525', 'Alba Angular', 'Nexora26'),
(3, 'Orbita', '', 'S.A.', '33-30999888-3', 'Comunicacion', 'Argentina', 'Córdoba', 'Dolores', 3050, 'Pampa', 3500, 0, '0', 'admin@orbita.com.ar', 'orbita.com.ar', '0353-303030', 'Luis Campos', 'Orbita26'),
(4, 'Luminar ', 'LumiLoks', 'S.A.', '33-25444222-4', 'Comunicacion', 'Argentina', 'Buenos Aires', 'Mar del Plata', 2888, 'Costanera Sur', 222, 0, '0', 'rrhh@luminar.com.ar', 'luminar.com.ar', '02228-333333', 'Maximo Paz', 'Lumi2026'),
(5, 'Telecentro', 'CableTele', 'S.A', '30-30333666-5', 'Comunicaciones', 'Argentina', 'Santa Fe', 'Rosario', 4300, 'Belgrano', 200, 3, 'A', 'rrhh@telecentro.com.ar', 'telecentro@com.ar', '0344-5555533', 'Mariano Sanchez', 'Cable2026');

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
(1, 1, 'Desarrollador Angular 21', 'Buscamos estudiantes en su ultimo año de la carrera para sumarse al equipo de proyectos', 'Remoto', 'Junior', '2026-06-09 18:12:10', 15),
(3, 2, 'Asistente de Base de Datos', 'Pruebas soporte de scripts en SQL Server y documentación... Ejecutar y validar scripts. Documentar resultados. Colaborar con equipo desarrollo. Ofrecemos remuneracion acorde carga horaria y experiencia. Capacitación constante. Ambiente de aprendizaje', 'Híbrido', 'Trainee', '2026-06-09 18:18:00', 15),
(100, 1, 'Desarrollador IA', 'Jovenes para integrarse al equipo de desarrolladores y entrenadores\nExcelente remuneracion y beneficios', 'Híbrido', 'Junior', '2026-06-11 18:32:26', 19),
(101, 1, 'Analista de Sistemas', 'Sus tareas serán:liderar y coordinar equipos, interactuar con clientes, analizar proyectos.\nExcelente remuneracion y multiple beneficios acorde a la tarea y cargo', 'Híbrido', 'Semi-Senior', '2026-06-11 19:36:04', 20),
(102, 1, 'Desarrollador y Analista', 'Tareas cumplir con requerimientos, diseños, diagramas, documentacion. \nBeneficios acordes a sus tareas. \nExcelente clima de trabajo', 'Presencial', 'Junior', '2026-06-11 20:06:54', 10),
(103, 3, 'Analista IA y Machine Learning', 'Persona capacitada para: Analizar grandes volúmenes de datos para identificar patrones, tendencias y oportunidades de negocio.\nDiseñar, entrenar y optimizar modelos de Deep Learning (redes neuronales, CNN, RNN, Transformers, etc.).\nRealizar limpieza, transformación y preparación de datos para modelado.', 'Remoto', 'Semi-Senior', '2026-06-12 16:32:21', 15);

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
(1, 1),
(1, 2),
(3, 3),
(3, 4),
(100, 13),
(100, 14),
(100, 18),
(101, 3),
(101, 4),
(101, 5),
(101, 6),
(102, 4),
(102, 5),
(102, 6),
(103, 12),
(103, 13),
(103, 15);

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
(5, 'Maria Mercedes', 'Marin', 30222333, 9999, 'IA', '30222333@ibeltran.com.ar', 'Mecha2026'),
(6, 'Aida', 'Juarez', 29222333, 9500, 'IA', 'aidaj@ibeltran.com.ar', 'Aida2028');

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
-- Indices de la tabla `postulante`
--
ALTER TABLE `postulante`
  ADD PRIMARY KEY (`id_postulante`);

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
-- AUTO_INCREMENT de la tabla `categoria_skill`
--
ALTER TABLE `categoria_skill`
  MODIFY `categoria_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `empresa`
--
ALTER TABLE `empresa`
  MODIFY `id_empresa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ofertas`
--
ALTER TABLE `ofertas`
  MODIFY `id_oferta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT de la tabla `postulante`
--
ALTER TABLE `postulante`
  MODIFY `id_postulante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- Filtros para la tabla `skill`
--
ALTER TABLE `skill`
  ADD CONSTRAINT `FK` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_skill` (`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
