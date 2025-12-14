import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import StudentMaster from "../models/studentMasterSchema.js";
import transporter from "../config/nodemailer.js";
import User from "../models/user.js";

export const register = async (req, res) => {
  const { rollno, email, password } = req.body;

  if (!rollno || !email || !password) {
    return res.status(400).json({ success: false, message: "Roll no, Email, Password required" });
  }

  try {
    // Check rollno in master collection
    const masterStudent = await StudentMaster.findOne({ rollno });
    if (!masterStudent) return res.status(404).json({ success: false, message: "Invalid roll number" });

    // Prevent duplicate registration
    const alreadyRegistered = await User.findOne({ rollno });
    if (alreadyRegistered) return res.status(400).json({ success: false, message: "Student already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      rollno,
      name: masterStudent.name,
      department: masterStudent.department,
      year: masterStudent.year,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and Password are required" });
  }

  try {
    // 1️⃣ Find user in User collection
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // 4️⃣ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5️⃣ Fetch official student info
    const studentInfo = await StudentMaster.findOne({ rollno: user.rollno });

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      data: {
        rollno: studentInfo.rollno,
        name: studentInfo.name,
        email: user.email,
        department: studentInfo.department,
        year: studentInfo.year,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure : process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            
        })

        return res.status(200).json({success:true, message: "Logout Successful"});
    }
    catch (error) {
        res.json({sucess:false, message: error.message});
    }
}

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    
    if(!email){
        return res.json({success:false, message: "Email is required"});
    }

    try{
        const user = await StudentMaster.findOne({ email });
        if(!user){
            return res.status(404).json({success:false, message: "User not found"});
        }
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpiryAt = Date.now() + 15 * 60 * 1000; 

        user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Hello,\n\nYour OTP for password reset is ${otp}. It is valid for 15 minutes.\n\nRegards,\nDace Team`
        };

        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ success: true, message: "OTP sent to email" });
    }
    catch (error) {
        res.json({sucess:false, message: error.message});
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    
    if(!email || !otp || !newPassword){
        return res.json({success:false, message: "All fields are required"});
    }
    try{

        const user = await StudentMaster.findOne({ email }).select("+resetOtp +resetOtpExpiryAt");
        if(!user){
            return res.status(404).json({success:false, message: "User not found"});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp ){
            return res.status(400).json({success:false, message: "Invalid OTP"});
        }

        if(user.resetOtpExpiryAt < Date.now()){
            return res.status(400).json({success:false, message: "OTP Expired"});
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpiryAt = null;

    }

    catch (error) {
        res.json({sucess:false, message: error.message});
    }
}