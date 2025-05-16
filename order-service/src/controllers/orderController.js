import Order from "../models/Order.js";
import dotenv from 'dotenv';
dotenv.config();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL;

console.log("Using user service at:", USER_SERVICE_URL);
console.log("Using restaurant service at:", RESTAURANT_SERVICE_URL);


export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { restaurantId, items, totalAmount } = req.body;

    if (!restaurantId || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Incomplete order data" });
    }

    // 🔍 Fetch user to get address and location
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newOrder = new Order({
      userId,
      restaurantId,
      items,
      totalAmount,
      paymentMethod: "cash",         
      paymentStatus: "pending",
      orderStatus: "ready-to-checkout",
      deliveryAddress: user.address || "",
      deliveryLocation: user.location || { latitude: null, longitude: null }
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
};

// Get all orders for a specific user
export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// Get all orders for a specific restaurant
export const getOrdersByRestaurantID = async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.restaurantId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// Get all  orders for a specific restaurant where orderStatus is "orderPlaced"
export const getOrdersByRestaurant = async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.restaurantId, orderStatus: "order-placed" });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
}

//Update order status by id
export const updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
};