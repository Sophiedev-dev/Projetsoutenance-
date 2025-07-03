import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Algorithme de détection d'IA local - sans appels API
export interface AIDetectionResult {
  aiPercentage: number;
  aiType: string;
  confidence: 'low' | 'medium' | 'high';
  indicators: string[];
  patterns: {
    repetitivePatterns: number;
    sentenceStructure: number;
    vocabulary: number;
    transitions: number;
  };
}

export interface AIAnalysisProgress {
  step: string;
  progress: number;
  currentAnalysis: string;
}

// Patterns typiques des différents types d'IA
const AI_PATTERNS = {
  chatgpt: {
    phrases: [
      'en tant qu\'',
      'il est important de',
      'cependant',
      'en outre',
      'par ailleurs',
      'en effet',
      'de plus',
      'néanmoins',
      'toutefois',
      'en conclusion'
    ],
    structures: [
      'premièrement.*deuxièmement.*troisièmement',
      'd\'une part.*d\'autre part',
      'tout d\'abord.*ensuite.*enfin'
    ]
  },
  gemini: {
    phrases: [
      'explorons',
      'plongeons dans',
      'décortiquons',
      'analysons en détail',
      'examinons de plus près'
    ],
    structures: [
      'voici.*points.*considérer',
      'aspects.*suivants.*importants'
    ]
  },
  claude: {
    phrases: [
      'permettez-moi de',
      'j\'aimerais souligner',
      'il convient de noter',
      'dans cette optique',
      'sous cet angle'
    ],
    structures: [
      'perspective.*suivante',
      'considération.*importante'
    ]
  }
};

// Mots de transition typiques de l'IA
const TRANSITION_WORDS = [
  'cependant', 'néanmoins', 'toutefois', 'en outre', 'par ailleurs',
  'en effet', 'de plus', 'ainsi', 'donc', 'par conséquent',
  'en conclusion', 'pour conclure', 'en résumé', 'en définitive'
];

// Structures de phrases répétitives
const REPETITIVE_STRUCTURES = [
  /^(il est|c'est|ce qui est).*(important|essentiel|crucial|fondamental)/gi,
  /^(en|dans).*(contexte|cadre|domaine|secteur)/gi,
  /^(cette|cette).*(approche|méthode|stratégie|solution)/gi
];

export class AIDetector {
  private progressCallback?: (progress: AIAnalysisProgress) => void;

  constructor(progressCallback?: (progress: AIAnalysisProgress) => void) {
    this.progressCallback = progressCallback;
  }

  private updateProgress(step: string, progress: number, currentAnalysis: string) {
    if (this.progressCallback) {
      this.progressCallback({ step, progress, currentAnalysis });
    }
  }

  async analyzeText(text: string): Promise<AIDetectionResult> {
    this.updateProgress('Préparation', 5, 'Nettoyage du texte...');
    
    const cleanText = this.preprocessText(text);
    const sentences = this.splitIntoSentences(cleanText);
    const words = cleanText.split(/\s+/);

    this.updateProgress('Analyse des patterns', 25, 'Détection des structures répétitives...');
    const repetitiveScore = this.analyzeRepetitivePatterns(sentences);

    this.updateProgress('Analyse syntaxique', 45, 'Évaluation de la structure des phrases...');
    const structureScore = this.analyzeSentenceStructure(sentences);

    this.updateProgress('Analyse lexicale', 65, 'Vérification du vocabulaire...');
    const vocabularyScore = this.analyzeVocabulary(words);

    this.updateProgress('Analyse des transitions', 85, 'Détection des mots de liaison...');
    const transitionScore = this.analyzeTransitions(text);

    this.updateProgress('Finalisation', 95, 'Calcul du score final...');
    
    // Calcul du score global
    const patterns = {
      repetitivePatterns: repetitiveScore,
      sentenceStructure: structureScore,
      vocabulary: vocabularyScore,
      transitions: transitionScore
    };

    const aiPercentage = this.calculateFinalScore(patterns);
    const aiType = this.detectAIType(text);
    const confidence = this.calculateConfidence(patterns, text.length);
    const indicators = this.getIndicators(patterns, aiPercentage);

    this.updateProgress('Terminé', 100, 'Analyse complète');

    return {
      aiPercentage,
      aiType,
      confidence,
      indicators,
      patterns
    };
  }

  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s\.\?\!]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 10)
      .map(s => s.trim());
  }

  private analyzeRepetitivePatterns(sentences: string[]): number {
    let score = 0;
    const sentenceStarts = sentences.map(s => s.substring(0, 10));
    
    // Vérifier les débuts de phrases similaires
    const startFreq = new Map<string, number>();
    sentenceStarts.forEach(start => {
      startFreq.set(start, (startFreq.get(start) || 0) + 1);
    });

    // Augmenter le score pour les patterns répétitifs
    for (const count of startFreq.values()) { // Correction ici
      if (count > 2) score += 15;
      if (count > 3) score += 10;
    }

    // Vérifier les structures répétitives prédéfinies
    const text = sentences.join(' ');
    REPETITIVE_STRUCTURES.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches && matches.length > 1) {
        score += matches.length * 10;
      }
    });

    return Math.min(score, 100);
  }

  private analyzeSentenceStructure(sentences: string[]): number {
    let score = 0;
    
    // Analyser la longueur des phrases (IA tend à faire des phrases de longueur similaire)
    const lengths = sentences.map(s => s.split(' ').length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((acc, len) => acc + Math.pow(len - avgLength, 2), 0) / lengths.length;
    
    // Faible variance = phrases trop uniformes (signe d'IA)
    if (variance < 10) score += 30;
    if (variance < 5) score += 20;

    // Phrases trop longues ou trop courtes de manière constante
    if (avgLength > 25 || avgLength < 8) score += 20;

    // Vérifier la complexité syntaxique (IA utilise souvent des structures simples)
    const simpleStructures = sentences.filter(s => 
      s.includes('il est') || s.includes('c\'est') || s.includes('cela')
    ).length;
    
    score += (simpleStructures / sentences.length) * 40;

    return Math.min(score, 100);
  }

  private analyzeVocabulary(words: string[]): number {
    let score = 0;
    
    // Calcul de la diversité lexicale
    const uniqueWords = new Set(words.filter(w => w.length > 3));
    const lexicalDiversity = uniqueWords.size / words.length;
    
    // Faible diversité lexicale = signe d'IA
    if (lexicalDiversity < 0.3) score += 25;
    if (lexicalDiversity < 0.2) score += 25;

    // Vérifier la sur-utilisation de mots formels typiques de l'IA
    const formalWords = ['notamment', 'effectivement', 'particulièrement', 'spécifiquement'];
    const formalCount = words.filter(w => formalWords.includes(w)).length;
    score += (formalCount / words.length) * 200;

    // Vérifier les répétitions de mots rares
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 6) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    for (const count of wordFreq.values()) { // Correction ici
      if (count > 3) score += 15;
    }

    return Math.min(score, 100);
  }

  private analyzeTransitions(text: string): number {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    // Compter les mots de transition
    const transitionCount = TRANSITION_WORDS.filter(word => 
      lowerText.includes(word)
    ).length;
    
    const sentenceCount = text.split(/[.!?]+/).length;
    const transitionRatio = transitionCount / sentenceCount;
    
    // IA utilise beaucoup de mots de transition
    if (transitionRatio > 0.4) score += 30;
    if (transitionRatio > 0.6) score += 30;
    if (transitionRatio > 0.8) score += 40;

    return Math.min(score, 100);
  }

  private detectAIType(text: string): string {
    const lowerText = text.toLowerCase();
    const scores = { chatgpt: 0, gemini: 0, claude: 0 };

    // Vérifier les patterns spécifiques à chaque IA
    Object.entries(AI_PATTERNS).forEach(([aiType, patterns]) => {
      patterns.phrases.forEach(phrase => {
        if (lowerText.includes(phrase)) {
          scores[aiType as keyof typeof scores] += 10;
        }
      });
      
      patterns.structures.forEach(structure => {
        const regex = new RegExp(structure, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          scores[aiType as keyof typeof scores] += matches.length * 15;
        }
      });
    });

    // Retourner le type avec le score le plus élevé
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'Inconnu';
    
    return Object.entries(scores).find(([, score]) => score === maxScore)?.[0] || 'Inconnu'; // Correction ici
  }

  private calculateFinalScore(patterns: AIDetectionResult['patterns']): number {
    // Pondération des différents facteurs
    const weights = {
      repetitivePatterns: 0.3,
      sentenceStructure: 0.25,
      vocabulary: 0.25,
      transitions: 0.2
    };

    const weightedScore = 
      patterns.repetitivePatterns * weights.repetitivePatterns +
      patterns.sentenceStructure * weights.sentenceStructure +
      patterns.vocabulary * weights.vocabulary +
      patterns.transitions * weights.transitions;

    return Math.round(Math.min(weightedScore, 100));
  }

  private calculateConfidence(patterns: AIDetectionResult['patterns'], textLength: number): 'low' | 'medium' | 'high' {
    // Plus le texte est long, plus la confiance est élevée
    if (textLength < 500) return 'low';
    
    const avgScore = Object.values(patterns).reduce((a, b) => a + b, 0) / 4;
    
    if (avgScore > 60) return 'high';
    if (avgScore > 30) return 'medium';
    return 'low';
  }

  private getIndicators(patterns: AIDetectionResult['patterns'], aiPercentage: number): string[] {
    const indicators: string[] = [];
    
    if (patterns.repetitivePatterns > 50) {
      indicators.push('Structures répétitives détectées');
    }
    if (patterns.sentenceStructure > 50) {
      indicators.push('Phrases trop uniformes');
    }
    if (patterns.vocabulary > 50) {
      indicators.push('Vocabulaire peu diversifié');
    }
    if (patterns.transitions > 50) {
      indicators.push('Sur-utilisation de mots de transition');
    }
    
    if (aiPercentage > 70) {
      indicators.push('Style très artificiel');
    }
    
    return indicators;
  }
}

// Fonction helper pour extraire le texte d'un PDF côté client
export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += (content.items as TextItem[]).map((item) => item.str).join(" ") + "\n";
        }
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}