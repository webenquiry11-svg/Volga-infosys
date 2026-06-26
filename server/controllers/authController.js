import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin.js";
import RoleApplication from "../models/RoleApplication.js";
import { sendEmail } from "../config/emailService.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json({ token: signToken(admin._id) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.matchPassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  // Update last login (without validation to handle existing users without name)
  await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

  res.json({ 
    token: signToken(admin._id), 
    user: { 
      id: admin._id, 
      name: admin.name || "Admin User", // Fallback if name missing
      email: admin.email, 
      role: admin.role,
      permissions: admin.permissions
    } 
  });
};

// Get current user profile
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// Update current user profile
export const updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = { name, email };
    const user = await Admin.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Admin.findById(req.user.id);
    
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const user = await Admin.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // Send email
    const resetUrl = `${req.protocol}://${req.get("host")}/admin/index.html?reset=${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Please go to: ${resetUrl}`
      });
      
      res.json({ message: "Reset email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    
    const user = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    res.json({ token: signToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await Admin.find().select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { email, role, password, name, permissions } = req.body;
    const updateData = { email, role, name, permissions };
    if (password) {
      updateData.password = password;
    }
    const user = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user (admin only)
export const createUser = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json({ user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: "You can't delete your own account" });
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Role Applications
export const createRoleApplication = async (req, res) => {
  try {
    const application = await RoleApplication.create(req.body);
    res.status(201).json({ application });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getRoleApplications = async (req, res) => {
  try {
    const applications = await RoleApplication.find().populate("reviewedBy", "name email");
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewRoleApplication = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await RoleApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    application.status = status;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();
    
    // If approved, create/update user
    if (status === "approved") {
      let user = await Admin.findOne({ email: application.applicantEmail });
      if (!user) {
        // Create new user with random password
        const tempPassword = crypto.randomBytes(8).toString("hex");
        user = await Admin.create({
          name: application.applicantName,
          email: application.applicantEmail,
          password: tempPassword,
          role: application.requestedRole
        });
        
        // Send email with temp password
        try {
          await sendEmail({
            to: user.email,
            subject: "Your VOLGA Dashboard Account",
            text: `Your account has been created! Temporary password: ${tempPassword}`
          });
        } catch (emailError) {
          console.error("Email send failed:", emailError);
        }
      } else {
        user.role = application.requestedRole;
        await user.save();
      }
    }
    
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
