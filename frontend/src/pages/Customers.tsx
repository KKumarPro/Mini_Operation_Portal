import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    type: "RETAIL",
    address: "",
    status: "LEAD",
    notes: "",
  });

  const loadCustomers = async () => {
    const response = await api.get(
      `/customers?search=${encodeURIComponent(search)}`
    );

    setCustomers(response.data.data.customers);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await api.post("/customers", form);

    setForm({
      name: "",
      mobile: "",
      email: "",
      businessName: "",
      gstNumber: "",
      type: "RETAIL",
      address: "",
      status: "LEAD",
      notes: "",
    });

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
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            placeholder="Mobile"
            value={form.mobile}
            onChange={(e) =>
              setForm({ ...form, mobile: e.target.value })
            }
            required
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            placeholder="Business name"
            value={form.businessName}
            onChange={(e) =>
              setForm({
                ...form,
                businessName: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="GST number"
            value={form.gstNumber}
            onChange={(e) =>
              setForm({
                ...form,
                gstNumber: e.target.value,
              })
            }
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>

          <textarea
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
            required
          />

          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
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
              />

              <button onClick={loadCustomers}>
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
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.businessName}</td>
                    <td>{customer.mobile}</td>
                    <td>{customer.type}</td>
                    <td>{customer.status}</td>
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
