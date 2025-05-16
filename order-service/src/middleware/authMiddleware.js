import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Restaurant Admin Access Middleware
export const restaurantAdminMiddleware = (req, res, next) => {
  if (req.user.role !== "restaurant_admin") {
      return res.status(403).json({ message: "Access denied. Restaurant Admin only." });
  }
  next();
};





