-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 13 fév. 2025 à 11:07
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `bankmemo`
--

-- --------------------------------------------------------

--
-- Structure de la table `admin`
--

CREATE TABLE `admin` (
  `id_admin` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `surname` varchar(256) NOT NULL,
  `phonenumber` varchar(15) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(256) NOT NULL,
  `id_role` int(11) NOT NULL,
  `private_key` text DEFAULT NULL,
  `public_key` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `admin`
--

INSERT INTO `admin` (`id_admin`, `name`, `surname`, `phonenumber`, `email`, `password`, `id_role`, `private_key`, `public_key`) VALUES
(1, 'admin', 'admin', '699889988', 'admin@gmail.com', '$2b$10$cGbGJJ44.ps.WT29S4aoyOtB0/5acrHG8lXlIjaqvx/CChs7OwAve', 1, '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDbjm89DKMnGwW8\nRlO6zxd/AAkvz/wKgob63X4TOmRF2ntJnDJKEMN1vgqtF0vlrd5E7a6OOFfOiCfM\nM+mqjkvQLdhZ1H1+5bIVMwF5A74sHKtXzWODg47UFaBBmr6OpKgE/9MEYgWvcJZi\ngaa72a3sYt9Is5Sk/pcXsrRV6WdW0F/YIlmmK8hAhyJPtKaH25V0whjxrgG6AChS\n/l0a4UKMwlX4w7SEAPiP4G4z2kD8mO9ed/q+Rk/oX9CT5RHz46wjSdq4Xaqg7zCc\n90seeWxRFOTgzbIeuatIZx3dYWrNyZOptcZ5dFdl7sPEdjFeE0foN12ezrio3fxi\nMC5Z+M7TAgMBAAECggEANi2TrZDswb2dULRZ/QMVXTV5Dt9X5pAHFuiJL9182O/s\n9GEi17wDP47Bu6zAAdFBw+iS5m1o3YIjr/QvePLcKmbluGUDAslThH+toVsXFnOM\npIH+SHmySQt9HDM/Spu/ClzGiZJWrNAvi+dKaZhxnp9XUe1ehMh+KE7kyT5rTbRw\nXQLfdBjR9Hjn+M923ZsaWix10njOY1nutHzLxIS2M4UWgkRxqbtryPYW6zCeEPom\neeBIyhqD1xaoCIkTXEtzQ6lidlj8Q+89sVkAUV2mHYccIGF+8QXIrCSlseWnibEK\nRQrYfBsH5tmxkUjRAAoz16xmQwX40P7qjxYCZVAaoQKBgQD/fCGnXQBup/B0RP3H\ncGmJgOLyx5kiwVGsTdzIdiuiUqE5j/+3z/pakQUWz98DUTSjj8C9m41wnWqkTFsL\nrEN8jeS98fKlZMguvTZzKrPz7RfR9zkXYEaIXF0qqYZLWi6agZxVVxjJFbM7lWTW\neP6Djjve0QIl7Gfw7A9mtxJX1QKBgQDb/8IxYk2Ciw5o3rdiFRJO/NGJFgfwssWg\ndCNJRclGb8WlUNjyaTqD1q7EN1lADOZtDLmaTcpRTjX2aFIttL5la0cAifTzrlMt\nroL0SCUXNV28fVeTS7Qjdh4Oc/IFkHhGX4yoro3lB/W/WeWxH0jBB3k3g/cQH/Cj\nVTFoy3LIBwKBgQCqziuVwAi08lRA94sPVmlIg8G2/Ji18rcO0jOEVfTQHhwp5srY\n8hP3jrLvUGRRzG272DTMzv1dx/BvDZllEXNBB4BhOSu3RczL6rZHgsoyj1V4i6dA\nqJ4fNlkXV6UwJYe4xmRlbchlT7u3Xya+eL/35hTC38tm3UmUec3GJyj9TQKBgCpB\nmd86boDgjMf/32FrgrTBQs39+VB2Rhdnt09fpCVvWptCSClnpOGl3rO5nd77m1be\n1teYkX/EcgD+UKqOyPNaA61K0k3r8fYYSvb41Ib8rSCDQsr8A4G8MlG8W4ROF4wM\n1kugG4keWkmCzueShrrs4I+VPWNPfz0gI/lo+ocJAoGBAMyNiaTSVUJ3JS/X9xpT\njsawRbQzp1x2DfLZmd4RLVBA34hggboUA3Kr86OlJnvvP7HvJ0MUycZzPLtancA5\n2dSJ5TswqTl8XjQrRU6dYywcpmzxkd6qJFeLqaDHovqstCU0ENqjNjH+26f5GgRD\nI793WJpnivn0vFCLYQ+BEH8W\n-----END PRIVATE KEY-----\n', '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA245vPQyjJxsFvEZTus8X\nfwAJL8/8CoKG+t1+EzpkRdp7SZwyShDDdb4KrRdL5a3eRO2ujjhXzognzDPpqo5L\n0C3YWdR9fuWyFTMBeQO+LByrV81jg4OO1BWgQZq+jqSoBP/TBGIFr3CWYoGmu9mt\n7GLfSLOUpP6XF7K0VelnVtBf2CJZpivIQIciT7Smh9uVdMIY8a4BugAoUv5dGuFC\njMJV+MO0hAD4j+BuM9pA/JjvXnf6vkZP6F/Qk+UR8+OsI0nauF2qoO8wnPdLHnls\nURTk4M2yHrmrSGcd3WFqzcmTqbXGeXRXZe7DxHYxXhNH6Dddns64qN38YjAuWfjO\n0wIDAQAB\n-----END PUBLIC KEY-----\n');

-- --------------------------------------------------------

--
-- Structure de la table `comparison_results`
--

CREATE TABLE `comparison_results` (
  `id` int(11) NOT NULL,
  `memoire_id` int(11) NOT NULL,
  `results_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`results_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `deleted_users`
--

CREATE TABLE `deleted_users` (
  `id_etudiant` int(11) NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  `surname` varchar(256) DEFAULT NULL,
  `email` varchar(256) DEFAULT NULL,
  `password` varchar(256) DEFAULT NULL,
  `phonenumber` varchar(15) DEFAULT NULL,
  `university` varchar(256) DEFAULT NULL,
  `faculty` varchar(256) DEFAULT NULL,
  `speciality` varchar(256) DEFAULT NULL,
  `id_role` int(11) DEFAULT NULL,
  `deleted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `deleted_users`
--

INSERT INTO `deleted_users` (`id_etudiant`, `name`, `surname`, `email`, `password`, `phonenumber`, `university`, `faculty`, `speciality`, `id_role`, `deleted_at`) VALUES
(14, 'jj', 'jj', 'jj@gmail.com', 'jj', NULL, NULL, NULL, NULL, NULL, '2025-02-11 16:39:20');

-- --------------------------------------------------------

--
-- Structure de la table `digital_signatures`
--

CREATE TABLE `digital_signatures` (
  `id` int(11) NOT NULL,
  `memoire_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `signature` text NOT NULL,
  `public_key` text NOT NULL,
  `signed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `digital_signatures`
--

INSERT INTO `digital_signatures` (`id`, `memoire_id`, `admin_id`, `signature`, `public_key`, `signed_at`) VALUES
(1, 22, 1, 'k1Z4vxdPpmyNRhIIFBIuj3cTHwQn9oBuGd+o5VUoenVvvUvHeIYA21jUtF8fG7NGGGaeHgtQZtzdGoKI7zra5gjgHdcOZGTlnSq/n6VEVk5OEYoHvXgf4P1xQSpYA6BJKj2tFFjcaK+pXq0Ur4/wKh18p40A5SOMUDlh5QeadBETh28HhBw1rGvJmdxGCZfZcnyMpgi4h0Y2VU8ZKILKFBRe21tynVl8tOU2I8KGUD9Xa2f1i77YmJWUzDmUSTbmq+LTlYW4Z/dXsDRqKgzz5LWzXnVtTkQPmHKPpriEBfSWAdWD9RFATMgIYj75ShNl1NPP7+fyJ2gypbf1Ou4Ckw==', '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA245vPQyjJxsFvEZTus8X\nfwAJL8/8CoKG+t1+EzpkRdp7SZwyShDDdb4KrRdL5a3eRO2ujjhXzognzDPpqo5L\n0C3YWdR9fuWyFTMBeQO+LByrV81jg4OO1BWgQZq+jqSoBP/TBGIFr3CWYoGmu9mt\n7GLfSLOUpP6XF7K0VelnVtBf2CJZpivIQIciT7Smh9uVdMIY8a4BugAoUv5dGuFC\njMJV+MO0hAD4j+BuM9pA/JjvXnf6vkZP6F/Qk+UR8+OsI0nauF2qoO8wnPdLHnls\nURTk4M2yHrmrSGcd3WFqzcmTqbXGeXRXZe7DxHYxXhNH6Dddns64qN38YjAuWfjO\n0wIDAQAB\n-----END PUBLIC KEY-----\n', '2025-02-13 08:26:25');

-- --------------------------------------------------------

--
-- Structure de la table `etudiant`
--

CREATE TABLE `etudiant` (
  `id_etudiant` int(11) NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  `surname` varchar(256) DEFAULT NULL,
  `email` varchar(256) DEFAULT NULL,
  `password` varchar(256) DEFAULT NULL,
  `phonenumber` varchar(15) DEFAULT NULL,
  `university` varchar(256) DEFAULT NULL,
  `faculty` varchar(256) DEFAULT NULL,
  `speciality` varchar(256) DEFAULT NULL,
  `id_role` int(11) DEFAULT NULL,
  `email_activated` tinyint(1) DEFAULT 0,
  `code` varchar(6) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `etudiant`
--

INSERT INTO `etudiant` (`id_etudiant`, `name`, `surname`, `email`, `password`, `phonenumber`, `university`, `faculty`, `speciality`, `id_role`, `email_activated`, `code`, `is_active`, `deleted_at`) VALUES
(1, 'admin', 'admin', 'jean@gmail.com', 'jean', '1234567890', 'Université de Douala', 'Faculté des Sciences', 'Informatique', 2, 0, '', 1, NULL),
(6, 'Mba', 'Mika', 'mikamba@gmail', 'mikamba0', NULL, NULL, NULL, NULL, NULL, 0, '', 1, NULL),
(8, 'Lontsi Sonwa', 'Russel', 'LontsiSonwa@gmail', 'ruxlsr', NULL, NULL, NULL, NULL, NULL, 0, '', 1, NULL),
(11, 'DEGA', 'DEGA', 'karel@gamil.com', 'DEGA', NULL, NULL, NULL, NULL, NULL, 0, '', 1, NULL),
(15, 'rachel', 'sam', 'sam@gmail.com', 'sam', NULL, NULL, NULL, NULL, NULL, 0, '', 1, NULL),
(16, 'hh', 'hh', 'hh@gamil.com', 'hh', NULL, NULL, NULL, NULL, NULL, 0, '', 1, NULL),
(17, 'Dega', 'Maffo', 'maffo@gamil.com', '$2b$10$AHQJ8OUuB5YEXs9SIihaDePBgQ817TKhxcpoLX8GmcL.J5ZDTQc9C', NULL, NULL, NULL, NULL, NULL, 0, '', 1, NULL),
(19, 'sophie', 'soso', 'soso@gmail.com', '$2b$10$lB2rHOVDZDya1e4cL.L63O2bqOipt9C1yAMvx2P4J5ncNCtYf/H8.', NULL, NULL, NULL, NULL, NULL, 0, '', 1, NULL),
(20, 'jo', 'jojo', 'jojo@gmail.com', '$2b$10$ktDcjq22oOICFuI/cow6B.0qrRAWw5fxMBQI.DaYTeWnIlJ4AAcfa', NULL, NULL, NULL, NULL, NULL, 0, '', 1, NULL),
(29, 'KEYCE', 'INFORMATIQUE', 'bleriaux1@gmail.com', '$2b$10$RXX0pNS68Ypp0bJe5bh1gO4BgZE8fmWANB.9RIrad.J30CTS74EdC', NULL, NULL, NULL, NULL, NULL, 1, '5J700F', 1, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `memoire`
--

CREATE TABLE `memoire` (
  `id_memoire` int(11) NOT NULL,
  `libelle` varchar(256) NOT NULL,
  `annee` year(4) NOT NULL,
  `cycle` varchar(256) NOT NULL,
  `speciality` varchar(256) NOT NULL,
  `university` varchar(256) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `status` enum('pending','validated','rejected') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `id_etudiant` int(11) NOT NULL,
  `validated_by` int(11) DEFAULT NULL,
  `pages_preview` varchar(500) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  `consultations` int(11) DEFAULT 0,
  `date_soumission` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `memoire`
--

INSERT INTO `memoire` (`id_memoire`, `libelle`, `annee`, `cycle`, `speciality`, `university`, `file_name`, `file_path`, `status`, `rejection_reason`, `id_etudiant`, `validated_by`, `pages_preview`, `description`, `consultations`, `date_soumission`, `updated_at`) VALUES
(15, 'IA', '2025', 'Master', 'GL', 'UY1', 'avancement - Feuille 1.pdf', 'uploads\\1738592597730-avancement - Feuille 1.pdf', '', NULL, 19, NULL, NULL, 'Soutenance ICT4D', 0, '2025-02-07 18:02:18', '2025-02-07 18:02:19'),
(20, 'Ubuntu', '2025', 'Master', 'GL', 'UY1', 'Documents numeÌriseÌs.pdf', 'uploads\\1738945110893-Documents numeÌriseÌs.pdf', 'rejected', 'Plagiat détecté dans le mémoire.', 29, NULL, NULL, 'Facilter la gestion des memoires ', 0, '2025-02-07 18:02:18', '2025-02-07 18:02:19'),
(22, 'Maths', '2025', 'Bachelor', 'GL', 'UY1', 'soutenance2025.pdf', 'uploads\\1739431091749-soutenance2025.pdf', 'validated', NULL, 29, 1, NULL, 'Data Base', 0, '2025-02-13 08:18:11', '2025-02-13 09:26:25');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id_notification` int(11) NOT NULL,
  `id_etudiant` int(11) NOT NULL,
  `message` text NOT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id_notification`, `id_etudiant`, `message`, `date_creation`) VALUES
(1, 17, 'Votre mémoire a été rejeté pour la raison suivante : jjj', '2025-01-31 21:52:58'),
(9, 20, 'Votre mémoire a été rejeté pour la raison suivante : salut', '2025-02-03 17:18:28'),
(10, 20, 'Votre mémoire a été rejeté pour la raison suivante : j', '2025-02-03 18:56:11'),
(13, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : nmnm', '2025-02-07 14:18:23'),
(14, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:14'),
(15, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:14'),
(16, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:16'),
(17, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:16'),
(18, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:16'),
(19, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:18'),
(20, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:18'),
(21, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:19'),
(22, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:20'),
(23, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : sophia', '2025-02-07 16:19:42'),
(24, 29, 'Votre mémoire \"Ubuntu\" a été rejeté pour la raison suivante : Plagiat détecté dans le mémoire.', '2025-02-07 16:21:27');

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

CREATE TABLE `role` (
  `id_role` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`id_role`, `name`) VALUES
(1, 'admin'),
(2, 'etudiant');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_role` (`id_role`);

--
-- Index pour la table `comparison_results`
--
ALTER TABLE `comparison_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `memoire_id` (`memoire_id`);

--
-- Index pour la table `deleted_users`
--
ALTER TABLE `deleted_users`
  ADD PRIMARY KEY (`id_etudiant`);

--
-- Index pour la table `digital_signatures`
--
ALTER TABLE `digital_signatures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `memoire_id` (`memoire_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Index pour la table `etudiant`
--
ALTER TABLE `etudiant`
  ADD PRIMARY KEY (`id_etudiant`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_role` (`id_role`);

--
-- Index pour la table `memoire`
--
ALTER TABLE `memoire`
  ADD PRIMARY KEY (`id_memoire`),
  ADD KEY `validated_by` (`validated_by`),
  ADD KEY `idx_id_etudiant` (`id_etudiant`),
  ADD KEY `idx_status` (`status`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id_notification`),
  ADD KEY `id_etudiant` (`id_etudiant`);

--
-- Index pour la table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id_role`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `comparison_results`
--
ALTER TABLE `comparison_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `digital_signatures`
--
ALTER TABLE `digital_signatures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `etudiant`
--
ALTER TABLE `etudiant`
  MODIFY `id_etudiant` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT pour la table `memoire`
--
ALTER TABLE `memoire`
  MODIFY `id_memoire` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id_notification` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT pour la table `role`
--
ALTER TABLE `role`
  MODIFY `id_role` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `admin`
--
ALTER TABLE `admin`
  ADD CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`id_role`) REFERENCES `role` (`id_role`) ON DELETE CASCADE;

--
-- Contraintes pour la table `comparison_results`
--
ALTER TABLE `comparison_results`
  ADD CONSTRAINT `comparison_results_ibfk_1` FOREIGN KEY (`memoire_id`) REFERENCES `memoire` (`id_memoire`);

--
-- Contraintes pour la table `digital_signatures`
--
ALTER TABLE `digital_signatures`
  ADD CONSTRAINT `digital_signatures_ibfk_1` FOREIGN KEY (`memoire_id`) REFERENCES `memoire` (`id_memoire`),
  ADD CONSTRAINT `digital_signatures_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id_admin`);

--
-- Contraintes pour la table `etudiant`
--
ALTER TABLE `etudiant`
  ADD CONSTRAINT `etudiant_ibfk_1` FOREIGN KEY (`id_role`) REFERENCES `role` (`id_role`) ON DELETE CASCADE;

--
-- Contraintes pour la table `memoire`
--
ALTER TABLE `memoire`
  ADD CONSTRAINT `fk_etudiant` FOREIGN KEY (`id_etudiant`) REFERENCES `etudiant` (`id_etudiant`) ON DELETE CASCADE,
  ADD CONSTRAINT `memoire_ibfk_1` FOREIGN KEY (`id_etudiant`) REFERENCES `etudiant` (`id_etudiant`) ON DELETE CASCADE,
  ADD CONSTRAINT `memoire_ibfk_2` FOREIGN KEY (`validated_by`) REFERENCES `admin` (`id_admin`) ON DELETE SET NULL;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`id_etudiant`) REFERENCES `etudiant` (`id_etudiant`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
