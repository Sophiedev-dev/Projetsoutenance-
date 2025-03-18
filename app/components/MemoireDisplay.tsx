import React from 'react';
import ValidationBadge from './ValidationBadge';
import { ShieldCheck, Download, CheckCircle } from 'lucide-react';
import { Button } from '@react-pdf-viewer/core';

const MemoireDisplay = ({ memoire }) => {
  const handleDownloadWithVerification = async () => {
    try {
      console.log('Downloading memoire:', memoire.id_memoire);
      const response = await fetch(`http://localhost:5000/api/memoire/${memoire.id_memoire}/download`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const data = await response.blob();
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${memoire.libelle}_signed.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Document téléchargé avec succès. Vérifiez la dernière page pour les informations d\'authentification.');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Erreur lors du téléchargement. Veuillez réessayer.');
    }
  };

  return (
    <div className="relative p-4 border rounded-lg">
      {memoire.status === 'validated' && (
        <div className="space-y-4">
          <ValidationBadge 
            adminName={memoire.validated_by_name || 'Admin'}
            validationDate={new Date(memoire.validation_date).toLocaleDateString('fr-FR')}
          />
          <Button
            onClick={handleDownloadWithVerification}
            className="flex items-center gap-2 text-sm w-full justify-center bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger avec signature numérique</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MemoireDisplay;