const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Ou autre service (Yahoo, Outlook, etc.)
  auth: {
    user: "sophiamba17@gmail.com", // Remplace par ton email
    pass: "uomg lvjg kgso ihib" // Remplace par ton mot de passe ou une App Password
  }
});


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
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Vérification que le fichier est un PDF
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Le fichier doit être un PDF."));
    }
    cb(null, true);
  },

});

// Crée le dossier des fichiers si nécessaire
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}



// Route pour la soumission des données
app.post("/api/memoire", upload.single("file"), (req, res) => {
  const { libelle, annee, cycle, speciality, university, description, id_etudiant } =
    req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier téléchargé." });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  const query = `
    INSERT INTO memoire (libelle, annee, cycle, speciality, university, description, file_path, file_name, id_etudiant)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    libelle,
    annee,
    cycle,
    speciality,
    university,
    description,
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

// app.post("/api/etudiant", async (req, res) => {
//   const { name, surname, email, password } = req.body;

//   if (!name || !surname || !email || !password) {
//     return res.status(400).json({ message: "Tous les champs sont obligatoires." });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10); // Hachage avec un salt de 10

//     const query = `INSERT INTO etudiant(name, surname, email, password) VALUES(?, ?, ?, ?)`;
//     db.query(query, [name, surname, email, hashedPassword], (err, result) => {
//       if (err) {
//         console.error("Erreur lors de l'insertion :", err);
//         return res.status(500).json({ message: "Erreur interne du serveur." });
//       }
//       res.status(201).json({ message: "Inscription réussie !" });
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors du hachage du mot de passe." });
//   }
// });

app.post("/api/etudiant", async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const activationCode = generateActivationCode();

    const query = `
      INSERT INTO etudiant (name, surname, email, password, code, email_activated)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [name, surname, email, hashedPassword, activationCode, false], async (err, result) => {
      if (err) {
        console.error("Erreur lors de l'insertion :", err);
        return res.status(500).json({ message: "Erreur interne du serveur." });
      }

      // Envoi de l'email avec le code d'activation
      const subject = "Activation de votre compte AmphiMill";
      const text = `Bonjour ${name},\n\nVotre code d'activation est : ${activationCode}\nVeuillez entrer ce code pour activer votre compte.\n\nMerci !`;
      const html = `<p>Bonjour <strong>${name}</strong>,</p>
                    <p>Votre code d'activation est : <strong>${activationCode}</strong></p>
                    <p>Veuillez entrer ce code pour activer votre compte.</p>
                    <p>Merci !</p>`;

      const emailResult = await sendEmail(email, subject, text, html);

      if (!emailResult.success) {
        return res.status(500).json({ message: "Erreur lors de l'envoi de l'email d'activation." });
      }

      res.status(201).json({ message: "Inscription réussie ! Un email de validation a été envoyé." });
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du hachage du mot de passe." });
  }
});
//activqtion de compte 
app.post("/api/etudiant/activate", (req, res) => {
  const { email, code } = req.body;
  console.log("Données reçues:", email, code); 

  if (!email || !code) {
    return res.status(400).json({ message: "Email et code sont requis." });
  }

  const query = `SELECT code FROM etudiant WHERE email = ?`;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Erreur lors de la vérification du code :", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    if (results.length === 0 || results[0].code !== code) {
      return res.status(400).json({ message: "Code incorrect." });
    }

    const updateQuery = `UPDATE etudiant SET email_activated = true WHERE email = ?`;
    db.query(updateQuery, [email], (updateErr) => {
      if (updateErr) {
        console.error("Erreur lors de l'activation du compte :", updateErr);
        return res.status(500).json({ message: "Erreur interne du serveur." });
      }

      res.status(200).json({ message: "Compte activé avec succès !" });
    });
  });
});


// app.post("/api/login", (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email et mot de passe requis." });
//   }

//   const executeQuery = (query, params, role) => {
//     return new Promise((resolve, reject) => {
//       db.query(query, params, async (err, results) => {
//         if (err) return reject(err);

//         if (results.length > 0) {
//           const user = results[0];
//           const isValid = await bcrypt.compare(password, user.password); // Comparer les mots de passe

//           if (isValid) {
//             delete user.password; // Supprimer le mot de passe avant d'envoyer la réponse
//             resolve({ role, user });
//           } else {
//             resolve(null);
//           }
//         } else {
//           resolve(null);
//         }
//       });
//     });
//   };

//   const adminQuery = "SELECT * FROM admin WHERE email = ?";
//   const studentQuery = "SELECT * FROM etudiant WHERE email = ?";

//   Promise.all([
//     executeQuery(adminQuery, [email], "admin"),
//     executeQuery(studentQuery, [email], "etudiant"),
//   ])
//     .then(([adminResult, studentResult]) => {
//       if (adminResult) {
//         return res.status(200).json({
//           message: "Connexion administrateur réussie.",
//           role: adminResult.role,
//           user: adminResult.user,
//         });
//       }
//       if (studentResult) {
        
//         return res.status(200).json({
//           message: "Connexion réussie.",
//           role: studentResult.role,
//           user: studentResult.user,
//         });
//       }
//       return res.status(401).json({ message: "Email ou mot de passe incorrect." });
//     })
//     .catch((err) => {
//       console.error("Erreur lors de la connexion :", err);
//       return res.status(500).json({ message: "Erreur interne du serveur." });
//     });
// });
const executeQuery = (query, params, role) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, async (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
        const user = results[0];
        const isValid = await bcrypt.compare(params[1], user.password); // Comparer les mots de passe

        if (isValid) {
          if (role === "etudiant" && !user.email_activated) {
            return resolve({ notActivated: true });
          }
          delete user.password; // Supprimer le mot de passe avant d'envoyer la réponse
          resolve({ role, user });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const adminQuery = "SELECT * FROM admin WHERE email = ?";
  const studentQuery = "SELECT * FROM etudiant WHERE email = ?";

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
        if (studentResult.notActivated) {
          return res.status(403).json({ message: "Veuillez activer votre compte avant de vous connecter." });
        }
        return res.status(200).json({
          message: "Connexion réussie.",
          role: studentResult.role,
          user: studentResult.user,
        });
      }
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    })
    .catch((err) => {
      console.error("Erreur lors de la connexion :", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    });
});

app.get("/uploads/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "uploads", fileName);

  console.log("Téléchargement demandé pour le fichier :", filePath);

  fs.exists(filePath, (exists) => {
    if (exists) {
      res.sendFile(filePath);
    } else {
      console.error("Fichier non trouvé :", filePath);
      res.status(404).json({ message: "Fichier non trouvé." });
    }
  });
});

app.get("/api/memoireEtudiant", (req, res) => {
  const { id_etudiant } = req.query;

  if (!id_etudiant) {
    return res.status(400).json({ message: "ID étudiant requis." });
  }

  const query = `
    SELECT m.id_memoire, m.libelle, m.annee, m.cycle, m.speciality, m.university, m.description, m.file_name, m.file_path, e.name AS etudiant_nom
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
  const { status } = req.query; // Filtre sur le statut (validé, rejeté, etc.)

  let query = `
    SELECT m.id_memoire, m.libelle, m.annee, m.cycle, m.speciality, m.university, m.file_name, m.file_path, m.status, m.description, e.name AS etudiant_nom
    FROM memoire m
    JOIN etudiant e ON m.id_etudiant = e.id_etudiant
  `;
  
  const queryParams = [];
  
  // Si un status est fourni, ajoutez un filtre dans la requête
  if (status) {
    query += ` WHERE m.status = ?`; 
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

app.put("/api/memoire/:id/valider", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Le statut est requis." });
  }

  // Mise à jour du statut du mémoire
  const updateQuery = "UPDATE memoire SET status = ? WHERE id_memoire = ?";
  db.query(updateQuery, [status, id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour du mémoire :", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mémoire non trouvé." });
    }

    // Récupérer l'email de l'étudiant concerné
    const getEmailQuery = `
      SELECT e.email, e.name, m.libelle 
      FROM memoire m 
      JOIN etudiant e ON m.id_etudiant = e.id_etudiant 
      WHERE m.id_memoire = ?
    `;

    db.query(getEmailQuery, [id], async (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des informations de l'étudiant :", err);
        return res.status(500).json({ message: "Erreur interne du serveur." });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Étudiant non trouvé." });
      }

      const { email, name, libelle } = results[0];

      // Préparer et envoyer l'email
      const subject = `Validation de votre mémoire`;
      const text = `Bonjour ${name},\n\nVotre mémoire "${libelle}" a été ${status}.\nMerci !`;
      const html = `<p>Bonjour <strong>${name}</strong>,</p>
                    <p>Votre mémoire "<strong>${libelle}</strong>" a été <strong>${status}</strong>.</p>
                    <p>Merci !</p>`;

      const emailResult = await sendEmail(email, subject, text, html);

      if (!emailResult.success) {
        return res.status(500).json({ message: "Mémoire validé, mais erreur lors de l'envoi de l'email." });
      }

      res.status(200).json({ message: `Mémoire ${status} et notification envoyée à ${email}.` });
    });
  });
});


app.delete("/api/memoire/:id", (req, res) => {
  const { id } = req.params; // ID du mémoire à supprimer

  // Étape 1 : Récupérer le chemin du fichier à supprimer
  const query = "SELECT file_path FROM memoire WHERE id_memoire = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération du chemin du fichier :", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Mémoire non trouvé." });
    }

    const filePath = result[0].file_path;

    // Étape 2 : Supprimer le fichier physique du serveur
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Erreur lors de la suppression du fichier :", unlinkErr);
        return res.status(500).json({ message: "Erreur lors de la suppression du fichier." });
      }

      console.log("Fichier supprimé avec succès.");
    });

    // Étape 3 : Supprimer l'enregistrement du mémoire dans la base de données
    const deleteQuery = "DELETE FROM memoire WHERE id_memoire = ?";
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression du mémoire :", err);
        return res.status(500).json({ message: "Erreur lors de la suppression du mémoire." });
      }

      if (result.affectedRows > 0) {
        return res.status(200).json({ message: "Plan de travail supprimé avec succès." });
      } else {
        return res.status(404).json({ message: "Mémoire non trouvé." });
      }
    });
  });
});

//Recuperer les memoires valider ou rejeter 
// Ajoute un champ "raison_rejet" pour stocker la raison du rejet dans la base de données
app.patch("/api/memoire/:id", (req, res) => {
  const { action, raison_rejet } = req.body;
  const { id } = req.params;

  if (!['validated', 'rejected'].includes(action)) {
    return res.status(400).json({ message: "Action non valide." });
  }

  let query = 'UPDATE memoire SET status = ?';
  const queryParams = [action];

  if (action === 'rejected' && raison_rejet) {
    query += ', raison_rejet = ?';
    queryParams.push(raison_rejet);
  }

  query += ' WHERE id_memoire = ?';
  queryParams.push(id);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Erreur lors de la mise à jour du mémoire :", err);
      return res.status(500).json({ message: "Erreur lors de la mise à jour du mémoire." });
    }

    if (action === 'rejected' && raison_rejet) {
      // Envoyer un email ou une notification à l'étudiant avec la raison du rejet
      // Pour l'exemple, on imagine une fonction sendEmailToStudent
      const emailQuery = `
        SELECT e.email
        FROM etudiant e
        JOIN memoire m ON e.id_etudiant = m.id_etudiant
        WHERE m.id_memoire = ?
      `;
      
      db.query(emailQuery, [id], (err, results) => {
        if (err || results.length === 0) {
          console.error("Erreur lors de la récupération de l'email de l'étudiant :", err);
          return res.status(500).json({ message: "Erreur lors de l'envoi de l'email à l'étudiant." });
        }

        const studentEmail = results[0].email;
        sendEmailToStudent(studentEmail, raison_rejet); // fonction fictive d'envoi d'email
      });
    }

    res.status(200).json({ message: `Le mémoire a été ${action} avec succès.` });
  });
});

//recuperer les memoires valider pour le home 
app.get("/api/memoire", (req, res) => {
  // Récupérer le paramètre de filtre 'status' de la requête
  const { status } = req.query; // Par exemple, status = 'validated'

  // Construire la requête avec un filtre conditionnel pour 'status'
  let query = `
    SELECT m.id_memoire, m.libelle, m.annee, m.cycle, m.speciality, m.university, m.file_name, m.file_path, m.status, m.description, e.name AS etudiant_nom
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

app.get('/api/memoire/suggestions', (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    console.log("Aucune requête reçue pour les suggestions.");
    return res.json({ suggestions: [] });
  }

  // Requête SQL avec LIKE insensible à la casse
  const sql = `
    SELECT libelle 
    FROM memoire 
    WHERE LOWER(libelle) LIKE ? 
    AND status = 'validated' 
    LIMIT 5
  `;

  const queryParam = [`%${query}%`]; // Ajouter % pour une recherche partielle

  console.log("Exécution de la requête :", sql, queryParam);

  db.query(sql, queryParam, (err, results) => {
    if (err) {
      console.error("Erreur API suggestions :", err);
      return res.status(500).json({ error: "Erreur serveur", details: err.message });
    }

    res.json({ suggestions: results.map(m => m.libelle) });
  });
});



app.put("/api/memoire/reject/:id", (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  if (!rejection_reason) {
    return res.status(400).json({ message: "La raison du rejet est requise." });
  }

  // Mise à jour du statut et de la raison du rejet
  const updateQuery = `UPDATE memoire SET status = 'rejected', rejection_reason = ? WHERE id_memoire = ?`;

  db.query(updateQuery, [rejection_reason, id], (err, result) => {
    if (err) {
      console.error("Erreur SQL lors du rejet du mémoire :", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mémoire non trouvé." });
    }

    // Récupérer les infos de l'étudiant concerné
    const getStudentQuery = `
      SELECT e.id_etudiant, e.email, e.name, m.libelle 
      FROM memoire m 
      JOIN etudiant e ON m.id_etudiant = e.id_etudiant 
      WHERE m.id_memoire = ?
    `;

    db.query(getStudentQuery, [id], async (err, studentResult) => {
      if (err) {
        console.error("Erreur SQL lors de la récupération de l'étudiant :", err);
        return res.status(500).json({ message: "Erreur interne du serveur." });
      }

      if (studentResult.length === 0) {
        return res.status(404).json({ message: "Étudiant non trouvé." });
      }

      const { id_etudiant, email, name, libelle } = studentResult[0];
      const message = `Votre mémoire "${libelle}" a été rejeté pour la raison suivante : ${rejection_reason}`;

      // Envoi de l'email à l'étudiant
      const subject = `Rejet de votre mémoire`;
      const text = `Bonjour ${name},\n\nVotre mémoire "${libelle}" a été rejeté.\n\nRaison : ${rejection_reason}\n\nMerci de prendre en compte ces remarques.`;
      const html = `<p>Bonjour <strong>${name}</strong>,</p>
                    <p>Votre mémoire "<strong>${libelle}</strong>" a été <strong>rejeté</strong>.</p>
                    <p><strong>Raison :</strong> ${rejection_reason}</p>
                    <p>Merci de prendre en compte ces remarques.</p>`;

      const emailResult = await sendEmail(email, subject, text, html);

      if (!emailResult.success) {
        return res.status(500).json({ message: "Mémoire rejeté, mais erreur lors de l'envoi de l'email." });
      }

      // Insérer une notification en base de données
      const notificationQuery = `INSERT INTO notifications (id_etudiant, message) VALUES (?, ?)`;
      db.query(notificationQuery, [id_etudiant, message], (err, notifResult) => {
        if (err) {
          console.error("Erreur SQL lors de l'insertion de la notification :", err);
          return res.status(500).json({ message: "Mémoire rejeté, mais erreur lors de l'ajout de la notification." });
        }

        res.status(200).json({ message: "Mémoire rejeté, notification envoyée et email transmis." });
      });
    });
  });
});

// Route pour récupérer les notifications d'un étudiant
app.get("/api/notifications/:id_etudiant", (req, res) => {
  const { id_etudiant } = req.params;

  if (!id_etudiant) {
    return res.status(400).json({ message: "L'ID de l'étudiant est requis." });
  }

  const getNotificationsQuery = `SELECT * FROM notifications WHERE id_etudiant = ? ORDER BY date_creation DESC`;

  db.query(getNotificationsQuery, [id_etudiant], (err, results) => {
    if (err) {
      console.error("Erreur SQL lors de la récupération des notifications :", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    res.status(200).json({ notifications: results });
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

// envoie de mail 
const generateActivationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // Exemple : "A1B2C3"
};
//
const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: "AmphiMill <sophiamba17@gmail.com>",
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé :", info.response);
    return { success: true, info };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    return { success: false, error };
  }
};
app.post("/api/send-email", (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires." });
  }
  console.log(req.body)

  const mailOptions = {
    from: `AmphiMill`,
    to,
    subject,
    text,
    html,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Erreur lors de l'envoi de l'email:", err);
      return res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
    }

    res.status(200).json({ message: "Email envoyé avec succès !", info });
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
