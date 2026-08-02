import { Link } from "react-router-dom";
import BookCard from "../components/BookCard";
import { useStore } from "../context/StoreContext";

export default function Home() {
  const { books } = useStore();

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">ONLINE BOOKSTORE</span>
          <h1>Discover your next favorite book.</h1>
          <p>Browse fiction, technology, business, fantasy, and self-development books.</p>
          <Link to="/books" className="primary-btn big-btn">Browse Books</Link>
        </div>
        <div className="hero-art">📚</div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">FEATURED COLLECTION</span>
            <h2>Popular Books</h2>
          </div>
          <Link to="/books">View all →</Link>
        </div>
        <div className="book-grid">
          {books.slice(0, 4).map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </section>
    </>
  );
}
