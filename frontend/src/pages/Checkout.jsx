import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Checkout() {
  const { user, cart, total, placeOrder } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    city: "",
    address: "",
  });

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
      setError("");
      setLoading(true);

      const order = await placeOrder(form);

      navigate("/orders", {
        state: {
          message: `Order #${order.id} was placed successfully`,
        },
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="empty">
        <h1>Please login first</h1>
        <p>You must login before completing your order.</p>

        <Link to="/login" className="primary-btn">
          Go to Login
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty">
        <h1>Your cart is empty</h1>

        <Link to="/books" className="primary-btn">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <section className="section checkout">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1>Checkout</h1>

        {error && <div className="error">{error}</div>}

        <label>
          Full Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Phone Number
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+961 70 123 456"
            required
          />
        </label>

        <label>
          City
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Delivery Address
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter your full address"
            required
          />
        </label>

        <div className="checkout-total">
          <span>Total Amount:</span>
          <strong>${total.toFixed(2)}</strong>
        </div>

        <button
          type="submit"
          className="primary-btn full-btn"
          disabled={loading}
        >
          {loading
            ? "Placing order..."
            : `Place Order • $${total.toFixed(2)}`}
        </button>
      </form>
    </section>
  );
}