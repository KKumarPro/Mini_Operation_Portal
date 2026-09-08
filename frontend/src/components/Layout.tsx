import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Mini ERP</h2>

        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/products">Products</Link>
          <Link to="/challans">Sales Challans</Link>
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