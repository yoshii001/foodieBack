import { Schema, model } from "mongoose";

const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  cuisineType: { type: String },
  isOpen: { type: Boolean, default: true },
  approved: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved"
  },
  rating: { type: Number, default: 0 },
  location: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
  },
  images: [{
    url: String,
    publicId: String
  }],
  description: { type: String },
  openingHours: { type: String },
  closingHours: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Index for geospatial queries
RestaurantSchema.index({ location: "2dsphere" });

export default model("Restaurant", RestaurantSchema);
