import React, { useState } from "react";
import API from "../../api";

export default function TransactionStatus() {
  const [customId, setCustomId] = useState("");
  const [result, setResult] = useState(null);

  const check = async () => {
    if (!customId) return alert("Enter customer order id or collect id.");
    try {
      const res = await API.get(`/transactions/${encodeURIComponent(customId)}/status`);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Transaction not found or server error. Check console.");
    }
  };

  const getBadge = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s.includes("success")) return "bg-green-100 text-green-700";
    if (s.includes("pending")) return "bg-yellow-100 text-yellow-700";
    if (s.includes("fail")) return "bg-red-100 text-red-700";
    if (s.includes("refund")) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <main className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Check Transaction Status</h2>
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <div className="flex gap-2 items-center">
            <input
              className="p-2 border rounded flex-1 bg-slate-50 dark:bg-slate-700"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="Enter collect_id or customer_order_id (e.g. CUST001)"
            />
            <button onClick={check} className="px-3 py-2 bg-indigo-600 text-white rounded">
              Check
            </button>
          </div>

          {result && (
            <div className="mt-4 p-3 border rounded bg-slate-50 dark:bg-slate-900">
              <div><strong>Collect ID:</strong> {result.collect_id}</div>
              <div><strong>Customer Order ID:</strong> {result.customer_order_id}</div>
              <div>
                <strong>Status:</strong>{" "}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadge(result.status)}`}>
                  {result.status}
                </span>
              </div>
              <div><strong>Order Amount:</strong> ₹{result.order_amount}</div>
              <div><strong>Transaction Amount:</strong> ₹{result.transaction_amount}</div>
              <div><strong>Payment Time:</strong> {result.payment_time ? new Date(result.payment_time).toLocaleString() : "-"}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
