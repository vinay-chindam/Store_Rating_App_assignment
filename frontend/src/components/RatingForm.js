// src/components/RatingForm.js
import React, { useEffect, useState } from "react";

const RatingForm = ({ storeId }) => {
  const [rating, setRating] = useState(0);
  const [userRatingId, setUserRatingId] = useState(null); // to track if rating exists
  const [message, setMessage] = useState("");

  // Fetch user’s existing rating for this store if any
  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const res = await fetch(`http://localhost:5000/ratings/user/${storeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.rating) {
            setRating(data.rating);
            setUserRatingId(data._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserRating();
  }, [storeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setMessage("Rating must be between 1 and 5");
      return;
    }
    try {
      const method = userRatingId ? "PUT" : "POST";
      const url = userRatingId
        ? `http://localhost:5000/ratings/${userRatingId}`
        : `http://localhost:5000/ratings`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ storeId, rating }),
      });

      if (res.ok) {
        setMessage("Rating submitted successfully!");
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to submit rating");
      }
    } catch (err) {
      setMessage("Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Your Rating:
        <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
          <option value={0}>Select</option>
          {[1, 2, 3, 4, 5].map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">{userRatingId ? "Update Rating" : "Submit Rating"}</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default RatingForm;
