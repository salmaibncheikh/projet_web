import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  hireDate: { type: Date, default: Date.now },
  salary: { type: Number },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
