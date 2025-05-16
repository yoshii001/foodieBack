import jwt from "jsonwebtoken";
import Restaurant from "../models/Restaurant.js";
import Menu from "../models/Menu.js";
import { getUserById } from "../utils/userService.js";

// Function to extract user ID from JWT token
const extractUserIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId;
    } catch (err) {
        return null;
    }
};

// Middleware to check if the user is the restaurant admin of the relevant restaurant
export const verifyRestaurantOwner = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

        if (!token) {
            return res.status(401).json({ message: "Unauthorized. No token provided." });
        }

        const userId = extractUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. Invalid token." });
        }

        // Get user details
        const user = await getUserById(userId, token);
        if (!user || user.role !== "restaurant_admin") {
            return res.status(403).json({ message: "Access denied. Only restaurant admins can manage menu items." });
        }

        let restaurantId;

        if (req.params.restaurantId) {
            // For adding a menu item, get restaurantId from request params
            restaurantId = req.params.restaurantId;
        } else if (req.params.id) {
            // For updating/deleting, fetch menu item to get restaurantId
            const menuItem = await Menu.findById(req.params.id);
            if (!menuItem) {
                return res.status(404).json({ message: "Menu item not found." });
            }
            restaurantId = menuItem.restaurantId;
        } else {
            return res.status(400).json({ message: "Invalid request." });
        }

        // Check if the restaurant exists and belongs to the logged-in user
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found." });
        }

        if (restaurant.ownerId !== userId) {
            return res.status(403).json({ message: "Unauthorized. You can only manage menu items for your own restaurant." });
        }

        req.restaurant = restaurant; // Pass the restaurant data to the next middleware
        next();

    } catch (err) {
        res.status(500).json({ message: "Error verifying ownership", error: err.message });
    }
};
