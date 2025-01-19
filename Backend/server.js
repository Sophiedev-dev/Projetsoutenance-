const express = require("express");
const multer = require("multer");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Configuration de MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password", // Remplacez par votre mot de passe
  database: "bankmemo", // Remplacez par le nom de votre base de données
});

// Connexion à la base de données
db.connect((err) => {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL.");
});

// Configuration de multer pour le téléchargement des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Crée le dossier des fichiers si nécessaire
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true }); // Création du dossier avec l'option recursive
}

// Route pour la soumission des données
app.post("/api/memoires", upload.single("file"), (req, res) => {
  const { libelle, annee, cycle, speciality, university, id_etudiant } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier téléchargé." });
  }

  const filePath = req.file.path;

  // Insérer les données dans la base de données
  const query = `
    INSERT INTO memoire (libelle, annee, cycle, speciality, university, file_path, id_etudiant)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    libelle,
    annee,
    cycle,
    speciality,  // Vérifie si le nom du champ est correct
    university,  // Vérifie si le nom du champ est correct
    filePath,
    id_etudiant,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion dans la base de données:", err);
      return res.status(500).json({ message: "Erreur interne du serveur.", error: err });
    }

    res.status(201).json({ message: "Données soumises avec succès." });
  });
});

// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
const express = require("express");
const multer = require("multer");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Configuration de MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password", // Remplacez par votre mot de passe
  database: "bankmemo", // Remplacez par le nom de votre base de données
});

// Connexion à la base de données
db.connect((err) => {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL.");
});

// Configuration de multer pour le téléchargement des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Crée le dossier des fichiers si nécessaire
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true }); // Création du dossier avec l'option recursive
}

// Route pour la soumission des données
app.post("/api/memoires", upload.single("file"), (req, res) => {
  const { libelle, annee, cycle, speciality, university, id_etudiant } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier téléchargé." });
  }

  const filePath = req.file.path;

  // Insérer les données dans la base de données
  const query = `
    INSERT INTO memoire (libelle, annee, cycle, speciality, university, file_path, id_etudiant)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    libelle,
    annee,
    cycle,
    speciality,  // Vérifie si le nom du champ est correct
    university,  // Vérifie si le nom du champ est correct
    filePath,
    id_etudiant,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion dans la base de données:", err);
      return res.status(500).json({ message: "Erreur interne du serveur.", error: err });
    }

    res.status(201).json({ message: "Données soumises avec succès." });
  });
});

// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
