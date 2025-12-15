// models/StudentMaster.js
import mongoose from "mongoose";

const studentMasterSchema = new mongoose.Schema({
  rollno: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: Number, required: true }
});

export default mongoose.model("StudentMaster", studentMasterSchema);
