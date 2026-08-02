import { Link, useParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function BookDetails() {
  const { id } = useParams();
  const { books, addToCart } = useStore();
  const book = books.find((item) => String(item.id) === id);

  if (!book) {
    return <div className="empty"><h1>Book not found</h1><Link to="/books">Back to Books</Link></div>;
  }

  return (
    <section className="details">
      <div className="details-cover">{book.emoji}</div>
      <div>
        <span className="category">{book.category}</span>
        <h1>{book.title}</h1>
        <h3>by {book.author}</h3>
        <p>{book.description}</p>
        <div className="details-info">
          <span>⭐ {book.rating}</span>
          <span>{book.stock} in stock</span>
        </div>
        <h2>${book.price.toFixed(2)}</h2>
        <button onClick={() => addToCart(book)} className="primary-btn big-btn">Add to Cart</button>
      </div>
    </section>
  );
}
