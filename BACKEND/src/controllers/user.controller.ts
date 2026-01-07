import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2/promise";
import { dbQuery } from "../services/db.service";
import { AuthRequest } from "../middlewares/firebaseAuth.middleware";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, role, contact_info, email, phone } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    const result = await dbQuery<ResultSetHeader>(
      "INSERT INTO users (name, email, phone, role, contact_info) VALUES (?, ?, ?, ?, ?)",
      [name, email || null, phone || null, role, contact_info || null]
    );

    return res.status(201).json({
      message: "User created successfully",
      userId: result.insertId
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create user",
      error: error.message
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rows = await dbQuery<any[]>(
      "SELECT id, name, role, contact_info, created_at FROM users WHERE id = ?",
      [id]
    );
    const row = rows[0];

    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(row);
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch user",
      error: error.message
    });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rows = await dbQuery<any[]>(
      "SELECT id, name, email, role, contact_info, created_at FROM users WHERE email = ?",
      [req.user.email]
    );
    const row = rows[0];

    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(row);
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch user",
      error: error.message
    });
  }
};
