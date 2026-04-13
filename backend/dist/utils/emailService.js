"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    async sendOTP(email, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify your email - Interview Prep",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your OTP for signing up is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `,
        };
        await this.transporter.sendMail(mailOptions);
    }
}
exports.default = new EmailService();
