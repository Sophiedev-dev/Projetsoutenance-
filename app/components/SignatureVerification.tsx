import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface SignatureDetails {
  isValid: boolean;
  details: {
    signedBy: string;
    signedAt: string;
    memoire: string;
  };
}

const SignatureVerification = ({ memoireId }: { memoireId: number }) => {
    const [signatureDetails, setSignatureDetails] = useState<SignatureDetails | null>(null);
    const [loading, setLoading] = useState(false);
  
    const verifySignature = async () => {
      setLoading(true);
      try {
        console.log('Vérification de la signature pour le mémoire:', memoireId);
        
        const response = await fetch(`http://localhost:5000/api/memoire/${memoireId}/verify-signature`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Réponse de l\'API:', data);
  
        if (data.success) {
          setSignatureDetails(data);
          toast.success('Signature vérifiée avec succès');
        } else {
          toast.error(data.message || 'Erreur lors de la vérification');
        }
      } catch (error) {
        console.error('Erreur détaillée:', error);
        toast.error("Erreur lors de la vérification de la signature");
      } finally {
        setLoading(false);
      }
    };
  
  };

export default SignatureVerification; 