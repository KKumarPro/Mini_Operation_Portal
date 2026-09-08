"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChallanStatus = exports.getChallanById = exports.getChallans = exports.createChallan = void 0;
const database_1 = __importDefault(require("../config/database"));
const AppError_1 = require("../utils/AppError");
const generateChallanNumber = () => {
    const timestamp = new Date()
        .toISOString()
        .replace(/\D/g, "")
        .slice(0, 14);
    const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
    return `SC-${timestamp}-${random}`;
};
const createChallan = async (customerId, status, items, createdBy) => {
    const customer = await database_1.default.customer.findUnique({
        where: { id: customerId },
    });
    if (!customer) {
        throw new AppError_1.AppError("Customer not found", 404);
    }
    const productIds = items.map((item) => item.productId);
    const products = await database_1.default.product.findMany({
        where: {
            id: { in: productIds },
        },
    });
    if (products.length !== productIds.length) {
        throw new AppError_1.AppError("One or more products were not found", 404);
    }
    const productMap = new Map(products.map((product) => [product.id, product]));
    for (const item of items) {
        const product = productMap.get(item.productId);
        if (status === "CONFIRMED" &&
            product.currentStock < item.quantity) {
            throw new AppError_1.AppError(`Insufficient stock for ${product.name}. Available stock: ${product.currentStock}`, 400);
        }
    }
    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
    return database_1.default.$transaction(async (tx) => {
        const challan = await tx.challan.create({
            data: {
                challanNumber: generateChallanNumber(),
                customerId,
                totalQuantity,
                status,
                createdBy,
            },
        });
        for (const item of items) {
            const product = productMap.get(item.productId);
            await tx.challanItem.create({
                data: {
                    challanId: challan.id,
                    productId: product.id,
                    productName: product.name,
                    sku: product.sku,
                    unitPrice: product.unitPrice,
                    quantity: item.quantity,
                },
            });
            if (status === "CONFIRMED") {
                const updated = await tx.product.updateMany({
                    where: {
                        id: product.id,
                        currentStock: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        currentStock: {
                            decrement: item.quantity,
                        },
                    },
                });
                if (updated.count !== 1) {
                    throw new AppError_1.AppError(`Insufficient stock for ${product.name}`, 400);
                }
                await tx.stockMovement.create({
                    data: {
                        productId: product.id,
                        quantity: item.quantity,
                        type: "OUT",
                        reason: `Sales Challan ${challan.challanNumber}`,
                        createdBy,
                    },
                });
            }
        }
        return tx.challan.findUnique({
            where: { id: challan.id },
            include: {
                customer: true,
                items: true,
            },
        });
    });
};
exports.createChallan = createChallan;
const getChallans = async () => {
    return database_1.default.challan.findMany({
        include: {
            customer: true,
            items: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getChallans = getChallans;
const getChallanById = async (id) => {
    const challan = await database_1.default.challan.findUnique({
        where: { id },
        include: {
            customer: true,
            items: true,
        },
    });
    if (!challan) {
        throw new AppError_1.AppError("Challan not found", 404);
    }
    return challan;
};
exports.getChallanById = getChallanById;
const updateChallanStatus = async (id, status) => {
    const challan = await (0, exports.getChallanById)(id);
    if (challan.status !== "DRAFT") {
        throw new AppError_1.AppError("Only draft challans can be confirmed or cancelled", 400);
    }
    if (status === "CANCELLED") {
        return database_1.default.challan.update({
            where: { id },
            data: { status: "CANCELLED" },
            include: {
                customer: true,
                items: true,
            },
        });
    }
    return database_1.default.$transaction(async (tx) => {
        for (const item of challan.items) {
            const updated = await tx.product.updateMany({
                where: {
                    id: item.productId,
                    currentStock: {
                        gte: item.quantity,
                    },
                },
                data: {
                    currentStock: {
                        decrement: item.quantity,
                    },
                },
            });
            if (updated.count !== 1) {
                throw new AppError_1.AppError(`Insufficient stock for ${item.productName}`, 400);
            }
            await tx.stockMovement.create({
                data: {
                    productId: item.productId,
                    quantity: item.quantity,
                    type: "OUT",
                    reason: `Sales Challan ${challan.challanNumber}`,
                    createdBy: challan.createdBy,
                },
            });
        }
        return tx.challan.update({
            where: { id },
            data: {
                status: "CONFIRMED",
            },
            include: {
                customer: true,
                items: true,
            },
        });
    });
};
exports.updateChallanStatus = updateChallanStatus;
