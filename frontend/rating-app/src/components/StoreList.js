// src/components/StoreList.js
import React, { useEffect, useState } from "react";
import RatingForm from "./RatingForm";

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    setLoading(true);
    try {
      let query = new URLSearchParams(search).toString();
      const res = await fetch(`http://localhost:5000/stores?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearchChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores();
  };

  if (loading) return <p>Loading stores...</p>;

  return (
    <div>
      <h2>Stores</h2>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Search by Name"
          value={search.name}
          onChange={handleSearchChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Search by Address"
          value={search.address}
          onChange={handleSearchChange}
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {stores.map((store) => (
          <li key={store._id} style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}>
            <p><b>{store.name}</b></p>
            <p>Address: {store.address}</p>
            <p>Overall Rating: {store.averageRating?.toFixed(1) || "No ratings"}</p>
            <RatingForm storeId={store._id} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StoreList;
