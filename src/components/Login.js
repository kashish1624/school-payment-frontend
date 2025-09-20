import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function Login({ setAuth }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      console.log(res.data);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setAuth(true);
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        alert("Login failed: invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      alert("Login failed: check console for details");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "400px", margin: "20px auto" }}
    >
      <h2>Login</h2>
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
        Login
      </button>
    </form>
  );
}

export default Login;
