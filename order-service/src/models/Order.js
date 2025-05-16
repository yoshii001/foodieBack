import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  items: [
    {
      menuItemId: String,
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  deliveryAddress: { type: String, required: false },
  deliveryLocation: { type: String, required: false },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: "cash" },
  paymentStatus: { type: String, default: "pending" },
  orderStatus: {
    type: String,
    enum: [
      "ready-to-checkout",
      "order-placed", 
      "confirmed", 
      "preparing", 
      "picked-up", 
      "on-the-way", 
      "rejected", 
      "cancelled", 
      "completed"],
    default: "ready-to-checkout"
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", OrderSchema);
