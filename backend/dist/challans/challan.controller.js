"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChallanStatusController = exports.getChallanController = exports.getChallansController = exports.createChallanController = void 0;
const challan_service_1 = require("./challan.service");
const challan_validator_1 = require("./challan.validator");
const createChallanController = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new Error("Authentication required"));
            return;
        }
        const data = challan_validator_1.createChallanSchema.parse(req.body);
        const challan = await (0, challan_service_1.createChallan)(data.customerId, data.status, data.items, req.user.userId);
        res.status(201).json({
            success: true,
            message: `Challan ${data.status.toLowerCase()} successfully`,
            data: challan,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createChallanController = createChallanController;
const getChallansController = async (_req, res, next) => {
    try {
        const challans = await (0, challan_service_1.getChallans)();
        res.status(200).json({
            success: true,
            data: challans,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChallansController = getChallansController;
const getChallanController = async (req, res, next) => {
    try {
        const challan = await (0, challan_service_1.getChallanById)(String(req.params.id));
        res.status(200).json({
            success: true,
            data: challan,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChallanController = getChallanController;
const updateChallanStatusController = async (req, res, next) => {
    try {
        const data = challan_validator_1.updateChallanStatusSchema.parse(req.body);
        const challan = await (0, challan_service_1.updateChallanStatus)(String(req.params.id), data.status);
        res.status(200).json({
            success: true,
            message: `Challan ${data.status.toLowerCase()} successfully`,
            data: challan,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateChallanStatusController = updateChallanStatusController;
