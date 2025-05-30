import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [newPassword, setNewPassword] = useState("");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
  });

  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        let url = "";
        if (user.role === "admin") url = "http://localhost:5000/api/auth/admin/dashboard";
        else if (user.role === "owner") url = "http://localhost:5000/api/auth/owner/dashboard";
        else url = "http://localhost:5000/api/auth/user/dashboard";

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const result = await res.json();
        if (res.ok) {
          setData(result);
          if (user.role === "user") {
            const userRatings = result.userRatings || {};
            setRatings(userRatings);
          }
        } else setData(null);
      } catch (err) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const handleAddUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/admin/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newUser),
      });
      const result = await res.json();
      alert(result.message);
    } catch (error) {
      alert("Error adding user.");
    }
  };

  const handleAddStore = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/admin/add-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newStore),
      });
      const result = await res.json();
      alert(result.message);
    } catch (error) {
      alert("Error adding store.");
    }
  };

  const updatePassword = async () => {
    try {
      await fetch("http://localhost:5000/api/user/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      alert("Password updated successfully.");
      setNewPassword("");
    } catch (err) {
      alert("Failed to update password.");
    }
  };

  if (!user) return <p>Loading user info...</p>;
  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>Error loading dashboard.</p>;

  if (user.role === "admin") {
    return (
      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>
        <p>Total Users: {data.totalUsers}</p>
        <p>Total Stores: {data.totalStores}</p>
        <p>Total Ratings: {data.totalRatings}</p>

        <h3>Add New User</h3>
        <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
        <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
        <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
        <input type="text" placeholder="Address" value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} />
        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
        <button onClick={handleAddUser}>Add User</button>

        <h3>Add New Store</h3>
        <input type="text" placeholder="Name" value={newStore.name} onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} />
        <input type="email" placeholder="Email" value={newStore.email} onChange={(e) => setNewStore({ ...newStore, email: e.target.value })} />
        <input type="text" placeholder="Address" value={newStore.address} onChange={(e) => setNewStore({ ...newStore, address: e.target.value })} />
        <button onClick={handleAddStore}>Add Store</button>
      </div>
    );
  }

  if (user.role === "owner") {
    return (
      <div className="dashboard-container">
        <h2>Store Owner Dashboard</h2>
        <p>Your Store Average Rating: {data.averageRating?.toFixed(2)}</p>

        <h3>Users who rated your store:</h3>
        {data.users?.length === 0 ? (
          <p>No ratings yet.</p>
        ) : (
          <ul>
            {data.users.map((u) => (
              <li key={u._id}>{u.name} - Rating: {u.rating}</li>
            ))}
          </ul>
        )}

        <hr />
        <h3>Update Password</h3>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={updatePassword}>Update Password</button>

        <hr />
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  if (user.role === "user") {
    const refreshRatings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/user/dashboard", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const result = await res.json();
        if (res.ok) {
          setData(result);
          const userRatings = result.userRatings || {};
          setRatings(userRatings);
        }
      } catch (err) {
        console.error("Failed to refresh ratings.");
      }
    };

    const handleRatingChange = (storeId, value) => {
      const numeric = Number(value);
      if (numeric < 1 || numeric > 5) return alert("Rating must be between 1 and 5");
      setRatings((prev) => ({ ...prev, [storeId]: numeric }));
    };

    const submitRating = async (storeId) => {
      const rating = ratings[storeId];
      if (!rating || rating < 1 || rating > 5) {
        return alert("Please enter a valid rating between 1 and 5.");
      }

      try {
        const res = await fetch(`http://localhost:5000/api/user/rate/${storeId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ rating }),
        });

        const result = await res.json();
        if (res.ok) {
          alert("Rating submitted successfully.");
          refreshRatings();
        } else {
          alert(result.message || "Failed to submit rating.");
        }
      } catch (err) {
        alert("Error submitting rating.");
      }
    };

    return (
      <div className="dashboard-container">
        <h2>User Dashboard</h2>
        <p>Welcome, {user.name}</p>

        <h3>Registered Stores</h3>
        {data.stores?.length === 0 ? (
          <p>No stores available</p>
        ) : (
          <ul>
            {data.stores?.map((store) => (
              <li key={store._id}>
                <strong>{store.name}</strong><br />
                Address: {store.address}<br />
                Overall Rating: {store.averageRating?.toFixed(1) || "N/A"}<br />
                Your Rating: {ratings[store._id] || "Not rated yet"}<br />
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={ratings[store._id] || ""}
                  onChange={(e) => handleRatingChange(store._id, e.target.value)}
                  placeholder="Rate 1-5"
                />
                <button onClick={() => submitRating(store._id)}>Submit / Update Rating</button>
              </li>
            ))}
          </ul>
        )}

        <hr />
        <h3>Update Password</h3>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={updatePassword}>Update Password</button>

        <hr />
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return null;
};

export default Dashboard;
