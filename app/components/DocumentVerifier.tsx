import React, { useState } from 'react';
import { Upload, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { verifyDocument, VerificationResult } from '../utils/documentVerificationService';
import { toast } from 'react-toastify';
import { Button } from '@react-pdf-viewer/core';

const DocumentVerifier = () => {
  const [file, setFile] = useState<File | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

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
    if (!file || !publicKey.trim()) {
      toast.error("Veuillez télécharger un document et fournir la clé publique");
      return;
    }

    setVerifying(true);
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      
      const formattedPublicKey = publicKey.includes('BEGIN PUBLIC KEY') 
        ? publicKey 
        : `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----\n`;
      
      formData.append('publicKey', formattedPublicKey);

      const response = await fetch('http://localhost:5000/api/memoire/verify-signature', {
        method: 'POST',
        body: formData,
      });

      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Le serveur n'a pas renvoyé une réponse JSON valide");
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        setVerificationResult({
          isValid: true,
          message: data.message || 'Document vérifié avec succès',
          details: {
            documentTitle: data.details?.documentTitle,
            signedBy: data.details?.signedBy,
            signedAt: data.details?.signedAt
          }
        });
        toast.success('Vérification réussie');
      } else {
        setVerificationResult({
          isValid: false,
          message: data.message || 'La signature du document n\'est pas valide',
          details: null
        });
        toast.error(data.message || 'Échec de la vérification');
      }
    } catch (error) {
      console.error("Error verifying document:", error);
      setVerificationResult({
        isValid: false,
        message: 'Une erreur technique s\'est produite lors de la vérification. Veuillez vérifier que le serveur est en cours d\'exécution.',
        details: null
      });
      toast.error('Erreur lors de la vérification. Veuillez vérifier que le serveur est en cours d\'exécution.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Document Upload Section */}
        <div className="relative group">
          <div className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 rounded-xl p-8 border-2 border-dashed border-blue-200 transition-colors duration-300 h-full">
            <div className="mb-4">
              <Upload 
                className="h-12 w-12 text-archiva-blue animate-bounce-gentle" 
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
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer bg-gradient-to-r from-archiva-indigo to-archiva-blue text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
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

        {/* Public Key Section */}
        <div className="relative group">
          <div className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 rounded-xl p-8 border-2 border-dashed border-purple-200 transition-colors duration-300 h-full">
            <div className="mb-4">
              <Key 
                className="h-12 w-12 text-archiva-purple animate-bounce-gentle" 
                strokeWidth={1.5} 
              />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Entrez la clé publique
            </h3>
            <p className="text-gray-600 text-center text-sm mb-4">
              Collez la clé publique fournie par l'administrateur
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
      <div className="flex justify-center mb-8">
        <Button
          onClick={handleVerifyClick}
          disabled={!file || !publicKey.trim() || verifying}
          className="bg-gradient-to-r from-archiva-indigo via-archiva-blue to-archiva-purple hover:from-archiva-purple hover:to-archiva-indigo text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-500 text-lg font-medium"
          size="lg"
        >
          {verifying ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Vérification en cours...
            </>
          ) : (
            "Vérifier l'authenticité"
          )}
        </Button>
      </div>
      
      {/* Verification Result */}
      {verificationResult && (
        <div className={`
          p-6 rounded-xl shadow-lg transition-all duration-300 border-2
          ${verificationResult.isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
          }
        `}>
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
              {verificationResult.isValid && (
                <p className="text-sm text-gray-600 mt-2">
                  Ce document est signé numériquement et n'a pas été modifié depuis sa signature.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerifier;
