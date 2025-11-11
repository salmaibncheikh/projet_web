import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  period: { type: String, required: true }, // exemple: "2024-Q4"
  score: { type: Number, min: 0, max: 100 },
  feedback: { type: String },
  evaluator: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Manager / RH
}, { timestamps: true });

export default mongoose.model("Performance", performanceSchema);
