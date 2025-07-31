/* eslint-disable no-useless-catch */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./Login.css"; // Ensure you import the CSS file

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(""); // Initialize username state
  const [password, setPassword] = useState(""); // Initialize password state
  const [station, setStation] = useState(""); // Initialize station state
  const [userData, setUserData] = useState(null); // Initialize userData state
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Use import.meta.env for Vite
      const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

      if (!apiKey) {
        throw new Error("API key is missing");
      }
      if (!username || !password) {
        throw new Error("Please fill in all fields");
      }

      const url = `${apiUrl}/auth/login/${username}/${password}`;

      let response;
      try {
        response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-api-key": apiKey, // Add API key from .env
          },
        });

        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response");
        }

        const data = await response.json();


        if (response.status === 200) {



          if (!data || !data.data) {
            throw new Error("ข้อมูลผู้ใช้ไม่ถูกต้อง กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน");
          }

          if (!data.data.Emp_Station) {
            throw new Error("ไม่พบสถานีของพนักงาน");
          }

          setUserData(data.data);

          // console.log( username);

          // Save station and username to localStorage
          localStorage.setItem("station", data.data.Emp_Station);
          localStorage.setItem("username", username);
          toast.success("Login Complete.");
          // Navigate to /scanQR on successful login
          navigate("/scanQR");
        } else {
          console.error("API Response Error:", data);
          throw new Error(`HTTP error! Status: ${response.status} - ${data.message || 'Unauthorized'}`);
        }
      } catch (error) {
        throw error; // Re-throw the error to be caught by the outer catch block
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <div className="form-container">
        <label className="form-label">
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="form-input"
          />
        </label>
        <label className="form-label">
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </label>
        <button onClick={handleLogin} disabled={loading} className="login-button">
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Login;