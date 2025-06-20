'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import {
  ChevronLeft,
  Download,
  Share2,
  User,
  Calendar,
  GraduationCap,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { MentionStars } from '@/app/components/MentionStars';
import { motion } from 'framer-motion';
import { getApiUrl } from '@/app/utils/config';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface Memoire {
  id_memoire: string;
  libelle: string;
  etudiant_nom: string;
  annee: string;
  cycle: string;
  speciality: string;
  mention?: number;
  status: string;
  admin_name?: string;
  validation_date?: string;
  file_path: string;
  validated_by_name?: string;
  signature: {
    public_key: string;
    signature: string; 
  } | null;
}

type MentionType = "Passable" | "Bien" | "Tres Bien" | "Excellent" | null;

const getMentionLabel = (mention?: number): MentionType => {
  switch (mention) {
    case 1: return "Passable";
    case 2: return "Bien";
    case 3: return "Tres Bien";
    case 4: return "Excellent";
    default: return null;
  }
};

const MemoirePage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [memoire, setMemoire] = useState<Memoire | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const fetchMemoireDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      const [detailsResponse, signatureResponse] = await Promise.all([
        fetch(getApiUrl(`/api/memoire/${params.id}`)),
        fetch(getApiUrl(`/api/memoire/${params.id}/signature`))
      ]);

      if (!detailsResponse.ok) throw new Error(`HTTP error! status: ${detailsResponse.status}`);
      
      const detailsData = await detailsResponse.json();
      const signatureData = await signatureResponse.json();

      if (detailsData.success) {
        const memoireData: Memoire = {
          ...detailsData.memoire,
          validated_by_name: detailsData.memoire.admin_name,
          validation_date: detailsData.memoire.validation_date,
          signature: signatureData.success && signatureData.signature ? {
            signature: signatureData.signature,
            public_key: signatureData.public_key
          } : null
        };

        setMemoire(memoireData);

        // Chargement immédiat du PDF sans attendre
        const downloadResponse = await fetch(getApiUrl(`/api/memoire/${params.id}/download`));
        if (!downloadResponse.ok) throw new Error(`Download failed: ${downloadResponse.status}`);
        
        const downloadData = await downloadResponse.json();
        if (downloadData.success && downloadData.url) {
          setPdfUrl(downloadData.url.replace('ue-north-1', 'eu-north-1'));
        } else {
          throw new Error('URL de téléchargement non disponible');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchMemoireDetails();
  }, [fetchMemoireDetails]);

  const handleDownload = useCallback(async () => {
    if (!memoire) return;
    
    try {
      setDownloading(true);
      
      // Vérifier si le document est signé
      if (memoire.status === 'validated' && memoire.signature) {
        console.log('Downloading memoire with signature:', memoire.id_memoire);
        const response = await fetch(getApiUrl(`/api/memoire/${memoire.id_memoire}/download`));
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.url) {
          throw new Error('URL de téléchargement non disponible');
        }
  
        // Correction de l'URL S3
        const correctedUrl = data.url.replace('ue-north-1', 'eu-north-1');
        
        // Télécharger le fichier à partir de l'URL signée corrigée
        const pdfResponse = await fetch(correctedUrl);
        if (!pdfResponse.ok) {
          throw new Error('Erreur lors du téléchargement du PDF');
        }
  
        const pdfBytes = await pdfResponse.arrayBuffer();
        
        // Charger le PDF existant
        const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Ajouter une nouvelle page pour les informations de signature
        const page = pdfDoc.addPage([550, 750]);
        const { height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;
  
        // Créer le texte de signature
        const signatureInfo = {
          id_memoire: memoire.id_memoire,
          titre: memoire.libelle,
          validation: {
            date: memoire.validation_date,
            validateur: memoire.validated_by_name,
            signature_electronique: {
              algorithme: 'SHA-256',
              empreinte: `${memoire.id_memoire}_${memoire.validation_date}`,
              signature: memoire.signature?.signature || 'Signature non disponible',
              cle_publique: memoire.signature?.public_key || 'Clé publique non disponible',
              horodatage: new Date().toISOString()
            }
          }
        };
  
        // Écrire les informations sur la nouvelle page
        const writeText = (text: string, y: number) => {
          page.drawText(text, {
            x: 50,
            y: height - y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        };
  
        // Titre
        page.drawText('INFORMATIONS DE SIGNATURE ÉLECTRONIQUE', {
          x: 50,
          y: height - 50,
          size: 16,
          font,
          color: rgb(0, 0, 0),
        });
  
        // Informations du document
        writeText(`ID Document: ${signatureInfo.id_memoire}`, 100);
        writeText(`Titre: ${signatureInfo.titre}`, 120);
        writeText(`Date de validation: ${signatureInfo.validation.date ? 
          new Date(signatureInfo.validation.date).toLocaleDateString('fr-FR') : 
          'Non disponible'}`, 140);
        writeText(`Validateur: ${signatureInfo.validation.validateur || 'Non disponible'}`, 160);
  
        // Informations de signature électronique
        writeText('INFORMATIONS DE SIGNATURE', 200);
        writeText(`Algorithme: ${signatureInfo.validation.signature_electronique.algorithme}`, 220);
        writeText(`Empreinte: ${signatureInfo.validation.signature_electronique.empreinte}`, 240);
        writeText(`Signature: ${signatureInfo.validation.signature_electronique.signature.substring(0, 50)}...`, 260);
  
        // Clé publique
        writeText('CLÉ PUBLIQUE:', 280);
        const publicKeyLines = signatureInfo.validation.signature_electronique.cle_publique.match(/.{1,80}/g) || [];
        publicKeyLines.forEach((line, index) => {
          writeText(line, 300 + (index * 20));
        });
  
        writeText(`Horodatage: ${new Date(signatureInfo.validation.signature_electronique.horodatage).toLocaleString('fr-FR')}`, 500);
  
        // Sauvegarder le PDF modifié
        const modifiedPdfBytes = await pdfDoc.save();
        
        // Créer le Blob et télécharger
        const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(modifiedPdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${memoire.libelle.replace(/[^a-z0-9]/gi, '_')}_signé.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Téléchargement normal si non signé
        const response = await fetch(getApiUrl(`/api/memoire/${memoire.id_memoire}/download`));
        if (!response.ok) throw new Error(`Download failed: ${response.status}`);
        
        const data = await response.json();
        if (!data.success || !data.url) throw new Error('URL de téléchargement non disponible');
  
        const correctedUrl = data.url.replace('ue-north-1', 'eu-north-1');
        window.open(correctedUrl, '_blank');
      }
      
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Erreur lors du téléchargement. Veuillez réessayer.');
    } finally {
      setDownloading(false);
    }
  }, [memoire]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (!memoire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mémoire non trouvé</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Retour à l&rsquo;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="ml-2 font-medium">Retour</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {memoire.status === 'validated' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${downloading ? 'opacity-75' : ''}`}
                >
                  {downloading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span className="font-medium">Télécharger</span>
                    </>
                  )}
                </motion.button>
              )}
              <button 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Partager"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-8 bg-white shadow-sm relative">
        {memoire.status === 'validated' && (
          <div className="absolute top-4 right-8 flex items-center bg-green-50 border-2 border-green-200 px-6 py-3 rounded-full shadow-lg transform translate-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium whitespace-nowrap">Document Authentifié</span>
            </div>
          </div>
        )}
        
        {memoire.status === 'validated' && memoire.validated_by_name && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-lg p-4 shadow-sm ml-auto max-w-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Document Signé Electroniquement</h3>
                  <p className="text-green-600">
                    Signé par {memoire.validated_by_name} le{' '}
                    {memoire.validation_date ? new Date(memoire.validation_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            {memoire.libelle}
          </motion.h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Étudiant: <span className="text-gray-900">{memoire.etudiant_nom}</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Année: <span className="text-gray-900">{memoire.annee}</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Cycle: <span className="text-gray-900">{memoire.cycle}</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Spécialité: <span className="text-gray-900">{memoire.speciality}</span></span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Mention</h3>
                {memoire.mention ? (
                  <div className="flex items-center">
                    <MentionStars mention={getMentionLabel(memoire.mention)} size="lg" />
                    <span className="ml-2 text-gray-700">
                      {getMentionLabel(memoire.mention)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Non noté</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 h-[calc(100vh-13rem)]">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          {pdfUrl ? (
            <Viewer
              fileUrl={pdfUrl}
              defaultScale={1.2}
              theme={{
                theme: 'dark',
              }}
              renderLoader={(percentages: number) => (
                <div className="flex flex-col items-center justify-center h-full bg-gray-900">
                  <div className="w-64 bg-gray-700 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${percentages}%` }}
                    ></div>
                  </div>
                  <p className="text-white">Chargement du document... {Math.round(percentages)}%</p>
                </div>
              )}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                <p className="text-white">Préparation du document...</p>
              </div>
            </div>
          )}
        </Worker>
      </div>
    </div>
  );
};

export default MemoirePage;