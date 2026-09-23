import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

const SALT_ROUNDS = 10;

export const register = async (req, res, next) => {
  try {
    //get req values
    const { email, password } = req.body;

    //validation check
    if (!email || !email.includes("@")) {
      return sendError(res, "Valid Email is require for registration", 400);
    }
    if (!password || password.length < 8) {
      return sendError(res, "Valid Password is require for registration", 400);
    }
    //check if user exist or not in system
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [
      email,
    ]);
    //console.log(existing);
    if (existing.rows.length > 0) {
      return sendError(res, "An account with this email already exists", 409);
    }

    //password hash
    const hashpassword = await bcrypt.hash(password, SALT_ROUNDS);

    //insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at`,
      [email, hashpassword],
    );
    const user = result.rows[0];

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return sendSuccess(
      res,
      { token, user: { id: user.id, email: user.email } },
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //validation check
    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    //check for user using email
    const result = await pool.query("Select * from users where email=$1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return sendError(res, "provide right credentials", 401);
    }

    //password checking
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return sendError(res, "provide right credentials", 401);
    }

    //assign token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return sendSuccess(res, {
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};
