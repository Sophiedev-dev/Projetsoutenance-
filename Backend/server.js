const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const dbConfig = {
  user: "root",
  password: "", // Remplacez par votre mot de passe
  host: "localhost",
  port: "3306",
  database: "bankmemo",
};

const app = express();
app.use(cors());
app.use(express.json());

// Configuration de MySQL
const db = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
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
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// Route pour la soumission des données
app.post("/api/memoires", upload.single("file"), (req, res) => {
  const { libelle, annee, cycle, speciality, university, id_etudiant } =
    req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier téléchargé." });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  const query = `
    INSERT INTO memoire (libelle, annee, cycle, speciality, university, file_path, file_name, id_etudiant)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    libelle,
    annee,
    cycle,
    speciality,
    university,
    filePath,
    fileName,
    id_etudiant,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion dans la base de données:", err);

      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Erreur lors de la suppression du fichier:", unlinkErr);
        } else {
          console.log(
            "Fichier supprimé suite à une erreur dans la base de données."
          );
        }
      });

      return res
        .status(500)
        .json({ message: "Erreur interne du serveur.", error: err });
    }


    res.status(201).json({ message: "Données soumises avec succès." });
  });
});

app.post("/api/etudiant",(req,res)=> {
  const query =`
   INSERT INTO etudiant(name,surname,email,password) 
   VALUES(?,?,?,?)
`
const { name, surname, email, password} =
req.body;
  // Vérification des champs requis
if (!name || !surname || !email || !password) {
  return res.status(400).json({ message: "Tous les champs sont obligatoires." });
}

db.query(query, [name,surname,email,password], (err,result)=>{
  if (err) {
    console.error("Erreur lors de l'insertion dans la base de données:", err);

  return res
        .status(500)
        .json({ message: "Erreur interne du serveur.", error: err });
}else{
  return res
        .status(201)
        .json({ message: "insertion reussie", });
}

});

});


app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const query = "SELECT * FROM etudiant WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Erreur lors de la connexion :", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    if (results.length > 0) {
      res.status(200).json({ message: "Connexion réussie." });
    } else {
      res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }
  });
});



// Nouvelle route pour récupérer tous les mémoires
app.get("/api/memoires", (req, res) => {
  const query = "SELECT * FROM memoire";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des mémoires :", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération des mémoires." });
    }

    res.status(200).json({ memoires: results });
  });
});

// Middleware pour les routes non trouvées
app.use((req, res, next) => {
  res.status(404).send(`
    <html>
      <head>
        <title>Page non trouvée</title>
      </head>
      <body>
        <h1>Erreur 404 : Page non trouvée</h1>
        <p>La ressource demandée est introuvable sur le serveur.</p>
      </body>
    </html>
  `);
});

// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
