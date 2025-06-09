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
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          
          .email-header {
            background: linear-gradient(to right, #4F46E5, #6366F1);
            padding: 24px;
            text-align: center;
          }
          
          .email-header img {
            width: 48px;
            height: 48px;
            border-radius: 8px;
          }
          
          .email-header h1 {
            color: #ffffff;
            margin: 16px 0 0;
            font-size: 24px;
            font-weight: 700;
          }
          
          .email-body {
            padding: 32px 24px;
            background-color: #ffffff;
          }
          
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #111827;
          }
          
          .message {
            font-size: 16px;
            margin-bottom: 24px;
            color: #4B5563;
          }
          
          .button {
            display: inline-block;
            background-color: #4F46E5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: background-color 0.2s;
          }
          
          .button:hover {
            background-color: #4338CA;
          }
          
          .link-container {
            margin: 24px 0;
            padding: 12px;
            background-color: #F3F4F6;
            border-radius: 6px;
            word-break: break-all;
          }
          
          .link {
            color: #4F46E5;
            font-size: 14px;
          }
          
          .expiry {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 24px;
          }
          
          .email-footer {
            padding: 24px;
            background-color: #F9FAFB;
            text-align: center;
            border-top: 1px solid #E5E7EB;
          }
          
          .footer-text {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 12px;
          }
          
          .footer-link {
            color: #4F46E5;
            text-decoration: none;
          }
          
          .divider {
            height: 1px;
            background-color: #E5E7EB;
            margin: 16px 0;
          }
          
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100%;
              border-radius: 0;
            }
            
            .email-header, .email-body, .email-footer {
              padding: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="${siteUrl}/images/1.jpg" alt="${siteName} Logo" />
            <h1>${siteName}</h1>
          </div>
          
          <div class="email-body">
            <p class="greeting">Hello ${name},</p>
            
            <p class="message">
              Thank you for joining ${siteName}! To complete your registration and verify your email address, 
              please click the button below:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p class="message">
              If the button above doesn't work, you can copy and paste the following link into your browser:
            </p>
            
            <div class="link-container">
              <a href="${verificationUrl}" class="link">${verificationUrl}</a>
            </div>
            
            <p class="expiry">This verification link will expire in 24 hours.</p>
            
            <p class="message">
              If you did not create an account on ${siteName}, please ignore this email or contact support
              if you have any concerns.
            </p>
            
            <div class="divider"></div>
            
            <p class="message" style="margin-bottom: 0;">
              Thank you,<br />
              <strong>The ${siteName} Team</strong>
            </p>
          </div>
          
          <div class="email-footer">
            <p class="footer-text">
              This is an automated message from ${siteName}. Please do not reply to this email.
            </p>
            <p class="footer-text">
              <a href="${siteUrl}" class="footer-link">${siteName}</a> - Connect with the brightest minds at SST
            </p>
          </div>
        </div>
      </body>
      </html>
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
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          
          .email-header {
            background: linear-gradient(to right, #4F46E5, #6366F1);
            padding: 24px;
            text-align: center;
          }
          
          .email-header img {
            width: 48px;
            height: 48px;
            border-radius: 8px;
          }
          
          .email-header h1 {
            color: #ffffff;
            margin: 16px 0 0;
            font-size: 24px;
            font-weight: 700;
          }
          
          .email-body {
            padding: 32px 24px;
            background-color: #ffffff;
          }
          
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #111827;
          }
          
          .message {
            font-size: 16px;
            margin-bottom: 24px;
            color: #4B5563;
          }
          
          .button {
            display: inline-block;
            background-color: #4F46E5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: background-color 0.2s;
          }
          
          .button:hover {
            background-color: #4338CA;
          }
          
          .link-container {
            margin: 24px 0;
            padding: 12px;
            background-color: #F3F4F6;
            border-radius: 6px;
            word-break: break-all;
          }
          
          .link {
            color: #4F46E5;
            font-size: 14px;
          }
          
          .expiry {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 24px;
          }
          
          .warning {
            padding: 12px;
            background-color: #FEF2F2;
            border-left: 4px solid #EF4444;
            border-radius: 4px;
            margin-bottom: 24px;
          }
          
          .warning-text {
            color: #B91C1C;
            font-size: 14px;
            margin: 0;
          }
          
          .email-footer {
            padding: 24px;
            background-color: #F9FAFB;
            text-align: center;
            border-top: 1px solid #E5E7EB;
          }
          
          .footer-text {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 12px;
          }
          
          .footer-link {
            color: #4F46E5;
            text-decoration: none;
          }
          
          .divider {
            height: 1px;
            background-color: #E5E7EB;
            margin: 16px 0;
          }
          
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100%;
              border-radius: 0;
            }
            
            .email-header, .email-body, .email-footer {
              padding: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="${siteUrl}/images/1.jpg" alt="${siteName} Logo" />
            <h1>${siteName}</h1>
          </div>
          
          <div class="email-body">
            <p class="greeting">Hello ${name},</p>
            
            <p class="message">
              We received a request to reset your password for your ${siteName} account. 
              To set a new password, please click the button below:
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p class="message">
              If the button above doesn't work, you can copy and paste the following link into your browser:
            </p>
            
            <div class="link-container">
              <a href="${resetUrl}" class="link">${resetUrl}</a>
            </div>
            
            <p class="expiry">This password reset link will expire in 24 hours.</p>
            
            <div class="warning">
              <p class="warning-text">
                <strong>Important:</strong> If you did not request a password reset, please ignore this email 
                or contact support if you have any concerns about your account security.
              </p>
            </div>
            
            <div class="divider"></div>
            
            <p class="message" style="margin-bottom: 0;">
              Thank you,<br />
              <strong>The ${siteName} Team</strong>
            </p>
          </div>
          
          <div class="email-footer">
            <p class="footer-text">
              This is an automated message from ${siteName}. Please do not reply to this email.
            </p>
            <p class="footer-text">
              <a href="${siteUrl}" class="footer-link">${siteName}</a> - Connect with the brightest minds at SST
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  })
} 