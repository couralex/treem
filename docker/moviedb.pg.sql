--
-- Base de données :  "moviedb"
--

-- --------------------------------------------------------

--
-- Structure de la table "Actor"
--

CREATE TABLE "Actor" (
  "ID" int NOT NULL,
  "FirstName" varchar(100) DEFAULT NULL,
  "LastName" varchar(100) DEFAULT NULL,
  "BirthDay" date DEFAULT NULL
);

--
-- Contenu de la table "Actor"
--

INSERT INTO "Actor" ("ID", "FirstName", "LastName", "BirthDay") VALUES
(1, 'Felicity', 'Jones', '1983-10-17'),
(2, 'Diego', 'Luna', '1979-12-29'),
(3, 'Harrison', 'Ford', '1942-07-13'),
(4, 'Daisy', 'Ridley', '1992-04-10');

-- --------------------------------------------------------

--
-- Structure de la table "Movie"
--

CREATE TABLE "Movie" (
  "ID" int NOT NULL,
  "Name" varchar(300) DEFAULT NULL
);

--
-- Contenu de la table "Movie"
--

INSERT INTO "Movie" ("ID", "Name") VALUES
(1, 'Rogue one'),
(2, 'Star Wars: The Force Awakens');

-- --------------------------------------------------------

--
-- Structure de la table "MovieActor"
--

CREATE TABLE "MovieActor" (
  "Movie_ID" int NOT NULL,
  "Actor_ID" int NOT NULL
);

--
-- Contenu de la table "MovieActor"
--

INSERT INTO "MovieActor" ("Movie_ID", "Actor_ID") VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4);

--
-- Index pour les tables exportées
--

--
-- Index pour la table "Actor"
--
ALTER TABLE "Actor"
  ADD PRIMARY KEY ("ID");

--
-- Index pour la table "Movie"
--
ALTER TABLE "Movie"
  ADD PRIMARY KEY ("ID");

--
-- Index pour la table "MovieActor"
--
ALTER TABLE "MovieActor"
  ADD PRIMARY KEY ("Movie_ID","Actor_ID");


--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- Contraintes pour la table "MovieActor"
--
ALTER TABLE "MovieActor"
  ADD CONSTRAINT "fk_MovieActor_Actor1" FOREIGN KEY ("Actor_ID") REFERENCES "Actor" ("ID") ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT "fk_MovieActor_Movie" FOREIGN KEY ("Movie_ID") REFERENCES "Movie" ("ID") ON DELETE NO ACTION ON UPDATE NO ACTION;
