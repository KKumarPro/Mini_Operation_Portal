import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Mini ERP</h2>

        <nav>
          <Link to="/" className={isActive("/") ? "active" : ""}>
            Dashboard
          </Link>
          <Link
            to="/customers"
            className={isActive("/customers") ? "active" : ""}
          >
            Customers
          </Link>
          <Link
            to="/products"
            className={isActive("/products") ? "active" : ""}
          >
            Products
          </Link>
          <Link
            to="/challans"
            className={isActive("/challans") ? "active" : ""}
          >
            Sales Challans
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <small>
            {user.name || "User"} · {user.role || ""}
          </small>

          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
