import express from "express";
import { 
  register, 
  login, 
  getMe, 
  getAllUsers, 
  updateUser, 
  createUser, 
  deleteUser, 
  updateMe, 
  changePassword, 
  forgotPassword, 
  resetPassword, 
  createRoleApplication, 
  getRoleApplications, 
  reviewRoleApplication,
  uploadProfilePicture,
  createPasswordChangeRequest,
  getPasswordChangeRequests,
  reviewPasswordChangeRequest,
  logout,
  listSessions,
  revokeSession,
  extendSession,
  getPermissions
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many requests, try again later." }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts, try again later." }
});

// Public routes
router.post("/login", loginLimiter, login);
router.post("/forgot-password", publicLimiter, forgotPassword);
router.post("/reset-password/:token", publicLimiter, resetPassword);
router.post("/role-applications", publicLimiter, createRoleApplication);

// Protected routes
router.use(protect);
router.get("/me", getMe);
router.patch("/me", updateMe);
router.post("/change-password", changePassword);
router.post("/logout", logout);
router.post("/password-change-requests", createPasswordChangeRequest);
// Session management
router.get('/sessions', listSessions);
router.post('/sessions/revoke', revokeSession);
router.post('/sessions/extend', extendSession);
router.post("/upload-profile-picture", upload.single("profilePicture"), uploadProfilePicture);

// Admin-only routes
router.get("/users", authorize("admin"), getAllUsers);
router.post("/users", authorize("admin"), createUser);
router.patch("/users/:id", authorize("admin"), updateUser);
router.delete("/users/:id", authorize("admin"), deleteUser);
router.get("/role-applications", authorize("admin"), getRoleApplications);
router.patch("/role-applications/:id", authorize("admin"), reviewRoleApplication);
router.get("/password-change-requests", authorize("admin"), getPasswordChangeRequests);
router.patch("/password-change-requests/:id", authorize("admin"), reviewPasswordChangeRequest);
router.get("/permissions", authorize("admin"), getPermissions);

export default router;
