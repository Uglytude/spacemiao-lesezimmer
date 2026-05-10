#!/usr/bin/env python3
"""
质检脚本：检查绘本翻译覆盖率
用法：python3 check_coverage.py [book_id]
不传参数则检查所有书
"""
import json, re, sys, os

BASE = os.path.dirname(os.path.abspath(__file__))
BOOKS_DIR = os.path.join(BASE, "public", "books")

def normalize(s):
    return re.sub(r'[.,!?;:"""\'\'()\[\]{}*&^%$#@~`/\\|<>_+=»«›‹]', '', s.lower().strip()).strip()

def is_noise(t):
    if len(t) < 5: return True
    special = sum(1 for c in t if c in '¢•￿*§¥£')
    if special > 1: return True
    noise_kw = ['isbn', '©', 'verlag', 'auflage', 'www.', 'copyright', 'printed',
                'druck und bindung', 'lektorat', 'satz:', 'fsc', 'rechte vorbehalten',
                '.com', '.at', '.de', 'fotomechanisch', 'originalausgabe',
                'alle rechte', 'nachhaltig', 'data mining', 'produktsicherheit',
                'text und illustrationen']
    if any(kw in t.lower() for kw in noise_kw): return True
    alpha_count = sum(1 for c in t if c.isalpha())
    if alpha_count < len(t) * 0.4: return True
    return False

def check_book(book_id):
    ocr_path = os.path.join(BOOKS_DIR, book_id, "data", "ocr.json")
    trans_path = os.path.join(BOOKS_DIR, book_id, "data", "translations.json")
    
    if not os.path.exists(ocr_path):
        print(f"❌ {book_id}: ocr.json not found"); return
    if not os.path.exists(trans_path):
        print(f"❌ {book_id}: translations.json not found"); return
    
    with open(ocr_path) as f: ocr = json.load(f)
    with open(trans_path) as f: trans = json.load(f)
    
    total = 0; matched = 0; missing = []
    
    for page in ocr["pages"]:
        for line in page["lines"]:
            t = line["text"].strip()
            if is_noise(t): continue
            total += 1
            if t in trans: matched += 1; continue
            norm = normalize(t)
            found = False
            for key in trans:
                nk = normalize(key)
                if nk == norm: found = True; break
                if len(nk) > 5 and (norm in nk or nk in norm): found = True; break
            if found: matched += 1
            else: missing.append((page["page"], t))
    
    pct = (matched/total*100) if total > 0 else 0
    icon = "✅" if pct >= 85 else "⚠️" if pct >= 70 else "❌"
    unique_missing = list(dict.fromkeys(m[1] for m in missing))
    
    print(f"\n{icon} {book_id}: {matched}/{total} story lines ({pct:.0f}%)")
    print(f"   📖 {ocr['title']} — {ocr['author']}")
    print(f"   📄 {ocr['pageCount']} pages, {len(trans)} translations in dict")
    
    if unique_missing:
        print(f"   ❌ {len(unique_missing)} missing translations:")
        for t in unique_missing[:10]:
            pg = next(p for p, txt in missing if txt == t)
            print(f"      p{pg:2d}: {t[:65]}")
        if len(unique_missing) > 10:
            print(f"      ... +{len(unique_missing)-10} more")
    else:
        print("   🎉 100% coverage!")
    
    return pct

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_book(sys.argv[1])
    else:
        books = sorted([d for d in os.listdir(BOOKS_DIR) 
                       if os.path.isdir(os.path.join(BOOKS_DIR, d)) and not d.startswith('.')])
        print("=" * 50)
        print("📚 Lesezimmer Translation Coverage Report")
        print("=" * 50)
        for b in books:
            check_book(b)
        print("\n" + "=" * 50)
