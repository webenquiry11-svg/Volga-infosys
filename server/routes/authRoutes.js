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
  reviewPasswordChangeRequest
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/role-applications", createRoleApplication);
router.post("/password-change-requests", createPasswordChangeRequest);

// Protected routes
router.use(protect);
router.get("/me", getMe);
router.patch("/me", updateMe);
router.post("/change-password", changePassword);
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

export default router;
