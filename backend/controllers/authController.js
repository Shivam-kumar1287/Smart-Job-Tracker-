import db from "../models/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json("All fields are required");
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
      [name, email, hash, role || "user"]
    );

    res.json("Registered successfully");
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json("Email already exists");
    }
    res.status(500).json("Registration failed");
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing fields - email:', email, 'password:', !!password);
      return res.status(400).json("All fields are required");
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (!rows.length) return res.status(404).json("User not found");

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(400).json("Wrong password");

    const token = jwt.sign(
      { id: rows[0].id, role: rows[0].role },
      process.env.JWT_SECRET
    );

    res.json({ 
      token, 
      user: {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: rows[0].role,
        profile_image: rows[0].profile_image
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json("Login failed");
  }
};

export const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, phone, location, bio, skills, social_links, profile_image, created_at FROM users WHERE id=?",
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json("User not found");
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json("Error fetching profile");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, skills, social_links } = req.body;
    
    await db.query(
      "UPDATE users SET name=?, phone=?, location=?, bio=?, skills=?, social_links=? WHERE id=?",
      [name, phone, location, bio, skills, JSON.stringify(social_links), req.user.id]
    );
    
    res.json("Profile updated successfully");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json("Error updating profile");
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json("No image uploaded");
    }

    const imagePath = req.file.path;
    
    await db.query(
      "UPDATE users SET profile_image=? WHERE id=?",
      [imagePath, req.user.id]
    );

    res.json({ message: "Profile image updated successfully", imagePath });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json("Error updating profile image");
  }
};