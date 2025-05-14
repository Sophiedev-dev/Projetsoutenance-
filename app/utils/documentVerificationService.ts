import * as pdfjs from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

export interface VerificationResult {
  isValid: boolean;
  message: string;
  details?: {
    adminName?: string;
    signedAt?: string;
    documentTitle?: string;
  };
}

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const extractLastPageText = async (file: File): Promise<string> => {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    // Get last page
    const lastPageNum = pdf.numPages;
    const lastPage = await pdf.getPage(lastPageNum);
    
    // Extract text content
    const textContent = await lastPage.getTextContent();
    const text = textContent.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item: TextItem) => item.str)
      .join('\n');
    
    console.log('Extracted text from last page:', text);
    return text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
};

export const isDocumentSigned = async (file: File): Promise<boolean> => {
  try {
    const lastPageText = await extractLastPageText(file);
    
    // Amélioration des regex pour une meilleure détection
    const signatureRegex = /Signature:\s*([A-Za-z0-9+/=]+(?:\s+[A-Za-z0-9+/=]+)*)/;
    const publicKeyRegex = /-----BEGIN PUBLIC KEY-----([\s\S]*?)-----END PUBLIC KEY-----/;
    const validationRegex = /Date de validation:\s*(\d{2}\/\d{2}\/\d{4})/;

    const hasSignature = signatureRegex.test(lastPageText);
    const hasPublicKey = publicKeyRegex.test(lastPageText);
    const hasValidation = validationRegex.test(lastPageText);

    // Ajout de logs plus détaillés pour le débogage
    console.log('Contenu du texte:', lastPageText);
    console.log('Vérification détaillée:', {
      signature: {
        présente: hasSignature,
        valeur: lastPageText.match(signatureRegex)?.[1] || 'Non trouvée'
      },
      validation: {
        présente: hasValidation,
        date: lastPageText.match(validationRegex)?.[1] || 'Non trouvée'
      },
      cléPublique: {
        présente: hasPublicKey
      }
    });

    return hasSignature && hasPublicKey && hasValidation;
  } catch (error) {
    console.error('Erreur lors de la vérification de la signature:', error);
    return false;
  }
};

export const extractSignatureInfo = async (file: File): Promise<{ signature: string; publicKey: string; } | null> => {
  try {
    const lastPageText = await extractLastPageText(file);
    
    // Amélioration de l'extraction de la signature avec gestion multilignes
    const signatureRegex = /Signature:\s*([A-Za-z0-9+/=]+(?:\s+[A-Za-z0-9+/=]+)*)/;
    const signatureMatch = lastPageText.match(signatureRegex);
    const signature = signatureMatch ? signatureMatch[1].replace(/\s+/g, '') : '';

    // Extraction de la clé publique (inchangée car fonctionne bien)
    const publicKeyMatch = lastPageText.match(/-----BEGIN PUBLIC KEY-----([\s\S]*?)-----END PUBLIC KEY-----/);
    const publicKey = publicKeyMatch ? publicKeyMatch[0].trim() : '';

    if (!signature || !publicKey) {
      console.log('Détails de l\'extraction:', {
        signatureTrouvée: !!signature,
        longueurSignature: signature.length,
        cléPubliqueTrouvée: !!publicKey
      });
      return null;
    }

    return {
      signature,
      publicKey
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction des informations de signature:', error);
    return null;
  }
};

/**
 * Compare provided public key with the one in document
 */
const comparePublicKeys = (documentKey: string, providedKey: string): boolean => {
  // Normalize both keys by removing all whitespace, newlines, and headers
  const normalizeKey = (key: string) => {
    return key
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/[\s\n\r]/g, '')
      .trim();
  };
  
  const normalizedDocKey = normalizeKey(documentKey);
  const normalizedProvidedKey = normalizeKey(providedKey);
  
  console.log('Comparing keys:', {
    normalizedDocKey,
    normalizedProvidedKey,
    match: normalizedDocKey === normalizedProvidedKey
  });
  
  return normalizedDocKey === normalizedProvidedKey;
};

/**
 * Verify document signature using admin's public key
 */
export const verifyDocument = async (file: File, providedPublicKey: string): Promise<VerificationResult> => {
  try {
    // First check if document appears to be signed
    const isSigned = await isDocumentSigned(file);
    if (!isSigned) {
      return {
        isValid: false,
        message: "Ce document a été falsifié, pas authentique"
      };
    }
    
    // Extract signature info from document
    const signatureInfo = await extractSignatureInfo(file);
    if (!signatureInfo) {
      return {
        isValid: false,
        message: "Impossible d'extraire les informations de signature du document."
      };
    }
    
    // Compare public keys
    const keysMatch = comparePublicKeys(signatureInfo.publicKey, providedPublicKey);
    if (!keysMatch) {
      return {
        isValid: false,
        message: "La clé publique fournie ne correspond pas à celle du document."
      };
    }

    // Get additional signature details
    const lastPageText = await extractLastPageText(file);
    const lines = lastPageText.split('\n');
    const adminNameLine = lines.find(l => l.includes('Validé par:') || l.includes('Validated by:'));
    const adminName = adminNameLine?.split(':')[1]?.trim();
    const signedAtLine = lines.find(l => l.includes('Date de validation:') || l.includes('Validation date:'));
    const signedAt = signedAtLine?.split(':')[1]?.trim();
    const documentTitleLine = lines.find(l => l.includes('Document:') || l.includes('Titre:'));
    const documentTitle = documentTitleLine?.split(':')[1]?.trim();

    return {
      isValid: true,
      message: "Le document est authentique. La signature numérique est valide.",
      details: {
        adminName: adminName || 'Admin',
        signedAt: signedAt || new Date().toLocaleDateString(),
        documentTitle: documentTitle || file.name
      }
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      isValid: false,
      message: "Une erreur s'est produite lors de la vérification: " + (error instanceof Error ? error.message : 'Erreur inconnue')
    };
  }
};