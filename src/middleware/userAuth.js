import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized Login again " });
    }
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode.id) {
            req.body.userID = tokenDecode.Id
        }
        else{
            return res.status(401).json({ success: false, message: "Not authorized Login again " });
        }

        next();
    }

  
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export default userAuth;