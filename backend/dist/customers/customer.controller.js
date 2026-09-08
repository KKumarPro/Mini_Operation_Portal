"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFollowUpController = exports.updateCustomerController = exports.getCustomerController = exports.getCustomersController = exports.createCustomerController = void 0;
const customer_service_1 = require("./customer.service");
const customer_validator_1 = require("./customer.validator");
const createCustomerController = async (req, res, next) => {
    try {
        const data = customer_validator_1.createCustomerSchema.parse(req.body);
        const customer = await (0, customer_service_1.createCustomer)(data);
        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomerController = createCustomerController;
const getCustomersController = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const search = typeof req.query.search === "string"
            ? req.query.search.trim()
            : undefined;
        const result = await (0, customer_service_1.getCustomers)(page, limit, search);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomersController = getCustomersController;
const getCustomerController = async (req, res, next) => {
    try {
        const customer = await (0, customer_service_1.getCustomerById)(String(req.params.id));
        res.status(200).json({
            success: true,
            data: customer,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerController = getCustomerController;
const updateCustomerController = async (req, res, next) => {
    try {
        const data = customer_validator_1.updateCustomerSchema.parse(req.body);
        const customer = await (0, customer_service_1.updateCustomer)(String(req.params.id), data);
        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomerController = updateCustomerController;
const addFollowUpController = async (req, res, next) => {
    try {
        const data = customer_validator_1.followUpSchema.parse(req.body);
        const customer = await (0, customer_service_1.addFollowUp)(String(req.params.id), data.notes, data.followUpDate);
        res.status(200).json({
            success: true,
            message: "Follow-up added successfully",
            data: customer,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addFollowUpController = addFollowUpController;
