import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import VerificationToken from '@/models/VerificationToken'
import { sendVerificationEmail } from '@/lib/email'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]/options'

export async function POST(request) {
  try {
    // Get session to check if user is logged in
    const session = await getServerSession(authOptions)
    let userEmail;
    
    // If user is logged in, use their email from the session
    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      // If not logged in, get email from request body
      const { email } = await request.json();
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }
      userEmail = email;
    }

    await connectDB()

    // Find the user
    const user = await User.findOne({ email: userEmail.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      )
    }

    // If the user is already verified, return success
    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' }
      )
    }

    // Check if there's an existing token and delete it
    await VerificationToken.deleteMany({
      userId: user._id,
      type: 'email_verification'
    })

    // Create a new verification token
    const verificationToken = VerificationToken.generateToken(user._id, 'email_verification')
    await verificationToken.save()

    // Generate verification URL
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
    const verificationUrl = `${siteUrl}/auth/verify-email?token=${verificationToken.token}`

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationUrl)

    return NextResponse.json(
      { message: 'Verification email sent successfully' }
    )
  } catch (error) {
    console.error('Error resending verification email:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
} 