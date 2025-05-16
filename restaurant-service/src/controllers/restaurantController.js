import Restaurant from "../models/Restaurant.js";
import { getUserById , getUserLocation} from "../utils/userService.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { geocodeAddress } from "../utils/geocodingService.js";
import validator from "validator";
import cloudinary from "../utils/cloudinaryConfig.js";

dotenv.config();

// Extract user ID from JWT token
const extractUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

// ✅ Add Restaurant
export const addRestaurant = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Authorization token required" });

    const ownerId = extractUserIdFromToken(token);
    if (!ownerId) return res.status(401).json({ message: "Invalid or expired token" });

    const user = await getUserById(ownerId, token);
    if (!user || user.role !== "restaurant_admin") {
      return res.status(403).json({ message: "Forbidden: Only restaurant admins can add restaurants" });
    }

    const { name, email, phone, address,   cuisineType, description, openingHours, closingHours } = req.body;

    if (!name || !email || !phone || !address || !cuisineType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const existingRestaurant = await Restaurant.findOne({ $or: [{ email }, { phone }] });
    if (existingRestaurant) {
      return res.status(409).json({ message: "Restaurant with this email or phone already exists" });
    }

    let location = req.body.location;
    if (!location) {
      try {
        location = await geocodeAddress(address);
      } catch (error) {
        return res.status(400).json({
          message: "Could not determine location from address",
          error: error.message,
        });
      }
    }

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const base64Str = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const uploadResult = await cloudinary.uploader.upload(base64Str, {
          folder: "restaurants",
        });

        uploadedImages.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      }
    }

    const newRestaurant = new Restaurant({
      name,
      ownerId,
      email,
      phone,
      address,
      cuisineType,
      description,
      openingHours,
      closingHours,
      location,
      images: uploadedImages,
      approved: false,
      status: "pending",
    });

    await newRestaurant.save();

    res.status(201).json({
      message: "Restaurant submitted for admin approval",
      restaurant: {
        id: newRestaurant._id,
        ownerId,
        name,
        email,
        phone,
        address,
        cuisineType,
        description,
        openingHours,
        closingHours,
        location,
        images: uploadedImages,
        status: newRestaurant.status,
      },
    });
  } catch (err) {
    console.error("Restaurant creation error:", err);
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate entry",
        error: "Restaurant with this email or phone already exists",
      });
    }

    res.status(500).json({
      message: "Server error during restaurant creation",
      error: err.message,
    });
  }
};

// ✅ Get All Restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const allRestaurants = await Restaurant.find({});
    res.status(200).json({ restaurants: allRestaurants });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch restaurants",
      error: error.message,
    });
  }
};

// ✅ Approve a Restaurant
export const approveRestaurant = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const userId = extractUserIdFromToken(token);
    const user = await getUserById(userId, token);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    const { restaurantId } = req.params;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { approved: true, status: "approved" },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({
      message: "Restaurant approved successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve restaurant",
      error: error.message,
    });
  }
};

// ✅ Reject a Restaurant
export const rejectRestaurant = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const userId = extractUserIdFromToken(token);
    const user = await getUserById(userId, token);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    const { restaurantId } = req.params;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { approved: false, status: "rejected" },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({
      message: "Restaurant rejected successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject restaurant",
      error: error.message,
    });
  }
};

//  View Restaurant(s) by Logged-in Restaurant Admin
export const getRestaurantsByUserId = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await getUserById(userId, token);
    if (!user || user.role !== "restaurant_admin") {
      return res.status(403).json({ message: "Access denied: Only restaurant admins can view their restaurants" });
    }

    const restaurants = await Restaurant.find({ ownerId: userId });

    res.status(200).json({
      message: "Your restaurants retrieved successfully",
      restaurants,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({
      message: "Server error while fetching restaurants",
      error: error.message,
    });
  }
};

// Check if a Restaurant exists
export const checkRestaurantExists = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const ownerId = extractUserIdFromToken(token);
    if (!ownerId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const restaurant = await Restaurant.findOne({ ownerId });

    if (restaurant) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking restaurant existence:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Update Restaurant Details
export const updateRestaurant = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const ownerId = extractUserIdFromToken(token);
    if (!ownerId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { ownerId },
      req.body,
      { new: true, upsert: true }
    );    

    if (!updatedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }        

    res.status(200).json({
      message: "Restaurant details updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Error updating restaurant details:", error);
    res.status(500).json({
      message: "Server error while updating restaurant details",
      error: error.message,
    });
  }
};


// Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(value) {
  return value * Math.PI / 180;
}

// ✅ Get Nearby Restaurants (with microservice integration)
export const getNearbyRestaurants = async (req, res) => {
  try {
    // 1. Extract and verify token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Authorization token required" 
      });
    }

    // 2. Get user ID from token
    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired token" 
      });
    }

    // 3. Get user location from user microservice
    const userLocation = await getUserLocation(userId, token);
    if (!userLocation) {
      return res.status(400).json({
        success: false,
        message: "Location data not available",
        solutions: [
          "Update your profile with your address in the user service",
          "Provide coordinates manually via ?latitude=X&longitude=Y"
        ]
      });
    }

    // 4. Get search parameters
    const maxDistance = parseFloat(req.query.maxDistance) || 5; // Default 5km
    const { latitude, longitude } = userLocation;

    // 5. Find all approved restaurants with location data
    const restaurants = await Restaurant.find({
      approved: true,
      status: "approved",
      isOpen: true,
      "location.latitude": { $exists: true, $ne: null },
      "location.longitude": { $exists: true, $ne: null }
    });

    // 6. Calculate distances and filter
    const nearbyRestaurants = restaurants
      .map(restaurant => {
        const distance = calculateDistance(
          latitude,
          longitude,
          restaurant.location.latitude,
          restaurant.location.longitude
        );
        return {
          ...restaurant.toObject(),
          distance: parseFloat(distance.toFixed(2)) // Round to 2 decimal places
        };
      })
      .filter(restaurant => restaurant.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    // 7. Return results
    res.status(200).json({
      success: true,
      message: "Nearby restaurants retrieved successfully",
      userLocation: { latitude, longitude },
      searchRadius: maxDistance,
      count: nearbyRestaurants.length,
      restaurants: nearbyRestaurants
    });

  } catch (error) {
    console.error("Error in getNearbyRestaurants:", error);
    
    // Handle specific microservice errors
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "User not found in user service"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching nearby restaurants",
      error: error.message
    });
  }
};