// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/ui/Navbar";
import Dashboard from "./components/dashboard/Dashboard";
import SchoolTransactions from "./components/school/SchoolTransactions";
import TransactionStatus from "./components/transaction/TransactionStatus";
import Login from "./components/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // ✅ for testing

  return (
    <Router>
      {isAuthenticated ? (
        <>
          <Navbar onLogout={() => setIsAuthenticated(false)} />
          <div className="p-4">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/school" element={<SchoolTransactions />} />
              <Route path="/status" element={<TransactionStatus />} />
            </Routes>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
