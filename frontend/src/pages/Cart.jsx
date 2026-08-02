import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Cart() {
  const { cart, subtotal, shipping, total, updateQuantity, removeFromCart } = useStore();

  if (cart.length === 0) {
    return <div className="empty"><div>🛒</div><h1>Your cart is empty</h1><Link to="/books" className="primary-btn">Browse Books</Link></div>;
  }

  return (
    <section className="section">
      <div className="page-title"><h1>Shopping Cart</h1></div>
      <div className="cart-layout">
        <div className="cart-list">
          {cart.map((item) => (
            <article className="cart-item" key={item.id}>
              <div className="mini-cover">{item.emoji}</div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.author}</p>
                <strong>${item.price.toFixed(2)}</strong>
              </div>
              <select value={item.quantity} onChange={(e) => updateQuantity(item.id, e.target.value)}>
                {Array.from({ length: Math.min(item.stock, 10) }, (_, i) => i + 1).map((q) => <option key={q}>{q}</option>)}
              </select>
              <button onClick={() => removeFromCart(item.id)} className="danger-btn">Remove</button>
            </article>
          ))}
        </div>

        <aside className="summary">
          <h2>Order Summary</h2>
          <p><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></p>
          <p><span>Shipping</span><strong>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</strong></p>
          <hr />
          <p className="total"><span>Total</span><strong>${total.toFixed(2)}</strong></p>
          <Link to="/checkout" className="primary-btn full-btn">Checkout</Link>
        </aside>
      </div>
    </section>
  );
}
