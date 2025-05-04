// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mysql = require('mysql');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bodyParser = require('body-parser');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost', // Remplacez par votre hôte en ligne
  user: 'seedsoft_sophia',
  password: 'bank-memo25',
  database: 'seedsoft_bank-memo',
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données');
});

// Route pour recevoir les données
app.post('/api/memoires', (req, res) => {
  const {
    libelle,
    annee,
    cycle,
    specialiter,
    universite,
    idMemoire,
    idEtudiant,
    nomFichier,
  } = req.body;

  const query = `
    INSERT INTO memoires (libelle, annee, cycle, specialiter, universite, idMemoire, idEtudiant, nomFichier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [libelle, annee, cycle, specialiter, universite, idMemoire, idEtudiant, nomFichier],
    (err) => {
      if (err) {
        console.error('Erreur lors de l\'insertion:', err);
        res.status(500).json({ error: 'Erreur lors de l\'insertion' });
        return;
      }
      res.status(200).json({ message: 'Mémoire ajouté avec succès' });
    }
  );
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
