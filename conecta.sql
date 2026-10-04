-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-10-2026 a las 20:32:49
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
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria_skill`
--

INSERT INTO `categoria_skill` (`categoria_id`, `nombre`) VALUES
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
(110, 7, 'Analista de Datos', 'Buscamos personas con vocación por el análisis de datos, el aprendizaje automático y las nuevas tecnologías, con ganas de desarrollarse profesionalmente en proyectos de alto impacto.\nDiseñar y desarrollar modelos predictivos y algoritmos de Machine Learning.\nAnalizar grandes volúmenes de información para detectar patrones y tendencias.\nCrear dashboards e informes ejecutivos.\nParticipar en proyectos de Inteligencia Artificial Generativa.\nSalario competitivo acorde al mercado.\nRevisión salarial periódica.\nBono anual por objetivos.', 'Híbrido', 'Trainee', '2026-08-14 13:12:41', 19),
(111, 6, 'Desarrollador Frontend', 'Tareas: Desarrollar interfaces de usuario simples y responsive bajo la guía de desarrolladores senior.\nTraducir diseños de Figma o wireframes a código HTML y CSS.\nImplementar componentes básicos con JavaScript y, progresivamente, con frameworks modernos (React o similar).\nConsumir APIs REST y mostrar datos dinámicos en pantalla.\nBeneficios:\nCapacitación continua: mentoreo con desarrolladores senior y acceso a plataformas de aprendizaje.\nPlan de carrera: posibilidad de crecimiento a Semi-Senior según desempeño.\nCertificaciones pagas por la empresa.', 'Híbrido', 'Trainee', '2026-09-16 12:36:23', 30),
(112, 8, 'Desarrollador/a Junior', 'Conocimientos básicos de programación. Interés por el desarrollo de software y nuevas tecnologías. Capacidad de trabajo en equipo.\nProactividad y ganas de aprender.', 'Híbrido', 'Junior', '2026-09-26 19:48:18', 30);

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
(110, 18),
(111, 1),
(111, 5),
(111, 8),
(111, 9),
(112, 3),
(112, 4),
(112, 5),
(112, 6),
(112, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil_empresa`
--

CREATE TABLE `perfil_empresa` (
  `id_perfil` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `logo` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `trayectoria` text DEFAULT NULL,
  `stack_tecnologico` text DEFAULT NULL,
  `beneficios` text DEFAULT NULL,
  `modalidad` enum('Presencial','Híbrido','Remoto') DEFAULT 'Híbrido',
  `zona_trabajo` varchar(150) DEFAULT NULL,
  `sitio_web` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `perfil_empresa`
--

INSERT INTO `perfil_empresa` (`id_perfil`, `id_empresa`, `logo`, `descripcion`, `trayectoria`, `stack_tecnologico`, `beneficios`, `modalidad`, `zona_trabajo`, `sitio_web`, `linkedin`, `telefono`, `created_at`) VALUES
(1, 6, 'http://localhost:3000/uploads/logose/logo-1788312325280.png', 'TecnoSolution es una empresa tecnológica especializada en desarrollo de software a medida y transformación digital. Ofrecemos soluciones integrales en cuatro áreas: desarrollo de sistemas (ERP/CRM) y aplicaciones web y móviles, digitalización y automatización de procesos, migración a la nube y seguridad informática, e inteligencia de datos y analítica.', 'Fundada en 2019 por un equipo de tres profesionales de sistemas, TecnoSolution comenzó desarrollando sitios web y sistemas básicos para comercios locales. Durante la pandemia (2020-2022) acompañó a numerosas empresas en su digitalización, sumando nuevas especialidades y creciendo su cartera de clientes. Entre 2023 y 2024 dio el salto hacia soluciones complejas: sistemas ERP, plataformas con inteligencia de datos y migraciones cloud. Hoy es una empresa consolidada con más de 20 profesionales y 60 clientes activos, con foco en innovación e inteligencia artificial aplicada a negocios.', '.Net, Java, Python, ERPNext, Dynamics 365, SQL server, Salesforce, HubSpot, REST API, SOAP, middleware,Tailwind CSS, Material UI, Ant Design', 'Salario competitivo, Bonos por desempeño,Presupuesto anual de formación para certificaciones,Trabajo con tecnología de punta (Cloud, IA, DevOps, microservicios), Equipos multidisciplianrios', 'Híbrido', 'Avellaneda-Lomas de Zamora', 'https://tecnosolution.com.ar', 'https://linkedin.com/tecnosolution', '1122334455', '2026-08-27 21:04:34'),
(9, 8, 'http://localhost:3000/uploads/logose/logo-1790462094757.png', 'Empresa especializada en desarrollo de software, automatización de procesos y soluciones tecnológicas orientadas a la transformación digital de empresas y emprendedores.\n\nNuestra misión es crear sistemas modernos, escalables y eficientes que impulsen el crecimiento de los negocios mediante tecnología innovadora.  Desarrollo de aplicaciones web y desktop. Sistemas de gestión empresarial (ERP/CRM)\nAutomatización de procesos. Integración de APIs y servicios externos. Desarrollo de dashboards y reportes inteligentes\nBases de datos y arquitectura empresarial\nConsultoría tecnológica', 'Órbita nace con el objetivo de brindar soluciones tecnológicas modernas, acompañando a empresas en la digitalización de sus procesos y el desarrollo de software a medida. Nuestra filosofía se basa en la innovación continua, la calidad técnica y el crecimiento conjunto con nuestros clientes y colaboradores.', '.NET / C# ASP.NET Core Node.js REST APIs React Angular Blazor Azure Docker Figma Power BI', 'Modalidad de trabajo flexible. Acceso a tecnologías modernas y metodologías ágiles. Crecimiento profesional basado en mérito y aprendizaje. Certificaciones y formación especializada. Ambiente colaborativo enfocado en la innovación.', 'Híbrido', 'Lanús', 'https://orbita.com.ar', 'https://linkedin.com/orbita', '1176764545', '2026-09-26 22:34:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil_postulante`
--

CREATE TABLE `perfil_postulante` (
  `id_perfil` int(11) NOT NULL,
  `id_postulante` int(11) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `especialidad` varchar(150) DEFAULT NULL,
  `estado_academico` varchar(100) DEFAULT 'Estudiante Avanzado',
  `otras_habilidades` text DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `cv_url` varchar(255) DEFAULT NULL,
  `cv_nombre` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `perfil_postulante`
--

INSERT INTO `perfil_postulante` (`id_perfil`, `id_postulante`, `foto`, `descripcion`, `ciudad`, `pais`, `especialidad`, `estado_academico`, `otras_habilidades`, `linkedin`, `github`, `portfolio`, `cv_url`, `cv_nombre`, `created_at`) VALUES
(1, 7, '/uploads/fotoperf/foto-7-1788120789512.png', 'Experiencia en planificación estratégica de proyectos mediante metodologías ágiles. Capaz de priorizar tareas críticas, gestionar cronogramas', 'Lanus', 'Argentina', 'Análisis de Datos, Limpieza, procesamiento y visualización de datos Análisis estadístico y exploratorio (EDA)', 'Estudiante Avanzado', NULL, 'https:linkedin.com/garciaazu', 'https:github.com/azucenag', 'https:gitlab.com/azug', '/uploads/cv/cv-7-1788730515308.pdf', 'CV-AZUCENA-GARCIA.pdf', '2026-08-29 17:11:24'),
(12, 8, '/uploads/fotoperf/foto-8-1790714704558.png', 'Estudiante avanzado Tecnicatura Ciencia de Datos con orientación a Inteligencia Artificial y Machine Learning. Combino formación estadística sólida con práctica hands-on en proyectos de NLP y modelos predictivos. Me interesa aplicar IA a problemas de negocio reales: detección de fraude, análisis de sentimiento y sistemas de recomendación. ', 'Quilmes', 'Argentina', 'Machine Learning supervisado y no supervisado Procesamiento de Lenguaje Natural (NLP) Análisis Exploratorio de Datos (EDA) y visualización Introducció', 'Estudiante Avanzado', NULL, 'https://linkedin.com/Alan-Aguilar', 'https://github.com/alansa', 'https://github.com/alansa-datos', '/uploads/cv/cv-8-1790716101744.pdf', 'CV-Alan Sebastian-Aguilar.pdf', '2026-09-29 17:19:18');

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

--
-- Volcado de datos para la tabla `postulacion`
--

INSERT INTO `postulacion` (`id_postulacion`, `id_postulante`, `id_oferta`, `fecha_postulacion`, `estado`) VALUES
(1, 7, 111, '2026-09-17 16:15:14', 'Aceptado');

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
(7, 'Azucena', 'Garcia', 19200200, 10106, 'Analista de Sistema', 'azucenag@itbeltran.com.ar', '$2b$10$jdYY3GdaIdRBxk8o9y1hhOQMgkKIOXJ/aX6esYncM6t2ECu4CA7IG', 'Activo'),
(8, 'Alan Sebastian', 'Aguilar', 40333666, 11011, 'Ciencia de Datos e IA', 'alansa@itbeltran.com.ar', '$2b$10$Rv8YPpAmw8UfDvbWzlhAouQ7C8uxkYxWFlztWS23XuUVuwfE75nni', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulante_skill`
--

CREATE TABLE `postulante_skill` (
  `id_postulante` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `postulante_skill`
--

INSERT INTO `postulante_skill` (`id_postulante`, `skill_id`) VALUES
(7, 3),
(7, 4),
(7, 6),
(7, 10),
(8, 10),
(8, 11),
(8, 12),
(8, 16),
(8, 18);

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
(18, 2, 'Modelos de Lenguaje (LLMs)'),
(19, 1, 'Nest JS');

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
  ADD UNIQUE KEY `id_empresa` (`id_empresa`);

--
-- Indices de la tabla `perfil_postulante`
--
ALTER TABLE `perfil_postulante`
  ADD PRIMARY KEY (`id_perfil`),
  ADD UNIQUE KEY `id_postulante_2` (`id_postulante`);

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
  MODIFY `id_oferta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT de la tabla `perfil_empresa`
--
ALTER TABLE `perfil_empresa`
  MODIFY `id_perfil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `perfil_postulante`
--
ALTER TABLE `perfil_postulante`
  MODIFY `id_perfil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `postulacion`
--
ALTER TABLE `postulacion`
  MODIFY `id_postulacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `postulante`
--
ALTER TABLE `postulante`
  MODIFY `id_postulante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `skill`
--
ALTER TABLE `skill`
  MODIFY `skill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
-- Filtros para la tabla `perfil_empresa`
--
ALTER TABLE `perfil_empresa`
  ADD CONSTRAINT `perfil_empresa_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`) ON DELETE CASCADE;

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
