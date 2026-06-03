"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MaintenanceSchema = new mongoose_1.Schema({
    extinguisherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Extinguisher',
        required: [true, 'Extinguisher ID is required']
    },
    inspectorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Inspector ID is required']
    },
    actionsTaken: {
        type: String,
        required: [true, 'Actions taken is required'],
        trim: true
    },
    dateOfAction: {
        type: Date,
        required: [true, 'Date of action is required'],
        default: Date.now
    },
    conditionsNoted: {
        type: String,
        required: [true, 'Conditions noted is required'],
        trim: true
    }
}, {
    timestamps: true
});
// Index for faster queries
MaintenanceSchema.index({ extinguisherId: 1 });
MaintenanceSchema.index({ inspectorId: 1 });
MaintenanceSchema.index({ dateOfAction: 1 });
const Maintenance = mongoose_1.default.model('Maintenance', MaintenanceSchema);
exports.default = Maintenance;
//# sourceMappingURL=Maintenance.js.map