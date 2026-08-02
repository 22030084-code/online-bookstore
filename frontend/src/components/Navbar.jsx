import { NavLink } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Navbar() {
  const { cart, user, logout } = useStore();

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header className="navbar">
      <NavLink to="/" className="logo">
        📚 BookHaven
      </NavLink>

      <nav>
        <NavLink to="/">Home</NavLink>

        <NavLink to="/books">Books</NavLink>

        <NavLink to="/cart">
          Cart ({cartCount})
        </NavLink>

        {user && (
          <NavLink to="/orders">
            My Orders
          </NavLink>
        )}

        {user?.role === "admin" && (
          <>
            <NavLink to="/admin">
              Manage Books
            </NavLink>

            <NavLink to="/admin/orders">
              Manage Orders
            </NavLink>
          </>
        )}
      </nav>

      <div className="nav-user">
        {user ? (
          <>
            <span>Hello, {user.name}</span>

            <button
              type="button"
              className="outline-btn"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className="primary-btn"
          >
            Login
          </NavLink>
        )}
      </div>
    </header>
  );
}