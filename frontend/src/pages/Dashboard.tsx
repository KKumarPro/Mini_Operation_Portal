import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [customers, setCustomers] = useState(0);
  const [products, setProducts] = useState(0);
  const [challans, setChallans] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/customers"),
      api.get("/products"),
      api.get("/challans"),
    ]).then(([c, p, s]) => {
      setCustomers(c.data.data.pagination.total);
      setProducts(p.data.data.pagination.total);
      setChallans(s.data.data.length);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>ERP / CRM operations overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Customers</span>
          <strong>{customers}</strong>
        </div>

        <div className="stat-card">
          <span>Products</span>
          <strong>{products}</strong>
        </div>

        <div className="stat-card">
          <span>Sales Challans</span>
          <strong>{challans}</strong>
        </div>
      </div>
    </div>
  );
}