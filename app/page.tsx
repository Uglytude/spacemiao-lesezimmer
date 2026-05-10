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
    id: "coming-soon",
    title: "Nächstes Buch…",
    author: "Bald verfügbar",
    cover: null,
    ready: false,
  },
];

export default function HomePage() {
  return (
    <div className="app" style={{ overflow: "auto", height: "100vh" }}>
      {/* Hero */}
      <section className="home-hero">
        <img
          className="home-logo"
          src="/logo-cat.png"
          alt="SpaceMiao's cat mascot"
        />
        <h1 className="home-name">SpaceMiao&apos;s Lesezimmer</h1>
        <p className="home-slogan">学德语，一页一页来 ✦</p>
      </section>

      {/* Bookshelf */}
      <section className="shelf-section">
        <h2 className="shelf-title">📚 Meine Bücher</h2>
        <div className="shelf-grid">
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
                <div className="book-card-placeholder">✨</div>
                <div className="book-card-info">
                  <div className="book-card-title">{book.title}</div>
                  <div className="book-card-author">{book.author}</div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="disclaimer">
        仅供个人学习使用 · Built with 🐱 by SpaceMiao
      </footer>
    </div>
  );
}
