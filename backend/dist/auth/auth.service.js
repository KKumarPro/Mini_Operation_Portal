"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const AppError_1 = require("../utils/AppError");
const login = async (data) => {
    const user = await database_1.default.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (!user) {
        throw new AppError_1.AppError("Invalid email or password", 401);
    }
    const passwordMatches = await bcryptjs_1.default.compare(data.password, user.password);
    if (!passwordMatches) {
        throw new AppError_1.AppError("Invalid email or password", 401);
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new AppError_1.AppError("JWT_SECRET is not configured", 500);
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.role,
    }, jwtSecret, {
        expiresIn: "1d",
    });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};
exports.login = login;
