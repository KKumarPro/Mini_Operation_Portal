"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const authenticate = (req, _res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        next(new AppError_1.AppError("Authentication token is required", 401));
        return;
    }
    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
        next(new AppError_1.AppError("Invalid authorization format", 401));
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        next(new AppError_1.AppError("JWT_SECRET is not configured", 500));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (typeof decoded === "string" ||
            !("userId" in decoded) ||
            !("role" in decoded)) {
            next(new AppError_1.AppError("Invalid authentication token", 401));
            return;
        }
        const payload = decoded;
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        next();
    }
    catch {
        next(new AppError_1.AppError("Invalid or expired authentication token", 401));
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(new AppError_1.AppError("Authentication required", 401));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            next(new AppError_1.AppError("You do not have permission to access this resource", 403));
            return;
        }
        next();
    };
};
exports.authorize = authorize;
