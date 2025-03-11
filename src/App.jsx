import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import ScanQR from "./pages/scanQR/ScanQR.jsx";
import "./App.css";
// FOR TEST 
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/scanQR" element={<ScanQR />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;