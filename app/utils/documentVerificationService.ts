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
    
    // Check for all required signature elements
    const hasSignature = lastPageText.includes('Digital Signature:') || 
                        lastPageText.includes('Signature numérique:') ||
                        lastPageText.includes('SIGNATURE:');
                        
    const hasPublicKey = lastPageText.includes('-----BEGIN PUBLIC KEY-----') && 
                        lastPageText.includes('-----END PUBLIC KEY-----');
                        
    const hasValidation = lastPageText.includes('Validé par:') ||
                         lastPageText.includes('Validated by:');

    console.log('Signature check:', {
      hasSignature,
      hasPublicKey,
      hasValidation,
      textSample: lastPageText.slice(0, 200) // Log first 200 chars for debugging
    });

    return hasSignature && hasPublicKey && hasValidation;
  } catch (error) {
    console.error('Error checking signature:', error);
    return false;
  }
};

export const extractSignatureInfo = async (file: File): Promise<{ signature: string; publicKey: string; } | null> => {
  try {
    const lastPageText = await extractLastPageText(file);
    const lines = lastPageText.split('\n');
    
    let signature = '';
    let publicKey = '';
    let isCollectingPublicKey = false;
    let nextLineIsSignature = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Handle signature
      if (nextLineIsSignature && trimmedLine.length > 0) {
        signature = trimmedLine;
        nextLineIsSignature = false;
      }
      if (trimmedLine === 'Digital Signature:' || trimmedLine === 'Signature numérique:' || trimmedLine === 'SIGNATURE:') {
        nextLineIsSignature = true;
      }
      
      // Handle public key
      if (trimmedLine === '-----BEGIN PUBLIC KEY-----') {
        isCollectingPublicKey = true;
        publicKey = trimmedLine + '\n';
      } else if (isCollectingPublicKey) {
        publicKey += trimmedLine + '\n';
        if (trimmedLine === '-----END PUBLIC KEY-----') {
          isCollectingPublicKey = false;
        }
      }
    }

    console.log('Extracted signature:', signature);
    console.log('Extracted public key:', publicKey);

    if (!signature || !publicKey) {
      return null;
    }

    return {
      signature: signature.trim(),
      publicKey: publicKey.trim()
    };
  } catch (error) {
    console.error('Error extracting signature info:', error);
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