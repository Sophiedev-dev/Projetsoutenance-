declare module 'pdfjs-dist/build/pdf' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getViewport(options: { scale: number }): PDFPageViewport;
    render(options: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PDFPageViewport;
    }): { promise: Promise<void> };
  }

  export interface PDFPageViewport {
    width: number;
    height: number;
  }

  export function getDocument(url: string): {
    promise: Promise<PDFDocumentProxy>;
  };
}

declare module 'pdfjs-dist/build/pdf.worker.entry' {
  const worker: Worker;
  export = worker;
}