import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  type: "RETAIL",
  address: "",
  status: "LEAD",
  notes: "",
};

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const loadCustomers = async () => {
    setLoading(true);

    try {
      const response = await api.get("/customers", {
        params: { search, page, limit: 10 },
      });

      setCustomers(response.data.data.customers);
      setTotalPages(response.data.data.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const runSearch = () => {
    setPage(1);
    loadCustomers();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await api.post("/customers", form);

    setForm(emptyForm);
    setPage(1);
    loadCustomers();
  };

  const openEdit = (customer: any) => {
    setEditing(customer);
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
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await api.patch(`/customers/${editing.id}`, editForm);

    setEditing(null);
    loadCustomers();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Customer CRM management</p>
        </div>
      </div>

      <div className="content-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <h3>Add Customer</h3>

          <input
            placeholder="Customer name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            placeholder="Mobile"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            required
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Business name"
            value={form.businessName}
            onChange={(e) =>
              setForm({ ...form, businessName: e.target.value })
            }
            required
          />

          <input
            placeholder="GST number"
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>

          <textarea
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <button type="submit">Add Customer</button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h3>Customer List</h3>

            <div className="search-row">
              <input
                placeholder="Search customer..."
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
                  <th>Name</th>
                  <th>Business</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <Link
                        className="link-btn"
                        to={`/customers/${customer.id}`}
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td>{customer.businessName}</td>
                    <td>{customer.mobile}</td>
                    <td>{customer.type}</td>
                    <td>
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="row-actions">
                      <button
                        className="btn-secondary btn-sm"
                        type="button"
                        onClick={() => openEdit(customer)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && customers.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={6}>No customers found</td>
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
        <Modal title="Edit Customer" onClose={() => setEditing(null)}>
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
                onClick={() => setEditing(null)}
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
