import { useMemo, useState } from "react";
import BookCard from "../components/BookCard";
import { useStore } from "../context/StoreContext";

export default function Books() {
  const { books } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", ...new Set(books.map((book) => book.category))];

  const filtered = useMemo(() => {
    return books.filter((book) => {
      const matchSearch =
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || book.category === category;
      return matchSearch && matchCategory;
    });
  }, [books, search, category]);

  return (
    <section className="section">
      <div className="page-title">
        <span className="eyebrow">OUR COLLECTION</span>
        <h1>All Books</h1>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="book-grid">
        {filtered.map((book) => <BookCard key={book.id} book={book} />)}
      </div>

      {filtered.length === 0 && <div className="empty"><h2>No books found</h2></div>}
    </section>
  );
}
