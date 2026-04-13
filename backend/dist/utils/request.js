"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleValue = void 0;
const getSingleValue = (value) => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
};
exports.getSingleValue = getSingleValue;
