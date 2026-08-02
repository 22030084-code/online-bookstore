import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../api";
import { useStore } from "../context/StoreContext";

const statuses = [
  "Processing",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrders() {
  const { user } = useStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadOrders() {
    try {
      setError("");
      setLoading(true);

      const data = await getAllOrders();
      setOrders(data.orders);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      setError("");
      setMessage("");
      setUpdatingId(orderId);

      await updateOrderStatus(orderId, newStatus);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      setMessage(`Order #${orderId} status updated successfully`);
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingId(null);
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

  if (loading) {
    return (
      <div className="empty">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="page-title">
        <span className="eyebrow">ADMIN DASHBOARD</span>
        <h1>Order Management</h1>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {!error && orders.length === 0 ? (
        <div className="empty">
          <div>📦</div>
          <h2>No orders found</h2>
          <p>Customer orders will appear here.</p>
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
                  <small>Customer</small>
                  <strong>{order.full_name}</strong>
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
              </div>

              <div className="order-address">
                <strong>Customer Information:</strong>

                <span>{order.email}</span>
                <span>{order.phone}</span>
                <span>
                  {order.address}, {order.city}
                </span>
              </div>

              <div className="admin-order-status">
                <label>
                  Order Status

                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(event) =>
                      handleStatusChange(
                        order.id,
                        event.target.value
                      )
                    }
                  >
                    {statuses.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                {updatingId === order.id && (
                  <span>Updating...</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}