"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockMovementsController = exports.createStockMovementController = exports.updateProductController = exports.getProductController = exports.getProductsController = exports.createProductController = void 0;
const product_service_1 = require("./product.service");
const product_validator_1 = require("./product.validator");
const createProductController = async (req, res, next) => {
    try {
        const data = product_validator_1.createProductSchema.parse(req.body);
        const product = await (0, product_service_1.createProduct)(data);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProductController = createProductController;
const getProductsController = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const search = typeof req.query.search === "string"
            ? req.query.search.trim()
            : undefined;
        const result = await (0, product_service_1.getProducts)(page, limit, search);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductsController = getProductsController;
const getProductController = async (req, res, next) => {
    try {
        const product = await (0, product_service_1.getProductById)(String(req.params.id));
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductController = getProductController;
const updateProductController = async (req, res, next) => {
    try {
        const data = product_validator_1.updateProductSchema.parse(req.body);
        const product = await (0, product_service_1.updateProduct)(String(req.params.id), data);
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProductController = updateProductController;
const createStockMovementController = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new Error("Authentication required"));
            return;
        }
        const data = product_validator_1.stockMovementSchema.parse(req.body);
        const result = await (0, product_service_1.createStockMovement)(String(req.params.id), data.quantity, data.type, data.reason, req.user.userId);
        res.status(201).json({
            success: true,
            message: "Stock movement recorded successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createStockMovementController = createStockMovementController;
const getStockMovementsController = async (req, res, next) => {
    try {
        const movements = await (0, product_service_1.getStockMovements)(String(req.params.id));
        res.status(200).json({
            success: true,
            data: movements,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStockMovementsController = getStockMovementsController;
