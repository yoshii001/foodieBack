import { verify } from "jsonwebtoken";

// Auth Middleware - Protect routes
export const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId, role: decoded.role, email: decoded.email };
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token. Please log in again." });
    }
};

// Admin Access Middleware
export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};



