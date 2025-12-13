import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import StudentMaster from "../models/studentMasterSchema.js";

export const register = async (req, res) => {
  const{name,email,rollno,department,year,password} = req.body;

  if(!name || !email || !rollno || !department || !year || !password){
    return res.status(400).json({success:false, message: "All fields are required"});
  }

  try {
    const student = await StudentMaster.findOne({ rollno });
    if(!student){
        return res.status(404).json({success:false, message: "Invalid roll Number" });
    }
    if (student) {
      return res
        .status(400)
        .json({ success: false, message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new StudentMaster({
        name,
        email,
        rollno,
        department,
        year,
        password: hashedPassword
    });

    await newStudent.save();
   
    const token = jwt.sign({ id: newStudent._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure : process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

  }
  catch (error) {
    res.json({sucess:false, message: error.message});
  }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.json({success:false, message: "Email and Password are required"});
    }

    try{
        const user = await StudentMaster.findOne({
            email
        })
        if(!user){
            return res.status(404).json({success:false, message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({success:false, message: "Invalid Credentials"});
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure : process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({success:true, message: "Login Successful"});
    
    }
    catch (error) {
        res.json({sucess:false, message: error.message});
    }

}

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