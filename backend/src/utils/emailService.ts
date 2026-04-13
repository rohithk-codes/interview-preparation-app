import nodemailer from "nodemailer";

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOTP(email: string, otp: string) {
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

export default new EmailService();
