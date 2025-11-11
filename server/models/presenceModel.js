import mongoose from "mongoose";

const presenceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["present", "absent", "remote", "justified_absence"], 
    default: "present" 
  },
  justification: { type: String },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // RH validateur
}, { timestamps: true });

export default mongoose.model("Presence", presenceSchema);
