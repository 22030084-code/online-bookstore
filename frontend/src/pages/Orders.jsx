import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Orders() {
  const { user, orders, loadMyOrders } = useStore();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError("");
        await loadMyOrders();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="empty">
        <h1>Please login first</h1>
        <p>You must login to view your orders.</p>

        <Link to="/login" className="primary-btn">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty">
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="page-title">
        <span className="eyebrow">ORDER HISTORY</span>
        <h1>My Orders</h1>
      </div>

      {location.state?.message && (
        <div className="success-message">
          {location.state.message}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {!error && orders.length === 0 ? (
        <div className="empty">
          <div>📦</div>
          <h2>No orders yet</h2>
          <p>Your completed orders will appear here.</p>

          <Link to="/books" className="primary-btn">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="orders">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-head">
                <div>
                  <small>Order Number</small>
                  <strong>#{order.id}</strong>
                </div>

                <div>
                  <small>Date</small>
                  <span>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <small>Total</small>
                  <strong>
                    ${Number(order.total_amount).toFixed(2)}
                  </strong>
                </div>

                <span className="status">{order.status}</span>
              </div>

              <div className="order-items">
                {order.items?.map((item) => (
                  <div
                    className="order-item"
                    key={`${order.id}-${item.id}`}
                  >
                    <div className="mini-cover">
                      {item.image_url || "📖"}
                    </div>

                    <div>
                      <h3>{item.title}</h3>
                      <p>by {item.author}</p>
                      <p>
                        Quantity: {item.quantity} × $
                        {Number(item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-address">
                <strong>Delivery Address:</strong>
                <span>
                  {order.address}, {order.city}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}