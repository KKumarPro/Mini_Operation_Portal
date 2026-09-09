import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const loadCustomer = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/customers/${id}`);
      setCustomer(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Unable to load customer details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const openEdit = () => {
    setEditForm({
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      businessName: customer.businessName || "",
      gstNumber: customer.gstNumber || "",
      type: customer.type,
      address: customer.address || "",
      status: customer.status,
      notes: customer.notes || "",
    });
    setEditing(true);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.patch(`/customers/${id}`, editForm);
    setEditing(false);
    loadCustomer();
  };

  const handleFollowUpSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!followUpNotes.trim()) return;

    await api.post(`/customers/${id}/follow-up`, {
      notes: followUpNotes,
      followUpDate: followUpDate
        ? new Date(followUpDate).toISOString()
        : undefined,
    });

    setFollowUpNotes("");
    setFollowUpDate("");
    loadCustomer();
  };

  if (loading) {
    return <div className="loading-state">Loading customer...</div>;
  }

  if (error || !customer) {
    return <div className="error-state">{error || "Customer not found"}</div>;
  }

  return (
    <div>
      <Link className="back-link" to="/customers">
        ← Back to customers
      </Link>

      <div className="page-header">
        <div>
          <h1>{customer.name}</h1>
          <p>{customer.businessName}</p>
        </div>

        <button onClick={openEdit}>Edit Customer</button>
      </div>

      <div className="panel">
        <h3>Customer Details</h3>

        <div className="detail-grid">
          <div className="detail-item">
            <span>Mobile</span>
            <strong>{customer.mobile}</strong>
          </div>

          <div className="detail-item">
            <span>Email</span>
            <strong>{customer.email || "—"}</strong>
          </div>

          <div className="detail-item">
            <span>GST Number</span>
            <strong>{customer.gstNumber || "—"}</strong>
          </div>

          <div className="detail-item">
            <span>Customer Type</span>
            <strong>{customer.type}</strong>
          </div>

          <div className="detail-item">
            <span>Status</span>
            <StatusBadge status={customer.status} />
          </div>

          <div className="detail-item">
            <span>Follow-up Date</span>
            <strong>
              {customer.followUpDate
                ? new Date(customer.followUpDate).toLocaleDateString()
                : "—"}
            </strong>
          </div>

          <div className="detail-item">
            <span>Address</span>
            <strong>{customer.address}</strong>
          </div>
        </div>

        {customer.notes && (
          <div>
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
              }}
            >
              Notes / Follow-up history
            </span>
            <div className="notes-block">{customer.notes}</div>
          </div>
        )}
      </div>

      <div className="content-grid">
        <form className="panel" onSubmit={handleFollowUpSubmit}>
          <h3>Add Follow-up</h3>

          <textarea
            placeholder="Follow-up note"
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            required
          />

          <label>Next follow-up date (optional)</label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />

          <button type="submit">Save Follow-up</button>
        </form>

        <div className="panel">
          <h3>Challan History</h3>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Challan No.</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {(customer.challans || []).map((challan: any) => (
                  <tr key={challan.id}>
                    <td>{challan.challanNumber}</td>
                    <td>{challan.totalQuantity}</td>
                    <td>
                      <StatusBadge status={challan.status} />
                    </td>
                    <td>
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {(!customer.challans || customer.challans.length === 0) && (
                  <tr className="empty-row">
                    <td colSpan={4}>No challans yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editing && editForm && (
        <Modal title="Edit Customer" onClose={() => setEditing(false)}>
          <form onSubmit={handleEditSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Customer name</label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Mobile</label>
                <input
                  value={editForm.mobile}
                  onChange={(e) =>
                    setEditForm({ ...editForm, mobile: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Business name</label>
                <input
                  value={editForm.businessName}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      businessName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>GST number</label>
                <input
                  value={editForm.gstNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gstNumber: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Customer type</label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>

              <div className="field field-full">
                <label>Address</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  required
                />
              </div>

              <div className="field">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                >
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="field field-full">
                <label>Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit">Save Changes</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
