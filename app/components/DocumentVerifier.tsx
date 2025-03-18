import React, { useState } from 'react';
import { Upload, Key, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { verifyDocument, VerificationResult } from '../utils/documentVerificationService';
import { toast } from 'react-toastify';

const DocumentVerifier = () => {
  const [file, setFile] = useState<File | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Ajoutez la fonction handleDownloadReport à l'intérieur du composant
  const handleDownloadReport = () => {
    if (!verificationResult?.isValid) return;
    
    const reportContent = `
RAPPORT DE VÉRIFICATION D'AUTHENTICITÉ
=====================================

RÉSULTAT: DOCUMENT AUTHENTIQUE
-----------------------------
${verificationResult.message}

DÉTAILS DE LA VÉRIFICATION
--------------------------
Validé par: ${verificationResult.details?.adminName}
Date de validation: ${verificationResult.details?.signedAt}
Document: ${verificationResult.details?.documentTitle}

Ce rapport a été généré automatiquement par le système ARCHIVA.
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rapport_verification.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (selectedFile) {
      toast({
        title: "Fichier sélectionné",
        description: `"${selectedFile.name}" a été sélectionné`,
      });
    }
    
    // Reset verification result when file changes
    setVerificationResult(null);
  };

  const handlePublicKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPublicKey(e.target.value);
    // Reset verification result when key changes
    setVerificationResult(null);
  };

  const handleVerifyClick = async () => {
    if (!file) {
      toast({
        title: "Fichier manquant",
        description: "Veuillez télécharger un document à vérifier",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      // Pass the public key if provided, otherwise the function will try to extract it
      const result = await verifyDocument(file, publicKey.trim() || undefined);
      setVerificationResult(result);
      
      toast({
        title: result.isValid ? "Vérification réussie" : "Vérification échouée",
        description: result.message,
        variant: result.isValid ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error verifying document:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Upload Section */}
        <div className="relative group">
          <div className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 rounded-xl p-8 border-2 border-dashed border-blue-200 transition-colors duration-300 h-full">
            <div className="mb-4">
              <Upload 
                className="h-12 w-12 text-[#6366F1] animate-bounce-gentle" 
                strokeWidth={1.5} 
              />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Téléchargez votre document
            </h3>
            <p className="text-gray-600 text-center text-sm mb-4">
              Le document doit contenir une signature numérique valide
            </p>
            
            <input
              type="file"
              id="document-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
            >
              Choisir un fichier
            </label>
            
            {file && (
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium">Fichier: {file.name}</p>
                <p>{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </div>
        </div>

        {/* Public Key Section - Optional */}
        <div className="relative group">
          <div className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 rounded-xl p-8 border-2 border-dashed border-purple-200 transition-colors duration-300 h-full">
            <div className="mb-4">
              <Key 
                className="h-12 w-12 text-[#6366F1] animate-bounce-gentle" 
                strokeWidth={1.5} 
              />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Entrez la clé publique (optionnel)
            </h3>
            <p className="text-gray-600 text-center text-sm mb-4">
              Si le document ne contient pas la clé publique, vous pouvez la fournir ici
            </p>
            
            <textarea
              placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...&#10;-----END PUBLIC KEY-----"
              className="w-full h-32 mb-2 font-mono text-xs border-purple-200 focus:border-purple-400"
              value={publicKey}
              onChange={handlePublicKeyChange}
            />
          </div>
        </div>
        </div>

      {/* Verify Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleVerifyClick}
          disabled={!file || verifying}
          className="bg-gradient-to-r from-[#6366F1] to-[#9333EA] hover:from-[#4F46E5] hover:to-[#7E22CE] text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] font-medium"
        >
          {verifying ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              <span>Vérification en cours...</span>
            </div>
          ) : (
            "Vérifier l'authenticité"
          )}
        </button>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className={`mt-8 p-6 rounded-xl border-2 transition-all duration-300
          ${verificationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start space-x-4">
            {verificationResult.isValid ? (
              <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${verificationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                {verificationResult.isValid ? 'Document authentique' : 'Document non vérifié'}
              </h3>
              <p className={`${verificationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {verificationResult.message}
              </p>
              {verificationResult.isValid && verificationResult.details && (
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  {verificationResult.details.adminName && (
                    <p>Validé par: {verificationResult.details.adminName}</p>
                  )}
                  {verificationResult.details.signedAt && (
                    <p>Date de validation: {verificationResult.details.signedAt}</p>
                  )}
                  {verificationResult.details.documentTitle && (
                    <p>Document: {verificationResult.details.documentTitle}</p>
                  )}
                  {/* Ajout du bouton de téléchargement */}
                  <div className="mt-4">
                    <button
                      onClick={handleDownloadReport}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#9333EA] text-white rounded-lg shadow hover:shadow-lg transition-all duration-300"
                    >
                      <Download size={16} />
                      <span>Télécharger le rapport</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerifier;

