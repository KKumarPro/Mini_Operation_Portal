import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

interface ItemRow {
  productId: string;
  quantity: string;
}

export default function Challans() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { productId: "", quantity: "1" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [viewing, setViewing] = useState<any | null>(null);

  const loadReferenceData = async () => {
    const [customerResponse, productResponse] = await Promise.all([
      api.get("/customers", { params: { limit: 100 } }),
      api.get("/products", { params: { limit: 100 } }),
    ]);

    setCustomers(customerResponse.data.data.customers);
    setProducts(productResponse.data.data.products);
  };

  const loadChallans = async () => {
    const response = await api.get("/challans", {
      params: {
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: search || undefined,
      },
    });

    setChallans(response.data.data.challans);
    setTotalPages(response.data.data.pagination.totalPages);
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadChallans();
  }, [page, statusFilter]);

  const runSearch = () => {
    setPage(1);
    loadChallans();
  };

  const addItemRow = () => {
    setItems([...items, { productId: "", quantity: "1" }]);
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: keyof ItemRow, value: string) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const resetForm = () => {
    setCustomerId("");
    setItems([{ productId: "", quantity: "1" }]);
  };

  const submitChallan = async (status: "DRAFT" | "CONFIRMED") => {
    if (!customerId) {
      alert("Select a customer");
      return;
    }

    const validItems = items.filter(
      (item) => item.productId && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Add at least one product with a quantity");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/challans", {
        customerId,
        status,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
      });

      alert(
        status === "DRAFT"
          ? "Challan saved as draft"
          : "Challan confirmed and stock updated"
      );

      resetForm();
      setPage(1);
      loadChallans();
      loadReferenceData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to create challan");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (
    challan: any,
    status: "CONFIRMED" | "CANCELLED"
  ) => {
    try {
      await api.patch(`/challans/${challan.id}/status`, { status });
      loadChallans();
      loadReferenceData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Unable to update challan");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sales Challans</h1>
          <p>Create and manage sales challans</p>
        </div>
      </div>

      <div className="panel challan-form">
        <h3>Create Challan</h3>

        <label>Customer</label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">Select customer</option>

          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.businessName}
            </option>
          ))}
        </select>

        <label>Products</label>
        {items.map((item, index) => (
          <div className="challan-item-row" key={index}>
            <select
              value={item.productId}
              onChange={(e) =>
                updateItemRow(index, "productId", e.target.value)
              }
            >
              <option value="">Select product</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — Stock: {product.currentStock}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateItemRow(index, "quantity", e.target.value)
              }
            />

            <button
              type="button"
              className="remove-row-btn"
              onClick={() => removeItemRow(index)}
              disabled={items.length === 1}
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn-secondary add-row-btn"
          onClick={addItemRow}
        >
          + Add Product
        </button>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={submitting}
            onClick={() => submitChallan("DRAFT")}
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => submitChallan("CONFIRMED")}
          >
            Confirm Challan
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Challan History</h3>
        </div>

        <div className="filter-row">
          <input
            placeholder="Search challan no. or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button type="button" onClick={runSearch}>
            Search
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Challan No.</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {challans.map((challan) => (
                <tr key={challan.id}>
                  <td>
                    <button
                      className="link-btn"
                      type="button"
                      onClick={() => setViewing(challan)}
                    >
                      {challan.challanNumber}
                    </button>
                  </td>
                  <td>{challan.customer.businessName}</td>
                  <td>{challan.totalQuantity}</td>
                  <td>
                    <StatusBadge status={challan.status} />
                  </td>
                  <td>{new Date(challan.createdAt).toLocaleDateString()}</td>
                  <td className="row-actions">
                    {challan.status === "DRAFT" && (
                      <>
                        <button
                          className="btn-sm"
                          type="button"
                          onClick={() => updateStatus(challan, "CONFIRMED")}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn-danger btn-sm"
                          type="button"
                          onClick={() => updateStatus(challan, "CANCELLED")}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {challans.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={6}>No challans found</td>
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

      {viewing && (
        <Modal
          title={`Challan ${viewing.challanNumber}`}
          onClose={() => setViewing(null)}
        >
          <div className="detail-grid">
            <div className="detail-item">
              <span>Customer</span>
              <strong>{viewing.customer.businessName}</strong>
            </div>

            <div className="detail-item">
              <span>Status</span>
              <StatusBadge status={viewing.status} />
            </div>

            <div className="detail-item">
              <span>Total Quantity</span>
              <strong>{viewing.totalQuantity}</strong>
            </div>

            <div className="detail-item">
              <span>Date</span>
              <strong>
                {new Date(viewing.createdAt).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                </tr>
              </thead>

              <tbody>
                {viewing.items.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.sku}</td>
                    <td>₹{item.unitPrice}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
