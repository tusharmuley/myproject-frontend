// src/pages/Login.js
import { useState } from "react";
import axios from "axios";
import "./Auth.css"; // Include this CSS file

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/token/`, {
        username,
        password
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      onLogin();  // redirect or update state
    } catch (err) {
      alert("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={login} className="auth-form">
        <h2>Login</h2>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <p>
          Don't have an account? <a href="/signup">Sign up here</a>
        </p>
      </form>
    </div>
  );
}
