import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  nic: { type: String, unique: true, required: true },
  role: { 
    type: String, 
    enum: ["customer", "restaurant_admin", "delivery_person", "admin"], 
    required: true 
  },
  location: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
  },
  createdAt: { type: Date, default: Date.now }
});

export default model("User", UserSchema);
