import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1,$2,$3) RETURNING id, username, email, created_at`,
      [username, email, hash]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.detail || e.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
  const user = rows[0];
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
};

export const me = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, username, email, created_at FROM users WHERE id=$1`,
    [req.user.id]
  );
  res.json(rows[0]);
};
