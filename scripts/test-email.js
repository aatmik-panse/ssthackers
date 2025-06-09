/**
 * Script to test email configuration
 * 
 * Usage:
 * node scripts/test-email.js
 * 
 * Make sure to set up your .env.local file with email configuration first
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const nodemailer = require('nodemailer')

async function main() {
  console.log('Testing email configuration...')
  console.log('------------------------------')
  console.log('Email Server Host:', process.env.EMAIL_SERVER_HOST || '(not set)')
  console.log('Email Server Port:', process.env.EMAIL_SERVER_PORT || '(not set)')
  console.log('Email Server Secure:', process.env.EMAIL_SERVER_SECURE || '(not set)')
  console.log('Email Server User:', process.env.EMAIL_SERVER_USER ? '(configured)' : '(not set)')
  console.log('Email From:', process.env.EMAIL_FROM || '(not set)')
  console.log('------------------------------')

  // Check if required config is present
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_PORT || !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.error('Error: Missing required email configuration in .env')
    process.exit(1)
  }

  // Create test transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    debug: true,
    logger: true
  })

  try {
    console.log('Verifying SMTP connection...')
    await new Promise((resolve, reject) => {
      transporter.verify(function(error, success) {
        if (error) {
          console.error('SMTP connection error:', error)
          reject(error)
        } else {
          console.log('SMTP server is ready to take messages')
          resolve(success)
        }
      })
    })

    // Ask for test email recipient
    const testEmail = process.argv[2] || process.env.EMAIL_SERVER_USER
    if (!testEmail) {
      console.error('Error: Please provide a test email address as argument or set EMAIL_SERVER_USER')
      process.exit(1)
    }

    console.log(`Sending test email to ${testEmail}...`)
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"SST Hackers Test" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
      to: testEmail,
      subject: 'Test Email from SST Hackers',
      text: 'If you can read this, email sending is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Test Successful!</h2>
          <p>If you can read this, email sending is working correctly!</p>
          <p>This is a test email from the SST Hackers platform.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">This is an automated test email.</p>
        </div>
      `
    })

    console.log('Email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    
  } catch (error) {
    console.error('Error sending test email:', error)
    process.exit(1)
  }
}

main().catch(console.error) 