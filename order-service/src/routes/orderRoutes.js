import express from "express";
import {
  createOrder,
  getOrdersByUser,
  getOrdersByRestaurant,
  updateOrderStatus
} from "../controllers/orderController.js";
import { authMiddleware, restaurantAdminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getOrdersByUser);
router.get("/orders-by-restaurant/:restaurantId", authMiddleware, restaurantAdminMiddleware, getOrdersByRestaurant);

router.put("/update-status/:id",authMiddleware,restaurantAdminMiddleware,updateOrderStatus);

export default router;
