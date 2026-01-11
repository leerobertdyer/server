import nodemailer from 'nodemailer';
import 'dotenv/config';

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Create the transporter using Gmail SMTP
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    }
});

// Verify the connection configuration
transporter.verify(function(error) {
    if (error) {
        console.error('Gmail SMTP connection error:', error);
    }
});

export { GMAIL_USER };

