import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "0",
    minStockAlert: "0",
    warehouse: "",
  });

  const loadProducts = async () => {
    const response = await api.get("/products");
    setProducts(response.data.data.products);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await api.post("/products", {
      ...form,
      unitPrice: Number(form.unitPrice),
      currentStock: Number(form.currentStock),
      minStockAlert: Number(form.minStockAlert),
    });

    setForm({
      name: "",
      sku: "",
      category: "",
      unitPrice: "",
      currentStock: "0",
      minStockAlert: "0",
      warehouse: "",
    });

    loadProducts();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products & Inventory</h1>
          <p>Product and warehouse stock management</p>
        </div>
      </div>

      <div className="content-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <h3>Add Product</h3>

          <input
            placeholder="Product name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) =>
              setForm({ ...form, sku: e.target.value })
            }
            required
          />

          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="Unit price"
            value={form.unitPrice}
            onChange={(e) =>
              setForm({
                ...form,
                unitPrice: e.target.value,
              })
            }
            required
          />

          <input
            type="number"
            placeholder="Initial stock"
            value={form.currentStock}
            onChange={(e) =>
              setForm({
                ...form,
                currentStock: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Minimum stock alert"
            value={form.minStockAlert}
            onChange={(e) =>
              setForm({
                ...form,
                minStockAlert: e.target.value,
              })
            }
          />

          <input
            placeholder="Warehouse"
            value={form.warehouse}
            onChange={(e) =>
              setForm({
                ...form,
                warehouse: e.target.value,
              })
            }
            required
          />

          <button type="submit">Add Product</button>
        </form>

        <div className="panel">
          <h3>Inventory</h3>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Warehouse</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>₹{product.unitPrice}</td>
                    <td>
                      <strong
                        className={
                          product.currentStock <=
                          product.minStockAlert
                            ? "low-stock"
                            : ""
                        }
                      >
                        {product.currentStock}
                      </strong>
                    </td>
                    <td>{product.warehouse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
