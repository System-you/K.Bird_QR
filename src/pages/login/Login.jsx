import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./Login.css"; // Ensure you import the CSS file

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [station, setStation] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Use import.meta.env for Vite
      const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;

      if (!apiKey) {
        throw new Error("API key is missing");
      }
      if (!username || !password || !station) {
        throw new Error("Please fill in all fields");
      }

      const url = `https://api-qr-demo.appsystemyou.com/auth/login/${username}/${password}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": apiKey, // Add API key from .env
        },
      });

      if (response.status === 200) {
        const result = await response.json(); // Parse the response JSON
        toast.success("Login Complete.");
        console.log("User Data:", result.data);
        
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        // Store the required fields in local storage
        localStorage.setItem("Emp_Id", result.data.Emp_Id);
        localStorage.setItem("Emp_Code", result.data.Emp_Code);
        localStorage.setItem("Emp_Prefix", result.data.Emp_Prefix);
        localStorage.setItem("Emp_Name", result.data.Emp_Name);
        localStorage.setItem("Emp_Nickname", result.data.Emp_Nickname);
        localStorage.setItem("Emp_Position", result.data.Emp_Position);
        localStorage.setItem("Emp_Dept", result.data.Emp_Dept);
        localStorage.setItem("Emp_Status", result.data.Emp_Status);
        localStorage.setItem("Emp_UUser", result.data.Emp_UUser);
        localStorage.setItem("Emp_PPass", result.data.Emp_PPass);
        localStorage.setItem("Dept_Name", result.data.Dept_Name);
        localStorage.setItem("PST_Name", result.data.PST_Name);

        // Store station in local storage
        localStorage.setItem("station", station);

        // Navigate to /scanQR on successful login
        navigate("/scanQR");
      } else {
        const errorResponse = await response.json();
        console.error("API Response Error:", errorResponse);
        throw new Error(`HTTP error! Status: ${response.status} - ${errorResponse.message || 'Unauthorized'}`);
      }
    } catch (error) {
      console.error("Error logging in:", error);
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
            onChange={(e) => setUsername(e.target.value)}
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
        <label className="form-label">
          Station:
          <input
            type="text"
            value={station}
            onChange={(e) => setStation(e.target.value)}
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