import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

const emptyForm = {
  title: "",
  author: "",
  category: "Fiction",
  description: "",
  price: "",
  rating: "4.5",
  stock: "",
  emoji: "📖",
};

export default function Admin() {
  const { user, books, addBook, deleteBook } = useStore();

  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await addBook(form);

      setForm(emptyForm);
      setMessage("Book added successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(book) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteBook(book.id);

      setMessage("Book deleted successfully");
    } catch (error) {
      setError(error.message);
    }
  }

  if (!user) {
    return (
      <div className="empty">
        <h1>Please login first</h1>

        <Link to="/login" className="primary-btn">
          Go to Login
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="empty">
        <h1>Admin access only</h1>
        <p>Your account does not have administrator permission.</p>

        <Link to="/" className="primary-btn">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="page-title">
        <span className="eyebrow">ADMIN DASHBOARD</span>
        <h1>Book Management</h1>
      </div>

      {message && (
        <div className="success-message">{message}</div>
      )}

      {error && <div className="error">{error}</div>}

      <div className="admin-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Add New Book</h2>

          <label>
            Book Title
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Author
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="Fiction">Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Self Development">
                Self Development
              </option>
              <option value="Psychology">Psychology</option>
              <option value="Education">Education</option>
            </select>
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Price
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </label>

          <label>
            Rating
            <input
              type="number"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              required
            />
          </label>

          <label>
            Stock
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
              required
            />
          </label>

          <label>
            Cover Emoji
            <input
              type="text"
              name="emoji"
              value={form.emoji}
              onChange={handleChange}
              maxLength="4"
              required
            />
          </label>

          <button
            type="submit"
            className="primary-btn full-btn"
            disabled={loading}
          >
            {loading ? "Adding Book..." : "Add Book"}
          </button>
        </form>

        <div className="admin-books">
          {books.map((book) => (
            <article key={book.id}>
              <div className="mini-cover">
                {book.emoji || "📖"}
              </div>

              <div>
                <h3>{book.title}</h3>
                <p>{book.author}</p>
                <p>
                  ${Number(book.price).toFixed(2)} • Stock:{" "}
                  {book.stock}
                </p>
              </div>

              <button
                type="button"
                className="danger-btn"
                onClick={() => handleDelete(book)}
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}