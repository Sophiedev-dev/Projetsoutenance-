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
app.post("/api/memoire", upload.single("file"), (req, res) => {
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

  console.log("Email:", email);
  console.log("Password:", password); // Vérifier que les valeurs sont bien envoyées

  // Vérifier l'admin d'abord
  const adminQuery = `
    SELECT * 
    FROM admin 
    WHERE email = ? AND password = ?
  `;
  db.query(adminQuery, [email, password], (err, adminResults) => {
    if (err) {
      console.error("Erreur lors de la connexion administrateur:", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    if (adminResults.length > 0) {
      // Authentification admin réussie
      return res
        .status(200)
        .json({ message: "Connexion administrateur réussie.", role: "admin" });
    }

    // Si ce n'est pas un admin, vérifier l'étudiant
    const studentQuery = `
      SELECT * 
      FROM etudiant 
      WHERE email = ? AND password = ?
      `;
    db.query(studentQuery, [email, password], (err, studentResults) => {
      if (err) {
        console.error("Erreur lors de la connexion étudiant :", err);
        return res
          .status(500)
          .json({ message: "Erreur interne du serveur.", error: err });
      }

      if (studentResults.length > 0) {
        // Authentification étudiant réussie
        return res.status(200).json({
          message: "Connexion réussie.",
          role: studentResults[0].role_name || "etudiant",
        });
      } else {
        // Aucun utilisateur trouvé
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect." });
      }
    });
  });
});





// Nouvelle route pour récupérer tous les mémoires
app.get("/api/memoire", (req, res) => {
  const query = "SELECT * FROM memoire";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des mémoires :", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération des mémoires." });
    }

    // Vérification des résultats dans la console
    console.log(results);

    res.status(200).json({ memoire: results });
  });
});


// // Récupérer tous les mémoires
// app.get("/api/memoire", (req, res) => {
//   const query = "SELECT * FROM memoire";
//   db.query(query, (err, results) => {
//     if (err) {
//       return res.status(500).json({ message: "Erreur lors de la récupération des mémoires." });
//     }
//     res.status(200).json({ memoire: results });
//   });
// });

// Récupérer les statistiques
app.get("/api/admin", (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'validated' THEN 1 ELSE 0 END) as validated,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
    FROM memoire
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la récupération des statistiques." });
    }
    res.status(200).json(results[0]);
  });
});

// Mettre à jour le statut d'une mémoire
app.patch("/api/memoire/:id", (req, res) => {
  const { action } = req.body;
  const id = req.params.id;
  const status = action === 'validate' ? 'validated' : action === 'reject' ? 'rejected' : null;

  if (!status) {
    return res.status(400).json({ message: "Action non valide." });
  }

  const query = "UPDATE memoire SET status = ? WHERE id = ?";
  db.query(query, [status, id], (err) => {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la mise à jour du statut." });
    }
    res.status(200).json({ message: "Statut mis à jour avec succès." });
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
