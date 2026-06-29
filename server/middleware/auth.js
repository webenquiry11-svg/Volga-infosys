import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Session from "../models/Session.js";

// Protect routes
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is valid
    const session = await Session.findOne({ token });
    if (!session) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }
    
    // Check if user still exists
    const user = await Admin.findById(decoded.id).select("-password");
    if (!user) {
      // Delete the invalid session
      await Session.deleteOne({ token });
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "User not authorized to perform this action" 
      });
    }
    next();
  };
};

// Permission-based access control
export const hasPermission = (permission) => {
  return (req, res, next) => {
    // Admin has all permissions
    if (req.user.role === "admin") {
      return next();
    }
    // Check if user has the specific permission
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        success: false, 
        message: "User not authorized to perform this action" 
      });
    }
    next();
  };
};

export default protect;
