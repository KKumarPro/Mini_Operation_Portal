"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = void 0;
const auth_service_1 = require("./auth.service");
const auth_validator_1 = require("./auth.validator");
const loginController = async (req, res, next) => {
    try {
        const validatedData = auth_validator_1.loginSchema.parse(req.body);
        const result = await (0, auth_service_1.login)(validatedData);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.loginController = loginController;
