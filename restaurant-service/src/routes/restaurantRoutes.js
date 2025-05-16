import express from "express";
import { addRestaurant, 
    approveRestaurant, 
    getAllRestaurants , 
    getRestaurantsByUserId, 
    checkRestaurantExists,  
    updateRestaurant,getNearbyRestaurants} from "../controllers/restaurantController.js";

import upload from "../middleware/multerMiddleware.js";
const router = express.Router();

router.post("/add-restaurant",upload.array("images"), addRestaurant);
router.get("/my-restaurants", getRestaurantsByUserId);
router.get("/check-owner", checkRestaurantExists);

router.put("/update-restaurant/:id",upload.array("images"), updateRestaurant);
router.put("/approve/:restaurantId", approveRestaurant);

router.get("/all-restaurants", getAllRestaurants);
router.get("/nearby-restaurants", getNearbyRestaurants);


export default router;
