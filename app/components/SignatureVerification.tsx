import { useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '../utils/config';

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
        
        const response = await fetch(getApiUrl(`/api/memoire/${memoireId}/verify-signature`));
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

    return (
      <div className="mt-4">
        <button
          onClick={verifySignature}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Vérification...' : 'Vérifier la signature'}
        </button>

        {signatureDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Détails de la signature</h3>
            <div className="mt-2 space-y-2 text-sm">
              <p>Signé par: {signatureDetails.details.signedBy}</p>
              <p>Date: {signatureDetails.details.signedAt}</p>
              <p>Document: {signatureDetails.details.memoire}</p>
            </div>
          </div>
        )}
      </div>
    );
};

export default SignatureVerification;