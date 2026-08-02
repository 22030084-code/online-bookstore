import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function BookCard({ book }) {
  const { addToCart } = useStore();

  return (
    <article className="book-card">
      <div className="book-cover">{book.emoji}</div>
      <div className="book-card-body">
        <span className="category">{book.category}</span>
        <h3>{book.title}</h3>
        <p>by {book.author}</p>
        <div className="book-meta">
          <span>⭐ {book.rating}</span>
          <strong>${book.price.toFixed(2)}</strong>
        </div>
        <div className="card-actions">
          <Link to={`/books/${book.id}`} className="outline-btn">Details</Link>
          <button onClick={() => addToCart(book)} className="primary-btn">Add to Cart</button>
        </div>
      </div>
    </article>
  );
}
