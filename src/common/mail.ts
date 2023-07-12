import { createTransport } from "nodemailer";

export const transporter = createTransport({
  name: "hostgator",
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  service: process.env.EMAIL_HOST,
  secure: Number(process.env.EMAIL_PORT) === 465,
  tls: {
    rejectUnauthorized: false,
  },
  requireTLS: true
});