import jwt from "jsonwebtoken";
import { sendError } from "../utils/responseHelper.js";

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "No token provided, authorization denied", 401);
    }
    const token = authHeader.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decode.userId;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};
