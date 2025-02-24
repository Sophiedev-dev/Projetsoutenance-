const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); 
const nodemailer = require("nodemailer");
const { signDocument } = require('./utils/crypto');

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
app.use(cors({
  origin: 'http://localhost:3000', // URL de votre frontend
  credentials: true
}));
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
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Route pour récupérer tous les utilisateurs
app.get("/api/users", async (req, res) => {
  try {
    const query = `
      SELECT 
        id_etudiant,
        name,
        surname,
        email,
        phonenumber,
        university,
        faculty,
        speciality,
        email_activated,
        is_active
      FROM etudiant
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des utilisateurs:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur lors de la récupération des utilisateurs." 
        });
      }
      res.json({ 
        success: true, 
        users: results 
      });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des utilisateurs." 
    });
  }
});
// Route pour créer un utilisateur
app.post("/api/users", async (req, res) => {
  const { name, surname, email, password, phonenumber, university, faculty, speciality } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO etudiant (
        name, 
        surname, 
        email, 
        password, 
        phonenumber, 
        university, 
        faculty, 
        speciality, 
        email_activated,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, true)
    `;
    
    const values = [
      name, 
      surname, 
      email, 
      hashedPassword, 
      phonenumber || null, 
      university || null, 
      faculty || null, 
      speciality || null
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Erreur lors de la création de l'utilisateur:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur lors de la création de l'utilisateur." 
        });
      }
      res.status(201).json({ 
        success: true, 
        message: "Utilisateur créé avec succès" 
      });
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la création de l'utilisateur." 
    });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, surname, email, is_active } = req.body;
  try {
    const query = `
      UPDATE etudiant 
      SET name = ?, surname = ?, email = ?, is_active = ?
      WHERE id_etudiant = ?
    `;
    await db.promise().query(query, [name, surname, email, is_active, id]);
    res.json({ message: "Utilisateur mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = "DELETE FROM etudiant WHERE id_etudiant = ?";
    await db.promise().query(query, [id]);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
  }
});

// Route pour la "soft delete" des utilisateurs
app.put("/api/users/:id/soft-delete", (req, res) => {
  const { id } = req.params;
  
  // Vérifier d'abord si l'utilisateur existe
  const checkQuery = "SELECT * FROM etudiant WHERE id_etudiant = ?";
  
  db.query(checkQuery, [id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Erreur lors de la vérification:", checkErr);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la vérification de l'utilisateur" 
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Utilisateur non trouvé" 
      });
    }

    // Commencer la transaction
    db.beginTransaction((err) => {
      if (err) {
        console.error("Erreur de transaction:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur lors de la suppression" 
        });
      }

      // 1. Insérer dans deleted_users
      const insertQuery = `
        INSERT INTO deleted_users (
          id_etudiant, name, surname, email, password, 
          phonenumber, university, faculty, speciality, 
          id_role, deleted_at
        )
        SELECT 
          id_etudiant, name, surname, email, password, 
          phonenumber, university, faculty, speciality, 
          id_role, CURRENT_TIMESTAMP
        FROM etudiant 
        WHERE id_etudiant = ?
      `;

      db.query(insertQuery, [id], (insertErr) => {
        if (insertErr) {
          return db.rollback(() => {
            console.error("Erreur d'insertion:", insertErr);
            res.status(500).json({ 
              success: false, 
              message: "Erreur lors de la suppression" 
            });
          });
        }

        // 2. Supprimer de la table etudiant
        const deleteQuery = "DELETE FROM etudiant WHERE id_etudiant = ?";
        
        db.query(deleteQuery, [id], (deleteErr) => {
          if (deleteErr) {
            return db.rollback(() => {
              console.error("Erreur de suppression:", deleteErr);
              res.status(500).json({ 
                success: false, 
                message: "Erreur lors de la suppression" 
              });
            });
          }

          // Valider la transaction
          db.commit((commitErr) => {
            if (commitErr) {
              return db.rollback(() => {
                console.error("Erreur de commit:", commitErr);
                res.status(500).json({ 
                  success: false, 
                  message: "Erreur lors de la suppression" 
                });
              });
            }
            res.json({ 
              success: true, 
              message: "Utilisateur déplacé vers la corbeille" 
            });
          });
        });
      });
    });
  });
});

// Route pour restaurer un utilisateur
app.put("/api/users/:id/restore", (req, res) => {
  const { id } = req.params;
  
  // Vérifier d'abord si l'utilisateur existe dans la corbeille
  const checkQuery = "SELECT * FROM deleted_users WHERE id_etudiant = ?";
  
  db.query(checkQuery, [id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Erreur lors de la vérification:", checkErr);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la vérification de l'utilisateur" 
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Utilisateur non trouvé dans la corbeille" 
      });
    }

    const user = checkResults[0];

    // Commencer la transaction
    db.beginTransaction((err) => {
      if (err) {
        console.error("Erreur de transaction:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur lors de la restauration" 
        });
      }

      // 1. Réinsérer dans la table etudiant
      const insertQuery = `
        INSERT INTO etudiant (
          id_etudiant, name, surname, email, password, 
          phonenumber, university, faculty, speciality, 
          id_role, email_activated, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
      `;

      const values = [
        user.id_etudiant,
        user.name,
        user.surname,
        user.email,
        user.password,
        user.phonenumber,
        user.university,
        user.faculty,
        user.speciality,
        user.id_role
      ];

      db.query(insertQuery, values, (insertErr) => {
        if (insertErr) {
          return db.rollback(() => {
            console.error("Erreur d'insertion:", insertErr);
            res.status(500).json({ 
              success: false, 
              message: "Erreur lors de la restauration" 
            });
          });
        }

        // 2. Supprimer de la table deleted_users
        const deleteQuery = "DELETE FROM deleted_users WHERE id_etudiant = ?";
        
        db.query(deleteQuery, [id], (deleteErr) => {
          if (deleteErr) {
            return db.rollback(() => {
              console.error("Erreur de suppression:", deleteErr);
              res.status(500).json({ 
                success: false, 
                message: "Erreur lors de la restauration" 
              });
            });
          }

          // Valider la transaction
          db.commit((commitErr) => {
            if (commitErr) {
              return db.rollback(() => {
                console.error("Erreur de commit:", commitErr);
                res.status(500).json({ 
                  success: false, 
                  message: "Erreur lors de la restauration" 
                });
              });
            }
            res.json({ 
              success: true, 
              message: "Utilisateur restauré avec succès" 
            });
          });
        });
      });
    });
  });
});

// Route pour obtenir les utilisateurs supprimés
app.get("/api/users/trash", (req, res) => {
  const query = `
    SELECT id_etudiant, name, surname, email, university, 
           faculty, speciality, deleted_at 
    FROM deleted_users
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la récupération des utilisateurs supprimés" 
      });
    }
    
    res.json({ 
      success: true, 
      users: results 
    });
  });
});

// Route pour la soumission des données
app.post("/api/memoire", upload.single("file"), (req, res) => {
  const {
    libelle,
    annee, 
    cycle, 
    speciality,
    university,
    description,
    id_etudiant,
    mention,
    status
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier téléchargé." });
  }

  // Validation de la mention
  const validMentions = ['Passable', 'Bien', 'Tres Bien', 'Excellent'];
  if (mention && !validMentions.includes(mention)) {
    return res.status(400).json({ message: 'Mention invalide' });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  const query = `
    INSERT INTO memoire (
      libelle, annee, cycle, speciality, university, 
      description, file_path, file_name, id_etudiant, mention
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    mention || null // Ajout de la mention avec valeur par défaut null
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

app.get("/api/admin", async (req, res) => {
  try {
    // Statistiques sur les mémoires
    const [total] = await db.promise().query("SELECT COUNT(*) AS total FROM memoire");
    const [validated] = await db.promise().query("SELECT COUNT(*) AS validated FROM memoire WHERE status = 'validated'");
    const [rejected] = await db.promise().query("SELECT COUNT(*) AS rejected FROM memoire WHERE status = 'rejected'");
    const [pending] = await db.promise().query("SELECT COUNT(*) AS pending FROM memoire WHERE status = 'pending'");

    // Statistiques sur les utilisateurs
    const [totalUsers] = await db.promise().query("SELECT COUNT(*) AS totalUsers FROM etudiant");
    const [activeUsers] = await db.promise().query("SELECT COUNT(*) AS activeUsers FROM etudiant WHERE is_active = 1");

    res.json({
      total: total[0].total,
      validated: validated[0].validated,
      rejected: rejected[0].rejected,
      pending: pending[0].pending,
      totalUsers: totalUsers[0].totalUsers,
      activeUsers: activeUsers[0].activeUsers
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques." });
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    // Statistiques récentes sur les mémoires soumises
    const [recentSubmissions] = await db.promise().query(`
      SELECT m.*, e.name as etudiant_nom 
      FROM memoire m 
      JOIN etudiant e ON m.id_etudiant = e.id_etudiant 
      ORDER BY m.date_soumission DESC LIMIT 5
    `);

    // Top spécialités les plus populaires avec gestion des valeurs NULL
    const [topSpecialities] = await db.promise().query(`
      SELECT 
        COALESCE(speciality, 'Non spécifié') as speciality,
        COUNT(*) AS count
      FROM memoire
      WHERE speciality IS NOT NULL 
      AND speciality != ''
      GROUP BY speciality
      ORDER BY count DESC
      LIMIT 5
    `);

    // Statistiques sur les soumissions mensuelles
    const [monthlySubmissions] = await db.promise().query(`
      SELECT 
        MONTH(date_soumission) AS month,
        COUNT(*) AS submissions
      FROM memoire
      WHERE date_soumission IS NOT NULL
      GROUP BY MONTH(date_soumission)
      ORDER BY month
    `);

    // Si aucune spécialité n'est trouvée, renvoyer un tableau vide
    const formattedTopSpecialities = topSpecialities.length > 0 ? topSpecialities : [];

    res.json({
      success: true,
      recentSubmissions: recentSubmissions,
      topSpecialities: formattedTopSpecialities,
      monthlySubmissions: monthlySubmissions
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques du tableau de bord:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération des statistiques du tableau de bord." 
    });
  }
});

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

const executeQuery = (query, params, type) => {
  return new Promise((resolve, reject) => {
    db.query(query, [params[0]], async (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      if (results.length === 0) {
        resolve(null);
        return;
      }

      const user = results[0];
      const validPassword = await bcrypt.compare(params[1], user.password);

      if (!validPassword) {
        resolve(null);
        return;
      }

      if (type === "admin") {
        resolve({
          role: "admin",
          user: {
            id_admin: user.id_admin,
            name: user.name,
            email: user.email
          }
        });
      } else {
        // Pour les étudiants, on utilise user au lieu de etudiant
        resolve({
          role: "etudiant",
          user: {
            id_etudiant: user.id_etudiant, // Utiliser user au lieu de etudiant
            name: user.name,
            email: user.email
          },
          notActivated: !user.email_activated
        });
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
        // S'assurer que l'ID est bien inclus dans la réponse
        console.log('Données étudiant:', studentResult); // Pour déboguer
        return res.status(200).json({
          message: "Connexion réussie",
          role: studentResult.role,
          user: studentResult.user // Contient maintenant id_etudiant, name et email
        });
      }
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    })
    .catch((err) => {
      console.error("Erreur lors de la connexion :", err);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    });
});

app.get("/uploads/:filename", async (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "uploads", fileName);

  console.log("Requête pour le fichier :", filePath);

  try {
    // Vérifie si le fichier existe
    await fs.promises.access(filePath);

    // Définit les en-têtes appropriés
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.setHeader("Access-Control-Allow-Origin", "*"); // Permet l'accès depuis le frontend

    // Stream du fichier
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    console.error("Fichier non trouvé :", filePath);
    res.status(404).json({ message: "Fichier non trouvé", filePath });
  }
});


app.get("/api/check-file/:filename", async (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "uploads", fileName);

  try {
    const exists = await fs.promises.access(filePath)
      .then(() => true)
      .catch(() => false);

    res.json({ 
      exists, 
      filePath,
      url: exists ? `/uploads/${fileName}` : null 
    });
  } catch (error) {
    res.status(500).json({ 
      exists: false, 
      error: error.message 
    });
  }
});

app.get("/api/memoireEtudiant", (req, res) => {
  const { id_etudiant } = req.query;
  console.log("ID étudiant reçu:", id_etudiant);

  if (!id_etudiant) {
    return res.status(400).json({ message: "ID étudiant requis." });
  }

  const query = `
    SELECT m.*, e.name AS etudiant_nom
    FROM memoire m
    JOIN etudiant e ON m.id_etudiant = e.id_etudiant
    WHERE m.id_etudiant = ?
  `;

  db.query(query, [id_etudiant], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des mémoires :", err);
      return res.status(500).json({ message: "Erreur lors de la récupération des mémoires." });
    }

    // Renvoyer directement le tableau de résultats
    res.status(200).json(results);
  });
});

// Récupérer tous les mémoires avec les informations de l'étudiant
app.get("/api/memoire", (req, res) => {
  const { status } = req.query; // Filtre sur le statut (validé, rejeté, etc.)

  let query = `
    SELECT m.id_memoire, m.libelle, m.annee, m.cycle, m.speciality, m.university, 
           m.file_name, m.file_path, m.status, m.description, m.file_status, m.mention,
           e.name AS etudiant_nom
    FROM memoire m
    JOIN etudiant e ON m.id_etudiant = e.id_etudiant
    WHERE m.file_status = 'available'`; // Ne récupérer que les fichiers disponibles
  
  const queryParams = [];

  // Ajout d'un filtre optionnel sur le status
  if (status) {
    query += ` AND m.status = ?`; 
    queryParams.push(status);
  }

  console.log("Exécution de la requête :", query, queryParams);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des mémoires :", err);
      return res.status(500).json({ message: "Erreur lors de la récupération des mémoires." });
    }

    const filteredResults = results.filter((memoire) => {
      const filePath = path.join(__dirname, "uploads", memoire.file_name);
      return fs.existsSync(filePath); // Ne renvoyer que les fichiers existants
    });

    res.status(200).json({ memoire: results });
  });
});


// Fonction pour générer une paire de clés
const generateSignature = (data) => {
  try {
    // Générer une paire de clés
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Créer la signature
    const sign = crypto.createSign('SHA256');
    sign.write(data);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');

    return {
      signature,
      publicKey
    };
  } catch (error) {
    console.error('Erreur lors de la génération de la signature:', error);
    throw new Error('Erreur lors de la génération de la signature');
  }
};

// Route pour générer et stocker les clés pour un admin
app.post("/api/admin/generate-keys", async (req, res) => {
  const { id_admin } = req.body;

  try {
    // Générer une nouvelle paire de clés
    const { publicKey, privateKey } = generateKeyPair();

    // Mettre à jour l'admin avec les nouvelles clés
    await db.promise().query(
      "UPDATE admin SET public_key = ?, private_key = ? WHERE id_admin = ?",
      [publicKey, privateKey, id_admin]
    );

    res.json({ message: "Clés générées et stockées avec succès" });
  } catch (error) {
    console.error("Erreur lors de la génération des clés:", error);
    res.status(500).json({ message: "Erreur lors de la génération des clés" });
  }
});


app.put("/api/memoire/:id/valider", async (req, res) => {
  console.log('Route de validation appelée');
  console.log('Params:', req.params);
  console.log('Body:', req.body);

  const { id } = req.params;
  const { status, id_admin } = req.body;

  if (!status || !id_admin) {
    return res.status(400).json({ message: "Le statut et l'ID admin sont requis." });
  }

  try {
    // Récupérer les informations du mémoire et de l'étudiant
    const [results] = await db.promise().query(`
      SELECT e.email, e.name, m.* 
      FROM memoire m 
      JOIN etudiant e ON m.id_etudiant = e.id_etudiant 
      WHERE m.id_memoire = ?
    `, [id]);

    if (results.length === 0) {
      throw new Error("Mémoire ou étudiant non trouvé");
    }

    const { email, name, libelle } = results[0];
    console.log('Informations récupérées:', { email, name, libelle });

    if (status === 'validated') {
      try {
        // Vérifier si une signature existe déjà
        const [existingSignature] = await db.promise().query(
          'SELECT * FROM digital_signatures WHERE id_memoire = ?',
          [id]
        );

        if (existingSignature.length === 0) {
          const dataToSign = JSON.stringify({
            id_memoire: id,
            libelle: libelle,
            etudiant_id: results[0].id_etudiant,
            date_validation: new Date().toISOString()
          });

          const { signature, publicKey } = generateSignature(dataToSign);

          // Sauvegarder la signature
          await db.promise().query(
            `INSERT INTO digital_signatures 
             (id_memoire, id_admin, signature, public_key, signed_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [id, id_admin, signature, publicKey]
          );
        }

        // Mise à jour du statut
        await db.promise().query(
          "UPDATE memoire SET status = ?, validated_by = ? WHERE id_memoire = ?",
          [status, id_admin, id]
        );

        // Récupérer les détails de l'admin pour l'email
        const [adminDetails] = await db.promise().query(
          "SELECT name FROM admin WHERE id_admin = ?",
          [id_admin]
        );

        // Préparer l'email
        const subject = `Validation de votre mémoire`;
        const text = `Bonjour ${name},\n\n
          Votre mémoire "${libelle}" a été validé par ${adminDetails[0].name}.\n
          Date de validation: ${new Date().toLocaleDateString()}.\n\n
          Félicitations !\n
          Cordialement,`;

        const html = `
          <p>Bonjour <strong>${name}</strong>,</p>
          <p>Votre mémoire "<strong>${libelle}</strong>" a été validé.</p>
          <p><strong>Validé par:</strong> ${adminDetails[0].name}</p>
          <p><strong>Date de validation:</strong> ${new Date().toLocaleDateString()}</p>
          <p>Félicitations !</p>
          <p>Cordialement,</p>`;

        console.log('Tentative d\'envoi d\'email à:', email);

        // Envoi de l'email
        const emailResult = await sendEmail(email, subject, text, html);
        console.log('Résultat de l\'envoi d\'email:', emailResult);

        if (!emailResult.success) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailResult.error);
        }

        return res.status(200).json({
          success: true,
          message: `Mémoire validé${emailResult.success ? ' et notification envoyée' : ''} à ${email}`,
          emailSent: emailResult.success
        });

      } catch (error) {
        console.error('Erreur lors de la validation:', error);
        throw new Error('Erreur lors de la validation du mémoire');
      }
    }

  } catch (error) {
    console.error("Erreur lors de la validation:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la validation du mémoire",
      error: error.message
    });
  }
});


app.delete("/api/memoire/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Étape 1 : Récupérer le chemin du fichier
    const [fileResult] = await db.promise().query(
      "SELECT file_path FROM memoire WHERE id_memoire = ?",
      [id]
    );

    if (fileResult.length === 0) {
      return res.status(404).json({ message: "Mémoire non trouvé." });
    }

    const filePath = fileResult[0].file_path;
    console.log("Chemin du fichier récupéré :", filePath);

    // Étape 2 : Supprimer les signatures associées
    await db.promise().query(
      "DELETE FROM digital_signatures WHERE id_memoire = ?",
      [id]
    );

    // Étape 3 : Supprimer le fichier physique (si existe)
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
        console.log("Fichier supprimé avec succès:", filePath);
      } catch (unlinkErr) {
        console.error("Erreur lors de la suppression du fichier :", unlinkErr);
        // On continue même si le fichier n'a pas pu être supprimé
      }
    } else {
      console.log("Fichier non trouvé :", filePath);
      // On continue même si le fichier n'existe pas
    }

    // Étape 4 : Supprimer l'enregistrement du mémoire
    const [deleteResult] = await db.promise().query(
      "DELETE FROM memoire WHERE id_memoire = ?",
      [id]
    );

    if (deleteResult.affectedRows > 0) {
      return res.status(200).json({ 
        success: true,
        message: "Mémoire et signatures associées supprimés avec succès.",
        fileDeleted: fs.existsSync(filePath)
      });
    } else {
      return res.status(404).json({ 
        success: false,
        message: "Mémoire non trouvé." 
      });
    }

  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return res.status(500).json({ 
      success: false,
      message: "Erreur lors de la suppression du mémoire.",
      error: error.message 
    });
  }
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
      // Envoyer un email ou une notification à l'étudiant
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

//recuperer les statistiques sur les moires pour le home 
// Route pour obtenir les statistiques
app.get("/api/stats", async (req, res) => {
  try {
    const [stats] = await db.promise().query(`
      SELECT 
        (SELECT COUNT(*) FROM memoire WHERE status = 'validated') as memoires,
        (SELECT COUNT(DISTINCT id_etudiant) FROM memoire) as chercheurs,
        (SELECT COUNT(DISTINCT speciality) FROM memoire) as specialites
    `);

    res.json({
      success: true,
      memoires: stats[0].memoires || 0,
      chercheurs: stats[0].chercheurs || 0,
      specialites: stats[0].specialites || 0
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: error.message
    });
  }
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

// Route pour obtenir un mémoire spécifique
app.get("/api/memoire/:id", (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT m.*, e.name AS etudiant_nom
    FROM memoire m
    JOIN etudiant e ON m.id_etudiant = e.id_etudiant
    WHERE m.id_memoire = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération du mémoire:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la récupération du mémoire" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Mémoire non trouvé" 
      });
    }

    res.json({ 
      success: true, 
      memoire: results[0] 
    });
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

// Fonction de vérification de signature
const verifySignature = (data, signature, publicKey) => {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(publicKey, signature, 'base64');
  } catch (error) {
    console.error('Erreur de vérification:', error);
    return false;
  }
};


// Route pour vérifier la signature
app.get("/api/memoire/:id/verify-signature", async (req, res) => {
  const { id } = req.params;
  console.log('Requête reçue pour ID:', id); // Debug log

  try {
    // Vérifier si la signature existe
    const query = `
      SELECT 
        ds.id as signature_id,
        ds.signed_at,
        a.name as admin_name,
        m.libelle
      FROM digital_signatures ds 
      JOIN admin a ON ds.admin_id = a.id_admin 
      JOIN memoire m ON ds.memoire_id = m.id_memoire
      WHERE ds.memoire_id = ?
    `;

    console.log('Exécution de la requête:', query); // Debug log
    
    const [rows] = await db.promise().query(query, [id]);
    console.log('Résultats de la requête:', rows); // Debug log

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucune signature trouvée pour ce mémoire"
      });
    }

    const signatureInfo = rows[0];
    
    return res.status(200).json({
      success: true,
      details: {
        signedBy: signatureInfo.admin_name,
        signedAt: signatureInfo.signed_at,
        memoire: signatureInfo.libelle
      }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification de la signature",
      error: error.message
    });
  }
});





