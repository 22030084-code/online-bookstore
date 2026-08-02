import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="empty">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="primary-btn">Back Home</Link>
    </div>
  );
}
