"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setRefreshTokenCookie = void 0;
const setRefreshTokenCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};
exports.setRefreshTokenCookie = setRefreshTokenCookie;
const clearAuthCookies = (res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
};
exports.clearAuthCookies = clearAuthCookies;
