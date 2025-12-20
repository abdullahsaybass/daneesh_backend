import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import StudentMaster from "../models/studentMasterSchema.js";
import transporter from "../config/nodemailer.js";
import User from "../models/user.js";


export const register = async (req, res) => {
  try {
    const { rollno, email, password } = req.body;

    if (!rollno || !email || !password) {
      return res.status(400).json({
        message: "Roll no, email, password required"
      });
    }

    // Check roll number in university master
    const masterStudent = await StudentMaster.findOne({ rollno });
    if (!masterStudent) {
      return res.status(400).json({
        message: "Invalid university roll number"
      });
    }

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      rollno,
      name: masterStudent.name,
      department: masterStudent.department,
      year: masterStudent.year,
      email,
      password: hashedPassword,
      role: "student"
    });

    res.status(201).json({
      success: true,
      message: "Student registered"
    });

  } 
  
  catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
     sucess:false, message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

     res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      role: user.role
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      sucess:false, message: error.message
    });
  }
};


export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure : process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
            
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
        const user = await User.findOne({ email });
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

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    const user = await User.findOne({ email })
      .select("+password +resetOtp +resetOtpExpiryAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.resetOtp || user.resetOtp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (user.resetOtpExpiryAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiryAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const getMyDashboard = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const user = req.user;

    res.status(200).json({
      success: true,
      dashboard: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollno: user.rollno ?? null,
        department: user.department ?? null,
        year: user.year ?? null,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const me = async (req, res) => {
  res.status(200).json({
    success: true,

    user: req.user,
  });
};