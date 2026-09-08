"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/login", auth_controller_1.loginController);
// Temporary development-only protected route
router.get("/test-sales-access", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("SALES"), (req, res) => {
    res.status(200).json({
        success: true,
        message: "Sales authorization successful",
        user: req.user,
    });
});
exports.default = router;
