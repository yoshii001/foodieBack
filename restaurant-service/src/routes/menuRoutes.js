import express from "express";
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItemById,
  getMenuItemsByRestaurantId
} from "../controllers/menuController.js";
import { verifyRestaurantOwner } from "../middleware/verifyRestaurantOwner.js";
import upload from "../middleware/multerMiddleware.js";

const router = express.Router();

router.post("/add-menu/:restaurantId",upload.array("images"), verifyRestaurantOwner, addMenuItem); 
router.put("/update-menu/:id", verifyRestaurantOwner, updateMenuItem); 
router.delete("/delete-menu/:id", verifyRestaurantOwner, deleteMenuItem); 

// View routes

router.get("/menu/:restaurantId", getMenuItemsByRestaurantId);
router.get("/item/:id", getMenuItemById); // Single menu item by ID
router.get("/all-menu", getAllMenuItems); 
export default router;
