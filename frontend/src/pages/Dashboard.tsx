import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [customers, setCustomers] = useState(0);
  const [products, setProducts] = useState(0);
  const [challans, setChallans] = useState(0);
  const [lowStock, setLowStock] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/customers?limit=1"),
      api.get("/products?limit=100"),
      api.get("/challans?limit=1"),
    ]).then(([c, p, s]) => {
      setCustomers(c.data.data.pagination.total);
      setProducts(p.data.data.pagination.total);
      setChallans(s.data.data.pagination.total);
      setLowStock(
        p.data.data.products.filter(
          (product: any) => product.currentStock <= product.minStockAlert
        ).length
      );
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

        <div className="stat-card">
          <span>Low Stock Alerts</span>
          <strong className={lowStock > 0 ? "low-stock" : ""}>
            {lowStock}
          </strong>
        </div>
      </div>
    </div>
  );
}
