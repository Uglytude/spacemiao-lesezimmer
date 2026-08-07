"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { BookData, OcrLine, TranslationMap } from "@/lib/types";

export default function BookReader({ bookId }: { bookId: string }) {
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [translations, setTranslations] = useState<TranslationMap>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedLine, setSelectedLine] = useState<OcrLine | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [pageKey, setPageKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load book data
  useEffect(() => {
    fetch(`/books/${bookId}/data/ocr.json`)
      .then((r) => r.json())
      .then((data: BookData) => setBookData(data));
    fetch(`/books/${bookId}/data/translations.json`)
      .then((r) => r.json())
      .then((data: TranslationMap) => setTranslations(data))
      .catch(() => setTranslations({}));
  }, [bookId]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const resetPageInteraction = () => {
    setSelectedLine(null);
    setPopoverPos(null);
    setImageLoaded(false);
  };

  const goNext = useCallback(() => {
    if (!bookData) return;
    resetPageInteraction();
    setCurrentPage((p) => Math.min(p + 1, bookData.pages.length - 1));
    setPageKey((k) => k + 1);
  }, [bookData]);

  const goPrev = useCallback(() => {
    resetPageInteraction();
    setCurrentPage((p) => Math.max(p - 1, 0));
    setPageKey((k) => k + 1);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        setSelectedLine(null);
        setPopoverPos(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Preload adjacent images
  useEffect(() => {
    if (!bookData) return;
    [- 1, 1, 2].forEach((offset) => {
      const idx = currentPage + offset;
      if (idx >= 0 && idx < bookData.pages.length) {
        const img = new Image();
        img.src = `/books/${bookId}/pages-web/${bookData.pages[idx].webImage}`;
      }
    });
  }, [currentPage, bookData, bookId]);

  // Touch swipe
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  // Handle OCR box click
  const handleLineClick = (line: OcrLine, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedLine === line) {
      setSelectedLine(null);
      setPopoverPos(null);
      return;
    }
    setSelectedLine(line);

    if (!isMobile) {
      // Use viewport coords for fixed positioning
      let px = e.clientX + 12;
      let py = e.clientY - 10;
      // Keep popover on screen
      if (px + 300 > window.innerWidth) px = e.clientX - 310;
      if (py + 200 > window.innerHeight) py = window.innerHeight - 210;
      if (py < 10) py = 10;
      if (px < 10) px = 10;
      setPopoverPos({ x: px, y: py });
    }
  };

  const handleContainerClick = () => {
    setSelectedLine(null);
    setPopoverPos(null);
  };

  // Vision coords (bottom-left) → CSS (top-left)
  const visionToCSS = (line: OcrLine) => {
    const { x, y, width, height } = line.bbox;
    return {
      left: `${x * 100}%`,
      top: `${(1 - y - height) * 100}%`,
      width: `${width * 100}%`,
      height: `${height * 100}%`,
    };
  };

  // Fuzzy translation matching
  const normalize = (s: string) =>
    s.toLowerCase().trim()
      .replace(/[.,!?;:"""''()\[\]{}*&^%$#@~`\/\\|<>_+=]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const getTranslation = (text: string) => {
    if (translations[text]) return translations[text];
    const norm = normalize(text);
    for (const key of Object.keys(translations)) {
      if (normalize(key) === norm) return translations[key];
      const normKey = normalize(key);
      if (normKey.length > 5 && (norm.includes(normKey) || normKey.includes(norm))) {
        return translations[key];
      }
    }
    return null;
  };

  // TTS: speak German text with best available voice
  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.82;
    u.pitch = 1.0;

    // Pick the best German voice available
    const voices = window.speechSynthesis.getVoices();
    const deVoices = voices.filter(v => v.lang.startsWith("de"));
    // Prefer premium/enhanced voices (macOS: Anna, Petra; Chrome: Google Deutsch)
    const preferred = ["Anna", "Petra", "Helena", "Google Deutsch"];
    const best = deVoices.find(v => preferred.some(p => v.name.includes(p)))
      || deVoices.find(v => v.localService) // local voices are usually better
      || deVoices[0];
    if (best) u.voice = best;

    window.speechSynthesis.speak(u);
  };

  // Preload voices (needed for Chrome)
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  if (!bookData) {
    return (
      <div className="app">
        <div className="reader" style={{ opacity: 0.4 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Laden …</p>
        </div>
      </div>
    );
  }

  const page = bookData.pages[currentPage];
  const translation = selectedLine ? getTranslation(selectedLine.text) : null;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <Link href="/" className="header-left">
          <img className="header-logo" src="/logo-cat.png" alt="logo" />
          <h1 className="header-title">
            {bookData.title}
            <span>{bookData.author}</span>
          </h1>
        </Link>
        <Link href="/" className="header-back">← Zurück</Link>
      </header>

      {/* Reader */}
      <main className="reader">
        <div className="reader-row">
          <button className="page-btn side-btn side-left" onClick={goPrev} disabled={currentPage === 0} aria-label="上一页">←</button>

          <div
            ref={containerRef}
            className="book-container"
            onClick={handleContainerClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={pageKey}
              className={`book-image ${imageLoaded ? "page-enter" : ""}`}
              src={`/books/${bookId}/pages-web/${page.webImage}`}
              alt={`Seite ${page.page}`}
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0, transition: "opacity 0.2s" }}
            />

            {imageLoaded && page.hasText && page.lines.length > 0 && (
              <div className="ocr-overlay">
                {page.lines.map((line, i) => (
                  <div
                    key={i}
                    className={`ocr-box ${selectedLine === line ? "active" : ""}`}
                    style={visionToCSS(line)}
                    onClick={(e) => handleLineClick(line, e)}
                  />
                ))}
              </div>
            )}
          </div>

          <button className="page-btn side-btn side-right" onClick={goNext} disabled={currentPage === bookData.pages.length - 1} aria-label="下一页">→</button>
        </div>

        <span className="page-info">{page.page} / {bookData.pageCount}</span>
      </main>

      {selectedLine && popoverPos && !isMobile && (
        <div
          className="popover"
          style={{ position: "fixed", left: popoverPos.x, top: popoverPos.y, zIndex: 100 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="popover-german">
            {selectedLine.text}
            <button className="tts-btn" onClick={() => speak(selectedLine.text)} aria-label="播放德语">🔊</button>
          </div>
          <div className="popover-divider" />
          {translation ? (
            <>
              <div className="popover-translation">
                <span className="popover-flag">🇨🇳</span>
                <span className="popover-text">{translation.translation_zh}</span>
              </div>
              <div className="popover-translation">
                <span className="popover-flag">🇬🇧</span>
                <span className="popover-text secondary">{translation.translation_en}</span>
              </div>
            </>
          ) : (
            <div className="popover-translation">
              <span className="popover-text secondary">翻译加载中…</span>
            </div>
          )}
        </div>
      )}

      {selectedLine && isMobile && (
        <>
          <div className="sheet-backdrop" onClick={handleContainerClick} />
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="popover-german">
              {selectedLine.text}
              <button className="tts-btn" onClick={() => speak(selectedLine.text)} aria-label="播放德语">🔊</button>
            </div>
            <div className="popover-divider" />
            {translation ? (
              <>
                <div className="popover-translation">
                  <span className="popover-flag">🇨🇳</span>
                  <span className="popover-text">{translation.translation_zh}</span>
                </div>
                <div className="popover-translation">
                  <span className="popover-flag">🇬🇧</span>
                  <span className="popover-text secondary">{translation.translation_en}</span>
                </div>
              </>
            ) : (
              <div className="popover-translation">
                <span className="popover-text secondary">翻译加载中…</span>
              </div>
            )}
          </div>
        </>
      )}

      <footer className="disclaimer">
        仅供个人学习使用 · {bookData.title} © {bookData.author}
      </footer>
    </div>
  );
}
