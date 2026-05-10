import Link from "next/link";

const books = [
  {
    id: "pepper",
    title: "Der Sommer mit Pepper",
    author: "Beatrice Alemagna",
    cover: "/books/pepper/pages-web/page_001.jpg",
    ready: true,
  },
  {
    id: "klippe",
    title: "Zuhause auf der Klippe",
    author: "Magali Franov",
    cover: "/books/klippe/pages-web/page_001.jpg",
    ready: true,
  },
  {
    id: "mahlzeit",
    title: "Mahlzeit!",
    author: "Larysa Maliush",
    cover: "/books/mahlzeit/pages-web/page_001.jpg",
    ready: true,
  },
  {
    id: "bisschen",
    title: "Nur ein kleines bisschen",
    author: "Olivier Tallec",
    cover: "/books/bisschen/pages-web/page_001.jpg",
    ready: true,
  },
];

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      {/* Central composition */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0px",
          marginBottom: "40px",
        }}
      >
        <img
          src="/logo-cat.png"
          alt="SpaceMiao's cat mascot reading a book"
          className="cat-logo"
          style={{
            width: "180px",
            height: "180px",
            objectFit: "contain",
            marginBottom: "-8px",
          }}
        />
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "28px",
            fontWeight: "normal",
            fontStyle: "italic",
            color: "var(--text-primary)",
            letterSpacing: "0.5px",
            marginBottom: "8px",
          }}
        >
          SpaceMiao&apos;s Lesezimmer
        </h1>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 300,
            color: "var(--text-secondary)",
            textAlign: "center",
            maxWidth: "340px",
            lineHeight: 1.7,
            marginBottom: "4px",
          }}
        >
          帮助不说德语的妈妈，给小朋友讲德语绘本故事。
        </p>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 300,
            color: "var(--text-secondary)",
            letterSpacing: "0.3px",
          }}
        >
          点击德语文字，即可看到中英文翻译
        </p>
      </div>

      {/* Books grid — 4 columns centered */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 160px))",
          gap: "20px",
          justifyContent: "center",
          maxWidth: "720px",
          width: "100%",
        }}
      >
        {books.map((book) =>
          book.ready ? (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="book-card"
            >
              <img
                className="book-card-cover"
                src={book.cover!}
                alt={book.title}
              />
              <div className="book-card-info">
                <div className="book-card-title">{book.title}</div>
                <div className="book-card-author">{book.author}</div>
              </div>
            </Link>
          ) : (
            <div key={book.id} className="book-card coming-soon">
              <div className="book-card-placeholder">✦</div>
              <div className="book-card-info">
                <div className="book-card-title">{book.title}</div>
                <div className="book-card-author">{book.author}</div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <p
        style={{
          marginTop: "48px",
          fontSize: "11px",
          fontWeight: 300,
          color: "var(--text-secondary)",
          letterSpacing: "0.3px",
        }}
      >
        仅供个人学习使用 · Built with love by SpaceMiao
      </p>
    </div>
  );
}
