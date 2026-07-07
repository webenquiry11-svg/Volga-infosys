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
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
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

    // Build session metadata
    const deviceName = req.body.deviceName || req.headers["x-device-name"] || "Unknown device";
    const userAgent = req.get("user-agent") || "";
    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "";
    const ABSOLUTE_TTL_MS = parseInt(process.env.ABSOLUTE_TTL_MS || String(7 * 24 * 60 * 60 * 1000));
    const expiresAt = new Date(Date.now() + ABSOLUTE_TTL_MS);

    // Optional single-session enforcement
    if (process.env.SINGLE_SESSION === "true") {
      // Revoke existing sessions for this user (better UX than rejecting)
      await Session.deleteMany({ userId: admin._id });
    }

    // Create a session with metadata
    await Session.create({
      userId: admin._id,
      token,
      ip,
      userAgent,
      deviceName,
      lastActive: new Date(),
      expiresAt
    });

    res.json({ 
      token, 
      user: { 
        id: admin._id, 
        name: admin.name || "Admin User",
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
    const user = await Admin.findById(req.user.id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    // Delete all sessions except current one so other devices are logged out
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

// List active sessions for current user
export const listSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).select("_id ip userAgent deviceName lastActive expiresAt createdAt").sort({ lastActive: -1 });
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Revoke a session (by id) or revoke all if body { all: true }
export const revokeSession = async (req, res) => {
  try {
    const { sessionId, all } = req.body;
    if (all) {
      await Session.deleteMany({ userId: req.user.id });
      return res.json({ message: 'All sessions revoked' });
    }
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });
    await Session.deleteOne({ _id: sessionId, userId: req.user.id });
    res.json({ message: 'Session revoked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Extend session (refresh lastActive)
export const extendSession = async (req, res) => {
  try {
    const session = await Session.findOne({ token: req.headers.authorization?.split(' ')[1], userId: req.user.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.lastActive = new Date();
    await session.save();
    res.json({ message: 'Session extended' });
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
  // Always return the same response to prevent user enumeration
  const genericResponse = { message: "If that email exists, a reset link has been sent" };
  try {
    const user = await Admin.findOne({ email: req.body.email });
    if (!user) return res.json(genericResponse);
    
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    const resetUrl = `${req.protocol}://${req.get("host")}/admin/index.html?reset=${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Please go to: ${resetUrl}`
      });
    } catch (emailError) {
      console.error("Error sending reset email:", emailError);
    }
    
    res.json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
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
    const user = await Admin.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) {
      user.role = role;
      user.permissions = permissions || ROLE_PERMISSIONS[role];
    } else if (permissions) {
      user.permissions = permissions;
    }
    // Use save() so pre-save bcrypt hook runs on password change
    if (password) user.password = password;

    await user.save();

    // Log user out of all devices after update
    await Session.deleteMany({ userId: req.params.id });

    const updated = await Admin.findById(req.params.id).select("-password");
    res.json({ user: updated });
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
    const { applicantName, applicantEmail, requestedRole, reason } = req.body;
    if (requestedRole === 'admin') {
      return res.status(400).json({ message: "Cannot request admin role through this form" });
    }
    const application = await RoleApplication.create({ applicantName, applicantEmail, requestedRole, reason });
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

// Password Change Requests — requires authentication
export const createPasswordChangeRequest = async (req, res) => {
  try {
    const user = req.user;
    const tempPassword = crypto.randomBytes(8).toString("hex");

    user.password = tempPassword;
    await user.save();

    // Store record without plaintext password
    await PasswordChangeRequest.create({
      userEmail: user.email,
      userName: user.name,
      status: "approved"
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #013350;">Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>Your password has been reset. Here is your temporary password:</p>
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
        subject: "Your Temporary Password",
        html: htmlContent,
        text: `Your temporary password is: ${tempPassword}. Please change it immediately after logging in.`,
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
