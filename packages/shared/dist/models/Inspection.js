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
exports.InspectionStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var InspectionStatus;
(function (InspectionStatus) {
    InspectionStatus["SCHEDULED"] = "SCHEDULED";
    InspectionStatus["COMPLETED"] = "COMPLETED";
    InspectionStatus["CANCELLED"] = "CANCELLED";
    InspectionStatus["FAILED"] = "FAILED";
})(InspectionStatus || (exports.InspectionStatus = InspectionStatus = {}));
const InspectionSchema = new mongoose_1.Schema({
    extinguisherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Extinguisher',
        required: [true, 'Extinguisher ID is required']
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },
    scheduledTime: {
        type: String,
        required: [true, 'Scheduled time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
    },
    inspectorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Inspector ID is required']
    },
    status: {
        type: String,
        enum: {
            values: [InspectionStatus.SCHEDULED, InspectionStatus.COMPLETED, InspectionStatus.CANCELLED, InspectionStatus.FAILED],
            message: '{VALUE} is not a valid inspection status'
        },
        default: InspectionStatus.SCHEDULED
    },
    result: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    notified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Index for faster queries
InspectionSchema.index({ extinguisherId: 1 });
InspectionSchema.index({ inspectorId: 1 });
InspectionSchema.index({ scheduledDate: 1 });
InspectionSchema.index({ status: 1 });
const Inspection = mongoose_1.default.model('Inspection', InspectionSchema);
exports.default = Inspection;
//# sourceMappingURL=Inspection.js.map