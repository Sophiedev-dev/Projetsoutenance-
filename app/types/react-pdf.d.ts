declare module 'react-pdf' {
  import * as React from 'react';

  export interface PDFDocumentProxy {
    numPages: number;
    fingerprint: string;
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  }

  export interface DocumentProps {
    file: string | { url: string };
    onLoadSuccess?: (document: PDFDocumentProxy) => void;
    onLoadError?: (error: Error) => void;
  }

  export interface PageProps {
    pageNumber: number;
    width?: number;
    scale?: number;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
  }

  export const Document: React.FC<DocumentProps>;
  export const Page: React.FC<PageProps>;
}