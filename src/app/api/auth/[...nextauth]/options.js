import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { isValidDomain } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Check if email domain is allowed
        if (!isValidDomain(credentials.email)) {
          throw new Error('Only @sst.scaler.com and @scaler.com email addresses are allowed')
        }

        try {
          await connectDB()
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email.toLowerCase() })
          
          if (!user) {
            throw new Error('No account found with this email')
          }

          // Check if user is suspended
          if (user.isSuspended && user.suspendedUntil && new Date() < user.suspendedUntil) {
            throw new Error('Account is suspended')
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }
          
          // Check if email is verified
          if (!user.isEmailVerified) {
            throw new Error('Please verify your email address before signing in')
          }

          // Return user object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            auraPoints: user.auraPoints,
            isAdmin: user.isAdmin,
            username: user.username,
            isEmailVerified: user.isEmailVerified
          }
        } catch (error) {
          throw new Error(error.message)
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.auraPoints = token.auraPoints
        session.user.isAdmin = token.isAdmin
        session.user.username = token.username
        session.user.isEmailVerified = token.isEmailVerified
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.auraPoints = user.auraPoints
        token.isAdmin = user.isAdmin
        token.username = user.username
        token.isEmailVerified = user.isEmailVerified
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
} 