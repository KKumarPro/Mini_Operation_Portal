import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";
import Modal from "../components/Modal";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  unitPrice: "",
  currentStock: "0",
  minStockAlert: "0",
  warehouse: "",
};

const emptyStockForm = {
  quantity: "1",
  type: "IN",
  reason: "",
};

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [stockTarget, setStockTarget] = useState<any | null>(null);
  const [stockForm, setStockForm] = useState(emptyStockForm);

  const [movementsTarget, setMovementsTarget] = useState<any | null>(null);
  const [movements, setMovements] = useState<any[]>([]);

  const loadProducts = async () => {
    setLoading(true);

    try {
      const response = await api.get("/products", {
        params: { search, page, limit: 10 },
      });

      setProducts(response.data.data.products);
      setTotalPages(response.data.data.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page]);

  const runSearch = () => {
    setPage(1);
    loadProducts();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await api.post("/products", {
      ...form,
      unitPrice: Number(form.unitPrice),
      currentStock: Number(form.currentStock),
      minStockAlert: Number(form.minStockAlert),
    });

    setForm(emptyForm);
    setPage(1);
    loadProducts();
  };

  const openEdit = (product: any) => {
    setEditing(product);
    setEditForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: String(product.unitPrice),
      currentStock: String(product.currentStock),
      minStockAlert: String(product.minStockAlert),
      warehouse: product.warehouse,
    });
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await api.patch(`/products/${editing.id}`, {
      name: editForm.name,
      sku: editForm.sku,
      category: editForm.category,
      unitPrice: Number(editForm.unitPrice),
      minStockAlert: Number(editForm.minStockAlert),
      warehouse: editForm.warehouse,
    });

    setEditing(null);
    loadProducts();
  };

  const openStockForm = (product: any) => {
    setStockTarget(product);
    setStockForm(emptyStockForm);
  };

  const handleStockSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await api.post(`/products/${stockTarget.id}/stock`, {
        quantity: Number(stockForm.quantity),
        type: stockForm.type,
        reason: stockForm.reason,
      });

      setStockTarget(null);
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to record stock movement");
    }
  };

  const openMovements = async (product: any) => {
    setMovementsTarget(product);
    const response = await api.get(`/products/${product.id}/stock-movements`);
    setMovements(response.data.data);
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
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            required
          />

          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Unit price"
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Initial stock"
            value={form.currentStock}
            onChange={(e) =>
              setForm({ ...form, currentStock: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Minimum stock alert"
            value={form.minStockAlert}
            onChange={(e) =>
              setForm({ ...form, minStockAlert: e.target.value })
            }
          />

          <input
            placeholder="Warehouse"
            value={form.warehouse}
            onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
            required
          />

          <button type="submit">Add Product</button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h3>Inventory</h3>

            <div className="search-row">
              <input
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />

              <button onClick={runSearch} type="button">
                Search
              </button>
            </div>
          </div>

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
                  <th>Actions</th>
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
                          product.currentStock <= product.minStockAlert
                            ? "low-stock"
                            : ""
                        }
                      >
                        {product.currentStock}
                      </strong>
                    </td>
                    <td>{product.warehouse}</td>
                    <td className="row-actions">
                      <button
                        className="btn-secondary btn-sm"
                        type="button"
                        onClick={() => openEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary btn-sm"
                        type="button"
                        onClick={() => openStockForm(product)}
                      >
                        Stock
                      </button>
                      <button
                        className="btn-ghost btn-sm"
                        type="button"
                        onClick={() => openMovements(product)}
                      >
                        Log
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && products.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={7}>No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="btn-secondary btn-sm"
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn-secondary btn-sm"
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <Modal title="Edit Product" onClose={() => setEditing(null)}>
          <form onSubmit={handleEditSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Product name</label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>SKU</label>
                <input
                  value={editForm.sku}
                  onChange={(e) =>
                    setEditForm({ ...editForm, sku: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Category</label>
                <input
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Unit price</label>
                <input
                  type="number"
                  value={editForm.unitPrice}
                  onChange={(e) =>
                    setEditForm({ ...editForm, unitPrice: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Minimum stock alert</label>
                <input
                  type="number"
                  value={editForm.minStockAlert}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      minStockAlert: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Warehouse</label>
                <input
                  value={editForm.warehouse}
                  onChange={(e) =>
                    setEditForm({ ...editForm, warehouse: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Current stock is {editForm.currentStock}. Use the Stock action
              to record IN/OUT movements instead of editing it directly.
            </p>

            <div className="form-actions">
              <button type="submit">Save Changes</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {stockTarget && (
        <Modal
          title={`Record Stock Movement — ${stockTarget.name}`}
          onClose={() => setStockTarget(null)}
        >
          <form onSubmit={handleStockSubmit}>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Current stock: {stockTarget.currentStock}
            </p>

            <div className="form-grid">
              <div className="field">
                <label>Movement type</label>
                <select
                  value={stockForm.type}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, type: e.target.value })
                  }
                >
                  <option value="IN">Stock IN</option>
                  <option value="OUT">Stock OUT</option>
                </select>
              </div>

              <div className="field">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={stockForm.quantity}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, quantity: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field field-full">
                <label>Reason</label>
                <input
                  placeholder="e.g. New purchase order, damaged stock, stock count correction"
                  value={stockForm.reason}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, reason: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit">Save Movement</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStockTarget(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {movementsTarget && (
        <Modal
          title={`Stock Movement Log — ${movementsTarget.name}`}
          onClose={() => setMovementsTarget(null)}
        >
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Reason</th>
                  <th>By</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.type}</td>
                    <td>{movement.quantity}</td>
                    <td>{movement.reason}</td>
                    <td>{movement.user?.name || "—"}</td>
                    <td>
                      {new Date(movement.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {movements.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={5}>No stock movements recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
