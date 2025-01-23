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

  // Validation des entrées
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  console.log("Tentative de connexion - Email:", email);

  // Fonction pour exécuter une requête SQL et traiter le résultat
  const executeQuery = (query, params, role) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length > 0) {
          const user = results[0];
          delete user.password; // Retirer le mot de passe avant de retourner les données
          resolve({ role, user });
        } else {
          resolve(null);
        }
      });
    });
  };

  // Vérifier les deux rôles : admin et étudiant
  const adminQuery = "SELECT * FROM admin WHERE email = ? AND password = ?";
  const studentQuery = "SELECT * FROM etudiant WHERE email = ? AND password = ?";

  Promise.all([
    executeQuery(adminQuery, [email, password], "admin"),
    executeQuery(studentQuery, [email, password], "etudiant"),
  ])
    .then(([adminResult, studentResult]) => {
      if (adminResult) {
        return res.status(200).json({
          message: "Connexion administrateur réussie.",
          role: adminResult.role,
          user: adminResult.user,
        });
      }
      if (studentResult) {
        return res.status(200).json({
          message: "Connexion réussie.",
          role: studentResult.role,
          user: studentResult.user,
        });
      }

      // Aucun utilisateur trouvé
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    })
    .catch((err) => {
      console.error("Erreur lors de la connexion :", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    });
});



app.get("/api/memoireEtudiant", (req, res) => {
  const { id_etudiant } = req.query;

  if (!id_etudiant) {
    return res.status(400).json({ message: "ID étudiant requis." });
  }

  const query = `
    SELECT m.id_memoire, m.libelle, m.annee, m.cycle, m.speciality, m.university, m.file_name, m.file_path, e.name AS etudiant_nom
    FROM memoire m
    JOIN etudiant e ON m.id_etudiant = e.id_etudiant
    WHERE m.id_etudiant = ?
  `;

  console.log("Exécution de la requête :", query); // Log de la requête

  db.query(query, [id_etudiant], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des mémoires :", err);
      return res.status(500).json({ message: "Erreur lors de la récupération des mémoires." });
    }

    if (Array.isArray(results)) {
      res.status(200).json({ memoire: results });
    } else {
      console.error("Erreur : la réponse n'est pas un tableau", results);
      res.status(500).json({ message: "Erreur interne serveur, réponse incorrecte." });
    }
  });
});


// Récupérer tous les mémoires avec les informations de l'étudiant
app.get("/api/memoire", (req, res) => {
  const query = `
    SELECT m.id_memoire, m.libelle, m.annee, m.cycle, m.speciality, m.university, m.file_name, m.file_path, e.name AS etudiant_nom
    FROM memoire m
    JOIN etudiant e ON m.id_etudiant = e.id_etudiant
  `;

  console.log("Exécution de la requête :", query); // Log de la requête

  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des mémoires :", err); // Ajoutez cette ligne
      return res.status(500).json({ message: "Erreur lors de la récupération des mémoires." });
    }

    if (Array.isArray(results)) {
      res.status(200).json({ memoire: results });
    } else {
      console.error("Erreur : la réponse n'est pas un tableau", results);
      res.status(500).json({ message: "Erreur interne serveur, réponse incorrecte." });
    }
  });
});

//updateMemoire


//Recuperer les memoires valider ou rejeter 
app.patch("/api/memoire/:id", (req, res) => {
  const idMemoire = req.params.id;
  const { action } = req.body;

  if (!idMemoire) {
    return res.status(400).json({ message: "ID du mémoire requis." });
  }

  if (!['validated', 'rejected'].includes(action)) {
    return res.status(400).json({ message: "Action invalide. Utilisez 'validated' ou 'rejected'." });
  }

  const query = `
    UPDATE memoire
    SET status = ?
    WHERE id_memoire = ?
  `;

  const values = [action, idMemoire];

  console.log("Exécution de la requête :", query, values);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour du statut du mémoire :", err);
      return res.status(500).json({ message: "Erreur lors de la mise à jour du mémoire." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mémoire non trouvé." });
    }

    res.status(200).json({ message: `Mémoire ${action} avec succès.` });
  });
});

//recuperer les memoires valider pour le home 
app.get("/api/memoire", (req, res) => {
  const { status } = req.query; // Récupérer le paramètre de filtre 'status'

  // Construire la requête avec un filtre conditionnel
  let query = `
    SELECT m.id_memoire, m.libelle, m.annee, m.cycle, m.speciality, m.university, m.file_name, m.file_path, m.status, e.name AS etudiant_nom
    FROM memoire m
    JOIN etudiant e ON m.id_etudiant = e.id_etudiant
  `;

  const queryParams = [];

  if (status) {
    query += ` WHERE m.status = ?`; // Ajouter un filtre si 'status' est fourni
    queryParams.push(status);
  }

  console.log("Exécution de la requête :", query, queryParams);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des mémoires :", err);
      return res.status(500).json({ message: "Erreur lors de la récupération des mémoires." });
    }

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
// app.patch("/api/memoire/:id", (req, res) => {
//   const { action } = req.body;
//   const id = req.params.id;
//   const status = action === 'validate' ? 'validated' : action === 'reject' ? 'rejected' : null;

//   if (!status) {
//     return res.status(400).json({ message: "Action non valide." });
//   }

//   const query = "UPDATE memoire SET status = ? WHERE id = ?";
//   db.query(query, [status, id], (err) => {
//     if (err) {
//       return res.status(500).json({ message: "Erreur lors de la mise à jour du statut." });
//     }
//     res.status(200).json({ message: "Statut mis à jour avec succès." });
//   });
// });


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
