import mongoose from "mongoose";

const studentMasterSchema = new mongoose.Schema({
  rollno: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" }
}, { timestamps: true });

// Export as a **Model** to interact with MongoDB
const StudentMaster = mongoose.models.StudentMaster || mongoose.model("StudentMaster", studentMasterSchema);
export default StudentMaster;
