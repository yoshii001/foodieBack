import express from "express";
import { registerUser, getUserProfile, updateUserProfile, deleteUser,getAllUsers } from '../controllers/userController.js';
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import { loginRestaurantAdmin, loginAdmin,loginCustomer,loginDeliveryPerson } from "../controllers/userController.js";
const router = express.Router();

// Public Routes
router.post("/register-user", registerUser);
router.post("/login-user", loginCustomer);
router.post("/login-res-admin",loginRestaurantAdmin);
router.post("/login-admin",loginAdmin);
router.post("/login-delivery",loginDeliveryPerson);


// Protected Routes
router.get("/get-profile", authMiddleware, getUserProfile);
router.put("/update-profile", authMiddleware, updateUserProfile);
router.delete("/delete-prof:id", authMiddleware, adminMiddleware, deleteUser);
router.get("/get-all",authMiddleware, adminMiddleware,getAllUsers);

export default router;
