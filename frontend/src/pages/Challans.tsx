import { useEffect, useState } from "react";
import api from "../services/api";

export default function Challans() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const loadData = async () => {
    const [customerResponse, productResponse, challanResponse] =
      await Promise.all([
        api.get("/customers"),
        api.get("/products"),
        api.get("/challans"),
      ]);

    setCustomers(
      customerResponse.data.data.customers
    );

    setProducts(
      productResponse.data.data.products
    );

    setChallans(challanResponse.data.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createChallan = async () => {
    if (!customerId || !productId) {
      alert("Select customer and product");
      return;
    }

    try {
      await api.post("/challans", {
        customerId,
        status: "CONFIRMED",
        items: [
          {
            productId,
            quantity: Number(quantity),
          },
        ],
      });

      alert("Sales challan created successfully");
      loadData();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Unable to create challan"
      );
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
        <h3>Create Confirmed Challan</h3>

        <select
          value={customerId}
          onChange={(e) =>
            setCustomerId(e.target.value)
          }
        >
          <option value="">Select customer</option>

          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.businessName}
            </option>
          ))}
        </select>

        <select
          value={productId}
          onChange={(e) =>
            setProductId(e.target.value)
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
          value={quantity}
          onChange={(e) =>
            setQuantity(Number(e.target.value))
          }
        />

        <button onClick={createChallan}>
          Confirm Challan
        </button>
      </div>

      <div className="panel">
        <h3>Challan History</h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Challan No.</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {challans.map((challan) => (
                <tr key={challan.id}>
                  <td>{challan.challanNumber}</td>
                  <td>{challan.customer.businessName}</td>
                  <td>{challan.totalQuantity}</td>
                  <td>{challan.status}</td>
                  <td>
                    {new Date(
                      challan.createdAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}