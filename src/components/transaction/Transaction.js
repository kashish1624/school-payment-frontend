// src/components/Transaction.js
import React, { useEffect, useState } from "react";
import API from "../../api";

function Transaction() {
  const [transaction, setTransaction] = useState([]);

  const fetchTransaction = async () => {
    try {
      const res = await API.get("/transactions");
      setTransaction(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("Failed to fetch transactions!");
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, []);

  return (
    <div>
      <h3>Transaction</h3>
      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transaction.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No transaction found
              </td>
            </tr>
          ) : (
            transaction.map((t) => (
              <tr key={t._id || t.collect_id}>
                <td>{t.order_info?.student_info?.name || t.student_info?.name}</td>
                <td>{t.order_amount || t.transaction_amount}</td>
                <td
                  style={{
                    color:
                      t.status?.toLowerCase().includes("success")
                        ? "green"
                        : t.status?.toLowerCase().includes("pending")
                        ? "orange"
                        : t.status?.toLowerCase().includes("fail")
                        ? "red"
                        : "black",
                    fontWeight: "bold",
                  }}
                >
                  {t.status}
                </td>
                <td>
                  {t.payment_time
                    ? new Date(t.payment_time).toLocaleString()
                    : t.createdAt
                    ? new Date(t.createdAt).toLocaleString()
                    : "NA"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Transaction;
