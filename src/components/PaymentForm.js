// src/components/PaymentForm.js
import React, { useState } from "react";
import API from "../api";

function PaymentForm({ refreshTransactions }) {
  const [payment, setPayment] = useState({
    school_id: "",
    trustee_id: "",
    student_info: { name: "", id: "", email: "" },
    order_amount: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["name", "id", "email"].includes(name)) {
      setPayment({
        ...payment,
        student_info: { ...payment.student_info, [name]: value },
      });
    } else {
      setPayment({ ...payment, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/payment/create-payment", payment);
      alert("Payment created successfully!");
      setPayment({
        school_id: "",
        trustee_id: "",
        student_info: { name: "", id: "", email: "" },
        order_amount: ""
      });
      if (refreshTransactions) refreshTransactions(); // refresh the transactions table
    } catch (err) {
      console.error(err);
      alert("Payment creation failed!");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <h3>Create Payment</h3>
      <input type="text" name="school_id" placeholder="School ID" value={payment.school_id} onChange={handleChange} />
      <input type="text" name="trustee_id" placeholder="Trustee ID" value={payment.trustee_id} onChange={handleChange} />
      <input type="text" name="name" placeholder="Student Name" value={payment.student_info.name} onChange={handleChange} />
      <input type="text" name="id" placeholder="Student ID" value={payment.student_info.id} onChange={handleChange} />
      <input type="email" name="email" placeholder="Student Email" value={payment.student_info.email} onChange={handleChange} />
      <input type="number" name="order_amount" placeholder="Amount" value={payment.order_amount} onChange={handleChange} />
      <button type="submit">Create</button>
    </form>
  );
}

export default PaymentForm;
