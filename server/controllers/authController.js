import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin.js";
import RoleApplication from "../models/RoleApplication.js";
import PasswordChangeRequest from "../models/PasswordChangeRequest.js";
import Session from "../models/Session.js";
import { sendEmail } from "../config/emailService.js";
import { ROLE_PERMISSIONS, PERMISSIONS } from "../config/permissions.js";

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
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);
    
    const admin = await Admin.findOne({ email });
    console.log("User found:", admin ? admin.email : "No user found");
    
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const passwordMatch = await admin.matchPassword(password);
    console.log("Password match:", passwordMatch);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If user has no permissions, set default permissions based on role
    if (!admin.permissions || admin.permissions.length === 0) {
      admin.permissions = ROLE_PERMISSIONS[admin.role] || [];
      await admin.save();
    }

    // Update last login (without validation to handle existing users without name)
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    const token = signToken(admin._id);
    
    // Create a session
    await Session.create({
      userId: admin._id,
      token
    });

    res.json({ 
      token, 
      user: { 
        id: admin._id, 
        name: admin.name || "Admin User", // Fallback if name missing
        email: admin.email, 
        role: admin.role,
        permissions: admin.permissions
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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
    console.log("Change password request received for user:", req.user.id);
    
    const user = await Admin.findById(req.user.id);
    console.log("Found user:", user.email);
    
    if (!(await user.matchPassword(currentPassword))) {
      console.log("Current password is incorrect");
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    
    console.log("Setting new password");
    user.password = newPassword;
    console.log("Saving user");
    await user.save();
    console.log("User saved successfully");
    
    // Delete all sessions except current one? Or just let user login again?
    // For simplicity, let's delete all sessions so user has to login with new password
    const token = req.headers.authorization?.split(" ")[1];
    await Session.deleteMany({ userId: req.user.id, token: { $ne: token } });
    
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: error.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      await Session.deleteOne({ token });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all permissions (admin only)
export const getPermissions = async (req, res) => {
  try {
    res.json({ 
      permissions: PERMISSIONS,
      rolePermissions: ROLE_PERMISSIONS
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    console.log("Forgot password request for email:", req.body.email);
    const user = await Admin.findOne({ email: req.body.email });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Found user:", user.email);
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    console.log("Generated reset token (raw):", resetToken);
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log("Hashed reset token:", user.resetPasswordToken);
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    console.log("User saved with reset token");
    
    // Send email (or log token for testing)
    const resetUrl = `${req.protocol}://${req.get("host")}/admin/index.html?reset=${resetToken}`;
    console.log("========== RESET TOKEN FOR TESTING ==========");
    console.log("Raw reset token:", resetToken);
    console.log("Reset URL:", resetUrl);
    console.log("=============================================");
    
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Please go to: ${resetUrl}`
      });
      
      console.log("Reset email sent successfully");
      res.json({ message: "Reset email sent (check server logs for token if needed)" });
    } catch (error) {
      console.error("Error sending email, but reset token is still valid (check logs):", error);
      res.json({ message: "Reset token generated (check server logs to get it)" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    console.log("Reset password request received");
    console.log("Raw token from params:", req.params.token);
    
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    console.log("Hashed token to look for:", resetPasswordToken);
    
    const user = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    console.log("Found user for reset:", user ? user.email : "No user found");
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    console.log("Setting new password:", req.body.password);
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    console.log("User password updated and saved successfully");
    
    res.json({ token: signToken(user._id) });
  } catch (error) {
    console.error("Reset password error:", error);
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
    const updateData = { email, role, name };
    
    // If role changed but permissions not provided, use default role permissions
    if (role && !permissions) {
      updateData.permissions = ROLE_PERMISSIONS[role];
    } else if (permissions) {
      updateData.permissions = permissions;
    }
    
    if (password) {
      updateData.password = password;
    }
    
    const user = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // If user was updated, log them out of all devices
    await Session.deleteMany({ userId: req.params.id });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user (admin only)
export const createUser = async (req, res) => {
  try {
    // Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    
    // Set default permissions based on role
    const permissions = req.body.permissions || ROLE_PERMISSIONS[req.body.role] || [];
    
    // Create user with temp password and permissions
    const admin = await Admin.create({
      ...req.body,
      password: tempPassword,
      permissions
    });
    
    // Send email with credentials
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #013350;">Welcome to VOLGA Dashboard!</h2>
          <p>Hello ${admin.name},</p>
          <p>An admin has created a dashboard account for you! Here are your login credentials:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px;">
            <p><strong>Email:</strong> ${admin.email}</p>
            <p><strong>Temporary Password:</strong> <span style="font-size: 18px; font-weight: bold; color: #F35F37;">${tempPassword}</span></p>
          </div>
          <p><strong>Important:</strong> Please log in and change your password immediately!</p>
          <p>Best regards,<br>The VOLGA Team</p>
        </div>
      </body>
      </html>
    `;
    
    try {
      await sendEmail({
        to: admin.email,
        subject: "Your VOLGA Dashboard Account",
        html: htmlContent,
        text: `An admin has created a dashboard account for you! Temporary password: ${tempPassword}. Please change it immediately after logging in.`
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }
    
    res.status(201).json({ user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, permissions: admin.permissions } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: "You can't delete your own account" });
    // Delete all sessions for this user
    await Session.deleteMany({ userId: req.params.id });
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
        // Create new user with random password and default permissions for the role
        const tempPassword = crypto.randomBytes(8).toString("hex");
        user = await Admin.create({
          name: application.applicantName,
          email: application.applicantEmail,
          password: tempPassword,
          role: application.requestedRole,
          permissions: ROLE_PERMISSIONS[application.requestedRole]
        });
        
        // Send email with temp password
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #013350;">Welcome to VOLGA Dashboard!</h2>
              <p>Hello ${application.applicantName},</p>
              <p>Your request to become a user has been accepted! Here are your login credentials:</p>
              <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px;">
                <p><strong>Email:</strong> ${application.applicantEmail}</p>
                <p><strong>Temporary Password:</strong> <span style="font-size: 18px; font-weight: bold; color: #F35F37;">${tempPassword}</span></p>
              </div>
              <p><strong>Important:</strong> Please log in and change your password immediately!</p>
              <p>Best regards,<br>The VOLGA Team</p>
            </div>
          </body>
          </html>
        `;
        
        try {
          await sendEmail({
            to: user.email,
            subject: "Your VOLGA Dashboard Account Request Accepted",
            html: htmlContent,
            text: `Your request to become a user has been accepted! Welcome to VOLGA Dashboard! Your account has been created. Temporary password: ${tempPassword}. Please change it immediately after logging in.`
          });
        } catch (emailError) {
          console.error("Email send failed:", emailError);
        }
      } else {
        user.role = application.requestedRole;
        user.permissions = ROLE_PERMISSIONS[application.requestedRole];
        await user.save();
        
        // Log user out of all devices
        await Session.deleteMany({ userId: user._id });
        
        // Send email to existing user about role update
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #013350;">Role Update</h2>
              <p>Hello ${application.applicantName},</p>
              <p>Your dashboard role has been updated to: <strong>${application.requestedRole}</strong></p>
              <p>Best regards,<br>The VOLGA Team</p>
            </div>
          </body>
          </html>
        `;
        
        try {
          await sendEmail({
            to: user.email,
            subject: "Your VOLGA Dashboard Role Has Been Updated",
            html: htmlContent,
            text: `Hello ${application.applicantName}, your dashboard role has been updated to: ${application.requestedRole}`
          });
        } catch (emailError) {
          console.error("Email send failed:", emailError);
        }
      }
    }
    
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Update user's profile picture
    const profilePicturePath = `/uploads/${req.file.filename}`;
    const user = await Admin.findByIdAndUpdate(
      req.user.id,
      { profilePicture: profilePicturePath },
      { new: true }
    ).select("-password");

    res.json({ user, profilePicture: profilePicturePath });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Password Change Requests
export const createPasswordChangeRequest = async (req, res) => {
  try {
    const { userEmail, userName } = req.body;
    console.log("Password change request received for:", userEmail);

    // Find the user first
    const user = await Admin.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found with that email" });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    console.log("Generated temp password:", tempPassword);

    // Update user's password
    user.password = tempPassword;
    console.log("Saving user with new temp password");
    await user.save();
    console.log("User saved with new temp password");

    // Create request record (optional, but keep for history)
    const request = await PasswordChangeRequest.create({
      userEmail,
      userName,
      status: "approved",
      tempPassword
    });

    // Send email to user with temp password immediately
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #013350;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>Your password reset request has been processed! Here's your temporary password:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px;">
            <p><strong>Temporary Password:</strong> <span style="font-size: 18px; font-weight: bold; color: #F35F37;">${tempPassword}</span></p>
          </div>
          <p><strong>Important:</strong> Please log in and change your password immediately!</p>
          <p>Best regards,<br>The VOLGA Team</p>
        </div>
      </body>
      </html>
    `;
    
    try {
      await sendEmail({
        to: userEmail,
        subject: "Your Temporary Password",
        html: htmlContent,
        text: `Your password reset request has been processed! Your temporary password is: ${tempPassword}\nPlease log in and change your password immediately.`,
      });
    } catch (emailError) {
      console.error("Failed to send temp password email:", emailError);
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.status(201).json({ message: "Temporary password sent to your email" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPasswordChangeRequests = async (req, res) => {
  try {
    const requests = await PasswordChangeRequest.find().populate("processedBy", "name email");
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewPasswordChangeRequest = async (req, res) => {
  console.log('reviewPasswordChangeRequest called with params:', req.params);
  console.log('reviewPasswordChangeRequest called with body:', req.body);
  try {
    const { status } = req.body;
    const request = await PasswordChangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    request.processedBy = req.user.id;
    request.processedAt = new Date();

    if (status === "approved") {
      // Generate temporary password
      const tempPassword = crypto.randomBytes(8).toString("hex");
      request.tempPassword = tempPassword;

      // Update user's password
      const user = await Admin.findOne({ email: request.userEmail });
      if (user) {
        user.password = tempPassword;
        await user.save();

        // Send email to user with temp password
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #013350;">Password Reset Approved</h2>
              <p>Hello ${request.userName},</p>
              <p>Your password change request has been approved! Here's your temporary password:</p>
              <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px;">
                <p><strong>Temporary Password:</strong> <span style="font-size: 18px; font-weight: bold; color: #F35F37;">${tempPassword}</span></p>
              </div>
              <p><strong>Important:</strong> Please log in and change your password immediately!</p>
              <p>Best regards,<br>The VOLGA Team</p>
            </div>
          </body>
          </html>
        `;
        
        try {
          await sendEmail({
            to: user.email,
            subject: "Your Password Change Request Has Been Approved",
            html: htmlContent,
            text: `Your password change request has been approved! Your temporary password is: ${tempPassword}\nPlease log in and change your password immediately.`,
          });
        } catch (emailError) {
          console.error("Failed to send temp password email:", emailError);
        }
      }
    } else if (status === "rejected") {
      // Send rejection email to user
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc3545;">Password Reset Request Rejected</h2>
            <p>Hello ${request.userName},</p>
            <p>Your password change request has been rejected. Please contact an admin for more information.</p>
            <p>Best regards,<br>The VOLGA Team</p>
          </div>
        </body>
        </html>
      `;
      
      try {
        await sendEmail({
          to: request.userEmail,
          subject: "Your Password Change Request Has Been Rejected",
          html: htmlContent,
          text: "Your password change request has been rejected. Please contact an admin for more information.",
        });
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }
    }

    await request.save();
    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
