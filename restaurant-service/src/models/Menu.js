import { Schema, model } from "mongoose";

const MenuSchema = new Schema({
  restaurantId: { 
    type: Schema.Types.ObjectId, 
    ref: "Restaurant", 
    required: true },

  name: { 
    type: String, 
    required: true },

  description: { 
    type: String },

  price: { 
    type: Number, 
    required: true },

  category: { 
    type: String }, // E.g., "Beverage", "Main Course", etc.

  isAvailable: { 
    type: Boolean, 
    default: true },

  images: [{
    url: String,
    publicId: String
    }],

  createdAt: { type: Date, default: Date.now },
});

export default model("Menu", MenuSchema);
