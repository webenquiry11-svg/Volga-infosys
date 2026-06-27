import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin.js";
import RoleApplication from "../models/RoleApplication.js";
import PasswordChangeRequest from "../models/PasswordChangeRequest.js";
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
    // Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    
    // Create user with temp password
    const admin = await Admin.create({
      ...req.body,
      password: tempPassword
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
        await user.save();
        
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

    // Check if there's already a pending request for this email
    const existingPending = await PasswordChangeRequest.findOne({
      userEmail,
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({ message: "You already have a pending password change request" });
    }

    const request = await PasswordChangeRequest.create({ userEmail, userName });

    // Send email notification to all admins
    const admins = await Admin.find({ role: "admin" });
    const adminEmails = admins.map(admin => admin.email);

    if (adminEmails.length > 0) {
      try {
        await sendEmail({
          to: adminEmails,
          subject: "New Password Change Request",
          text: `A new password change request has been submitted by ${userName} (${userEmail}). Please review it in the admin dashboard.`,
        });
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
      }
    }

    res.status(201).json({ request });
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
