"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFollowUp = exports.updateCustomer = exports.getCustomerById = exports.getCustomers = exports.createCustomer = void 0;
const database_1 = __importDefault(require("../config/database"));
const AppError_1 = require("../utils/AppError");
const createCustomer = async (data) => {
    return database_1.default.customer.create({
        data: {
            ...data,
            followUpDate: data.followUpDate
                ? new Date(data.followUpDate)
                : undefined,
        },
    });
};
exports.createCustomer = createCustomer;
const getCustomers = async (page, limit, search) => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                {
                    businessName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                { mobile: { contains: search } },
                { email: { contains: search, mode: "insensitive" } },
            ],
        }
        : {};
    const [customers, total] = await Promise.all([
        database_1.default.customer.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.default.customer.count({ where }),
    ]);
    return {
        customers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getCustomers = getCustomers;
const getCustomerById = async (id) => {
    const customer = await database_1.default.customer.findUnique({
        where: { id },
        include: {
            challans: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
    if (!customer) {
        throw new AppError_1.AppError("Customer not found", 404);
    }
    return customer;
};
exports.getCustomerById = getCustomerById;
const updateCustomer = async (id, data) => {
    await (0, exports.getCustomerById)(id);
    return database_1.default.customer.update({
        where: { id },
        data: {
            ...data,
            followUpDate: data.followUpDate
                ? new Date(data.followUpDate)
                : undefined,
        },
    });
};
exports.updateCustomer = updateCustomer;
const addFollowUp = async (id, notes, followUpDate) => {
    const customer = await (0, exports.getCustomerById)(id);
    const updatedNotes = customer.notes
        ? `${customer.notes}\n${new Date().toISOString()} - ${notes}`
        : `${new Date().toISOString()} - ${notes}`;
    return database_1.default.customer.update({
        where: { id },
        data: {
            notes: updatedNotes,
            followUpDate: followUpDate
                ? new Date(followUpDate)
                : customer.followUpDate,
        },
    });
};
exports.addFollowUp = addFollowUp;
