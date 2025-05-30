import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css"; // <-- import the CSS file

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Signup successful! Redirecting to login...");
        navigate("/login");
      } else {
        alert("Signup failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="signup-title">Sign Up</h2>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="address" placeholder="Address" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="user">User</option>
          <option value="owner">Store Owner</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
