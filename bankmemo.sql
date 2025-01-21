-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 20 jan. 2025 à 19:34
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
  `id_role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `etudiant`
--

CREATE TABLE `etudiant` (
  `id_etudiant` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `surname` varchar(256) NOT NULL,
  `email` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  `phonenumber` varchar(15) NOT NULL,
  `university` varchar(256) NOT NULL,
  `faculty` varchar(256) NOT NULL,
  `speciality` varchar(256) NOT NULL,
  `id_role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `validated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  ADD KEY `id_etudiant` (`id_etudiant`),
  ADD KEY `validated_by` (`validated_by`);

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
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `etudiant`
--
ALTER TABLE `etudiant`
  MODIFY `id_etudiant` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `memoire`
--
ALTER TABLE `memoire`
  MODIFY `id_memoire` int(11) NOT NULL AUTO_INCREMENT;

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
-- Contraintes pour la table `etudiant`
--
ALTER TABLE `etudiant`
  ADD CONSTRAINT `etudiant_ibfk_1` FOREIGN KEY (`id_role`) REFERENCES `role` (`id_role`) ON DELETE CASCADE;

--
-- Contraintes pour la table `memoire`
--
ALTER TABLE `memoire`
  ADD CONSTRAINT `memoire_ibfk_1` FOREIGN KEY (`id_etudiant`) REFERENCES `etudiant` (`id_etudiant`) ON DELETE CASCADE,
  ADD CONSTRAINT `memoire_ibfk_2` FOREIGN KEY (`validated_by`) REFERENCES `admin` (`id_admin`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
