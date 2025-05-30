// middleware/authenticate.js

const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  // Get token from Authorization header
  console.log("in midl")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  try {
    // Verify token using JWT_SECRET from env variables
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info (usually id and role) to request object
    req.user = verified;

    // Proceed to next middleware or route handler
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
