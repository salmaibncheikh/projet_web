import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["contract", "pay_slip", "certificate", "other"], 
    default: "other" 
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
