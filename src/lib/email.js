import nodemailer from 'nodemailer'

// Enable debug mode if in development
const debug = process.env.NODE_ENV !== 'production'

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false,
    // Use modern TLS versions
    minVersion: 'TLSv1.2'
  },
  debug: debug,
  logger: debug
})

// Verify connection configuration if in development
if (debug) {
  transporter.verify(function(error, success) {
    if (error) {
      console.log('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take our messages');
    }
  });
}

/**
 * Send an email verification link to a user
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} verificationUrl - Verification URL with token
 * @returns {Promise} - Nodemailer send response
 */
export async function sendVerificationEmail(to, name, verificationUrl) {
  const siteName = process.env.SITE_NAME || 'SST Hackers'
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
  
  return transporter.sendMail({
    from: `"${siteName}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Verify your email for ${siteName}`,
    text: `Hello ${name},\n\nPlease verify your email address by clicking on the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account on ${siteName}, please ignore this email.\n\nThank you,\n${siteName} Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email for ${siteName}</h2>
        <p>Hello ${name},</p>
        <p>Please verify your email address by clicking on the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account on ${siteName}, please ignore this email.</p>
        <p>Thank you,<br>${siteName} Team</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">This is an automated email. Please do not reply to this message.</p>
        <p style="font-size: 12px; color: #666;">
          <a href="${siteUrl}" style="color: #4F46E5; text-decoration: none;">${siteName}</a>
        </p>
      </div>
    `
  })
}

/**
 * Send a password reset link to a user
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} resetUrl - Password reset URL with token
 * @returns {Promise} - Nodemailer send response
 */
export async function sendPasswordResetEmail(to, name, resetUrl) {
  const siteName = process.env.SITE_NAME || 'SST Hackers'
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
  
  return transporter.sendMail({
    from: `"${siteName}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Reset your password for ${siteName}`,
    text: `Hello ${name},\n\nYou requested to reset your password. Please click on the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not request a password reset, please ignore this email.\n\nThank you,\n${siteName} Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password for ${siteName}</h2>
        <p>Hello ${name},</p>
        <p>You requested to reset your password. Please click on the button below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thank you,<br>${siteName} Team</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">This is an automated email. Please do not reply to this message.</p>
        <p style="font-size: 12px; color: #666;">
          <a href="${siteUrl}" style="color: #4F46E5; text-decoration: none;">${siteName}</a>
        </p>
      </div>
    `
  })
} 