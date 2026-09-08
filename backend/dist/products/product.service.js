"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockMovements = exports.createStockMovement = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const database_1 = __importDefault(require("../config/database"));
const AppError_1 = require("../utils/AppError");
const createProduct = async (data) => {
    const existingProduct = await database_1.default.product.findUnique({
        where: {
            sku: data.sku,
        },
    });
    if (existingProduct) {
        throw new AppError_1.AppError("SKU already exists", 409);
    }
    const product = await database_1.default.product.create({
        data: {
            name: data.name,
            sku: data.sku,
            category: data.category,
            unitPrice: data.unitPrice.toString(),
            currentStock: data.currentStock,
            minStockAlert: data.minStockAlert,
            warehouse: data.warehouse,
        },
    });
    return product;
};
exports.createProduct = createProduct;
const getProducts = async (page, limit, search) => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    sku: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    category: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        }
        : {};
    const [products, total] = await Promise.all([
        database_1.default.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),
        database_1.default.product.count({ where }),
    ]);
    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getProducts = getProducts;
const getProductById = async (id) => {
    const product = await database_1.default.product.findUnique({
        where: { id },
    });
    if (!product) {
        throw new AppError_1.AppError("Product not found", 404);
    }
    return product;
};
exports.getProductById = getProductById;
const updateProduct = async (id, data) => {
    await (0, exports.getProductById)(id);
    if (data.sku) {
        const existingProduct = await database_1.default.product.findFirst({
            where: {
                sku: data.sku,
                NOT: {
                    id,
                },
            },
        });
        if (existingProduct) {
            throw new AppError_1.AppError("SKU already exists", 409);
        }
    }
    return database_1.default.product.update({
        where: { id },
        data: {
            ...data,
            unitPrice: data.unitPrice !== undefined
                ? data.unitPrice.toString()
                : undefined,
        },
    });
};
exports.updateProduct = updateProduct;
const createStockMovement = async (productId, quantity, type, reason, createdBy) => {
    const product = await (0, exports.getProductById)(productId);
    if (type === "OUT" && product.currentStock < quantity) {
        throw new AppError_1.AppError(`Insufficient stock. Available stock: ${product.currentStock}`, 400);
    }
    const newStock = type === "IN"
        ? product.currentStock + quantity
        : product.currentStock - quantity;
    return database_1.default.$transaction(async (tx) => {
        const updatedProduct = await tx.product.update({
            where: { id: productId },
            data: {
                currentStock: newStock,
            },
        });
        const movement = await tx.stockMovement.create({
            data: {
                productId,
                quantity,
                type,
                reason,
                createdBy,
            },
        });
        return {
            product: updatedProduct,
            movement,
        };
    });
};
exports.createStockMovement = createStockMovement;
const getStockMovements = async (productId) => {
    await (0, exports.getProductById)(productId);
    return database_1.default.stockMovement.findMany({
        where: {
            productId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getStockMovements = getStockMovements;
