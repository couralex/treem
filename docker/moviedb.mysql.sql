-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Client :  localhost
-- Généré le :  Sam 24 Décembre 2016 à 21:30
-- Version du serveur :  5.7.13-0ubuntu0.16.04.2
-- Version de PHP :  7.0.8-0ubuntu0.16.04.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `moviedb`
--

-- --------------------------------------------------------

--
-- Structure de la table `Actor`
--

CREATE TABLE `Actor` (
  `ID` int(11) NOT NULL,
  `FirstName` varchar(100) DEFAULT NULL,
  `LastName` varchar(100) DEFAULT NULL,
  `BirthDay` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contenu de la table `Actor`
--

INSERT INTO `Actor` (`ID`, `FirstName`, `LastName`, `BirthDay`) VALUES
(1, 'Felicity', 'Jones', '1983-10-17'),
(2, 'Diego', 'Luna', '1979-12-29'),
(3, 'Harrison', 'Ford', '1942-07-13'),
(4, 'Daisy', 'Ridley', '1992-04-10');

-- --------------------------------------------------------

--
-- Structure de la table `Movie`
--

CREATE TABLE `Movie` (
  `ID` int(11) NOT NULL,
  `Name` varchar(300) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contenu de la table `Movie`
--

INSERT INTO `Movie` (`ID`, `Name`) VALUES
(1, 'Rogue one'),
(2, 'Star Wars: The Force Awakens');

-- --------------------------------------------------------

--
-- Structure de la table `MovieActor`
--

CREATE TABLE `MovieActor` (
  `Movie_ID` int(11) NOT NULL,
  `Actor_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contenu de la table `MovieActor`
--

INSERT INTO `MovieActor` (`Movie_ID`, `Actor_ID`) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4);

--
-- Index pour les tables exportées
--

--
-- Index pour la table `Actor`
--
ALTER TABLE `Actor`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `Movie`
--
ALTER TABLE `Movie`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `MovieActor`
--
ALTER TABLE `MovieActor`
  ADD PRIMARY KEY (`Movie_ID`,`Actor_ID`),
  ADD KEY `fk_MovieActor_Actor1_idx` (`Actor_ID`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `Actor`
--
ALTER TABLE `Actor`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT pour la table `Movie`
--
ALTER TABLE `Movie`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `MovieActor`
--
ALTER TABLE `MovieActor`
  ADD CONSTRAINT `fk_MovieActor_Actor1` FOREIGN KEY (`Actor_ID`) REFERENCES `Actor` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_MovieActor_Movie` FOREIGN KEY (`Movie_ID`) REFERENCES `Movie` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
