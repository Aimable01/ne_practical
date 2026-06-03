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
exports.ExtinguisherStatus = exports.ExtinguisherSize = exports.ExtinguisherType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ExtinguisherType;
(function (ExtinguisherType) {
    ExtinguisherType["WATER"] = "WATER";
    ExtinguisherType["CO2"] = "CO2";
    ExtinguisherType["FOAM"] = "FOAM";
    ExtinguisherType["DRY_CHEMICAL"] = "DRY_CHEMICAL";
})(ExtinguisherType || (exports.ExtinguisherType = ExtinguisherType = {}));
var ExtinguisherSize;
(function (ExtinguisherSize) {
    ExtinguisherSize["SIZE_2_5"] = "2.5lbs";
    ExtinguisherSize["SIZE_5"] = "5lbs";
    ExtinguisherSize["SIZE_9"] = "9lbs";
    ExtinguisherSize["SIZE_12"] = "12lbs";
})(ExtinguisherSize || (exports.ExtinguisherSize = ExtinguisherSize = {}));
var ExtinguisherStatus;
(function (ExtinguisherStatus) {
    ExtinguisherStatus["ACTIVE"] = "ACTIVE";
    ExtinguisherStatus["EXPIRED"] = "EXPIRED";
    ExtinguisherStatus["MAINTENANCE_REQUIRED"] = "MAINTENANCE_REQUIRED";
    ExtinguisherStatus["OUT_OF_SERVICE"] = "OUT_OF_SERVICE";
})(ExtinguisherStatus || (exports.ExtinguisherStatus = ExtinguisherStatus = {}));
const ExtinguisherSchema = new mongoose_1.Schema({
    serialNumber: {
        type: String,
        required: [true, 'Serial number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    type: {
        type: String,
        enum: {
            values: [ExtinguisherType.WATER, ExtinguisherType.CO2, ExtinguisherType.FOAM, ExtinguisherType.DRY_CHEMICAL],
            message: '{VALUE} is not a valid extinguisher type'
        },
        required: [true, 'Type is required']
    },
    size: {
        type: String,
        enum: {
            values: [ExtinguisherSize.SIZE_2_5, ExtinguisherSize.SIZE_5, ExtinguisherSize.SIZE_9, ExtinguisherSize.SIZE_12],
            message: '{VALUE} is not a valid extinguisher size'
        },
        required: [true, 'Size is required']
    },
    installationDate: {
        type: Date,
        required: [true, 'Installation date is required']
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    status: {
        type: String,
        enum: {
            values: [ExtinguisherStatus.ACTIVE, ExtinguisherStatus.EXPIRED, ExtinguisherStatus.MAINTENANCE_REQUIRED, ExtinguisherStatus.OUT_OF_SERVICE],
            message: '{VALUE} is not a valid status'
        },
        default: ExtinguisherStatus.ACTIVE
    }
}, {
    timestamps: true
});
// Index for faster queries
ExtinguisherSchema.index({ serialNumber: 1 });
ExtinguisherSchema.index({ status: 1 });
ExtinguisherSchema.index({ expiryDate: 1 });
const Extinguisher = mongoose_1.default.model('Extinguisher', ExtinguisherSchema);
exports.default = Extinguisher;
//# sourceMappingURL=Extinguisher.js.map