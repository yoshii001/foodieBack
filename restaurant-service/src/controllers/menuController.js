import Menu from "../models/Menu";
import cloudinary from "../utils/cloudinaryConfig.js";

export const addMenuItem = async (req, res) => {
    try {
        const uploadedImages = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const base64Str = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
                const uploadResult = await cloudinary.uploader.upload(base64Str, {
                    folder: "menus",
                });

                uploadedImages.push({
                    url: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                });
            }
        }

        const newMenuItem = new Menu({
            restaurantId: req.params.restaurantId,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            images: uploadedImages,
            isAvailable: req.body.isAvailable,
        });

        await newMenuItem.save();
        res.status(201).json({ message: "Menu item added." });
    } catch (err) {
        res.status(500).json({ message: "Error adding menu item", error: err.message });
    }
};


// Update a menu item
export const updateMenuItem = async (req, res) => {
    try {
        const updatedMenuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMenuItem) {
            return res.status(404).json({ message: "Menu item not found." });
        }
        res.status(200).json(updatedMenuItem);
    } catch (err) {
        res.status(500).json({ message: "Error updating menu item", error: err.message });
    }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
    try {
        const deletedMenuItem = await Menu.findByIdAndDelete(req.params.id);
        if (!deletedMenuItem) {
            return res.status(404).json({ message: "Menu item not found." });
        }
        res.status(200).json({ message: "Menu item deleted." });
    } catch (err) {
        res.status(500).json({ message: "Error deleting menu item", error: err.message });
    }
};

// Get all menu items for a specific restaurant
export const getMenuItemsByRestaurantId = async (req, res) => {
    try {
        const menuItems = await Menu.find({ restaurantId: req.params.restaurantId });
        res.status(200).json(menuItems);
    } catch (err) {
        res.status(500).json({ message: "Error fetching menu items", error: err.message });
    }
};

// Get a specific menu item by ID by owner
export const getMenuItemById = async (req, res) => {
    try {
        const menuItem = await Menu.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found." });
        }
        res.status(200).json(menuItem);
    } catch (err) {
        res.status(500).json({ message: "Error fetching menu item", error: err.message });
    }
};

// Get all menu items
export const getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await Menu.find();
        res.status(200).json(menuItems);
    } catch (err) {
        res.status(500).json({ message: "Error fetching menu items", error: err.message });
    }
};