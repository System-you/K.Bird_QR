import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./Login.css"; // Ensure you import the CSS file
import useUserStore from '../../config/store'; // Adjust the import path

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const { username, password, station, setUsername, setPassword, setStation, setUserData } = useUserStore();

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Use import.meta.env for Vite
      const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
      console.log("API Key:", apiKey);

      if (!apiKey) {
        throw new Error("API key is missing");
      }
      if (!username || !password || !station) {
        throw new Error("Please fill in all fields");
      }

      const url = `https://3459-2403-6200-8882-21fa-3d94-36af-f490-9625.ngrok-free.app/auth/login/${username}/${password}`;

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

        setUserData(result.data);
        setStation(station);

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