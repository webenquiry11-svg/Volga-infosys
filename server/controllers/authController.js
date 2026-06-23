import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

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

  res.json({ token: signToken(admin._id) });
};
