// Type definitions for PEPPER Reader

export interface OcrLine {
  text: string;
  confidence: number;
  bbox: {
    x: number;      // normalized 0-1, from left
    y: number;      // normalized 0-1, from BOTTOM (Vision coordinate)
    width: number;   // normalized 0-1
    height: number;  // normalized 0-1
  };
}

export interface BookPage {
  page: number;
  sourceImage: string;
  webImage: string;
  imageWidth: number;
  imageHeight: number;
  hasText: boolean;
  lines: OcrLine[];
}

export interface BookData {
  bookId: string;
  title: string;
  author: string;
  pageCount: number;
  pagesWithText: number;
  totalLines: number;
  ocrEngine: string;
  coordinateSystem: string;
  pages: BookPage[];
}

export interface Translation {
  text_de: string;
  translation_zh: string;
  translation_en: string;
}

export interface TranslationMap {
  [normalizedText: string]: Translation;
}
