import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", {
        email: form.email,
        password: form.password,
        username: form.username || undefined,
      });
      console.log(res.data);
      alert("Registration successful! You can now login.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err);
      if (err.response?.data?.message) {
        alert("Registration failed: " + err.response.data.message);
      } else {
        alert("Registration failed. Check console for details.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "400px", margin: "20px auto" }}
    >
      <h2>Register</h2>
      <input
        type="text"
        name="username"
        placeholder="Username (optional)"
        value={form.username}
        onChange={handleChange}
        style={{ width: "100%", margin: "5px 0", padding: "8px" }}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        style={{ width: "100%", margin: "5px 0", padding: "8px" }}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        style={{ width: "100%", margin: "5px 0", padding: "8px" }}
      />
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Register
      </button>
    </form>
  );
}

export default Register;
