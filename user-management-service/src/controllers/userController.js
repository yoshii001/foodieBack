import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/emailService.js";
import { geocodeAddress } from "../utils/geocodingService.js";
import { validateRegistration } from "../utils/validators.js";

// Register user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, address, nic, role } = req.body;

        const { isValid, errors } = await validateRegistration(req.body);

        if (!isValid) {
            return res.status(400).json({
            message: "Validation failed",
            errors: errors 
            });
        }

        // Convert address to coordinates
        let location;
        try {
            location = await geocodeAddress(address);
        } catch (error) {
            console.error("Geocoding failed:", error.message);
            return res.status(400).json({ 
                message: "Could not determine location from address",
                error: error.message 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            nic: nic.toUpperCase(),
            role,
            location
        });

        await newUser.save();

        // Send welcome email
        try {
            await sendEmail(
                email,
                "Welcome to Foodie App",
                `Hi ${name}, your account has been created successfully.`
            );
        } catch (emailError) {
            console.log("Email sending failed:", emailError.message);
        }

        res.status(201).json({ 
            message: "User registered successfully",
            user: { 
                id: newUser._id, 
                name, 
                email, 
                phone, 
                address, 
                nic: nic.toUpperCase(), 
                role, 
                location 
            }
        });

    } catch (err) {
        res.status(500).json({ 
            
            message: "Server error during registration",
            error: err.message 
        });
        console.log(err);
    }
};


const loginBase = async (req, res, expectedRole) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 🔐 Check role
    if (user.role !== expectedRole) {
      return res.status(403).json({ message: `Access denied. You must be a ${expectedRole}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    await sendEmail(
      email,
      `Login Alert - ${expectedRole}`,
      `Hi ${user.name},\n\nYou have successfully logged in as a ${expectedRole}.\nIf this wasn't you, please report it immediately.`
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
};

// Exported functions for each role
export const loginCustomer = (req, res) => loginBase(req, res, "customer");
export const loginRestaurantAdmin = (req, res) => loginBase(req, res, "restaurant_admin");
export const loginDeliveryPerson = (req, res) => loginBase(req, res, "delivery_person");
export const loginAdmin = (req, res) => loginBase(req, res, "admin");

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user profile.", error: err.message });
    }
};


// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, address, password } = req.body;
        let updateFields = { name, phone, address };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.userId, updateFields, { new: true }).select("-password");

        // Send profile update notification email
        await sendEmail(
            updatedUser.email,
            "Profile Updated Successfully",
            `Dear ${updatedUser.name},\n\nYour profile was successfully updated on Foodie App.\n\nBest regards,\nFoodie App Team`
        );

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Failed to update user.", error: err.message });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Send deletion notification email
        await sendEmail(
            user.email,
            "Account Deleted",
            `Dear ${user.name},\n\nYour account has been deleted from Foodie App.\n\nIf you have any questions, please contact support.\n\nBest regards,\nFoodie App Team`
        );

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user.", error: err.message });
    }
};


// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); 
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users.", error: err.message });
    }
};
