# SST Hackers - Scaler School of Technology Community Platform

A modern Hacker News-style community platform built specifically for SST students and alumni. Built with Next.js 15, Tailwind CSS, MongoDB, and NextAuth.js.

## 🚀 Features

### Core Features
- **Restricted Authentication**: Email/password signup with domain restrictions to `@sst.scaler.com` and `@scaler.com` only
- **User Registration**: Simple signup process with email validation
- **Post Submission**: Link posts and text posts with rich content
- **Voting System**: Upvote/downvote posts and comments with aura point rewards
- **Nested Comments**: Unlimited depth comment threading
- **Multiple Feeds**: Hot (time-decay algorithm), New (chronological), Top (by time period)
- **Aura Points System**: Gamification with +5 aura for post upvotes, +1 for comment upvotes
- **User Profiles**: Customizable profiles with avatars, bio, location, and social links

### UI/UX Features
- **Responsive Design**: Mobile-first with desktop optimization
- **Dark/Light Mode**: System preference detection with manual toggle
- **Accessibility**: Keyboard navigation and ARIA labels
- **Modern UI**: Clean interface using shadcn/ui components
- **Avatar Selection**: Choose from preset avatars or use custom images

### Community Features
- **Aura Leaderboard**: Top contributors ranked by aura points
- **Community Stats**: Real-time statistics dashboard
- **Moderation Tools**: Flag/report system for posts and comments
- **Admin Panel**: Content moderation and user management

## 🛠 Tech Stack

- **Frontend**: Next.js 15 App Router, React 19, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives, Lucide React icons
- **Backend**: Next.js API Routes (unified full-stack)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with Credentials Provider + bcrypt
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **State Management**: React hooks and server state

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth configuration & signup
│   │   ├── posts/             # Post CRUD and voting
│   │   ├── leaderboard/       # Aura leaderboard
│   │   └── stats/             # Community statistics
│   ├── auth/                  # Authentication pages
│   ├── globals.css            # Global styles
│   ├── layout.js              # Root layout
│   └── page.js                # Home page
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── navbar.jsx             # Navigation bar
│   ├── post-card.jsx          # Post display component
│   ├── post-list.jsx          # Post feed component
│   ├── vote-buttons.jsx       # Voting interface
│   └── sidebar.jsx            # Sidebar with stats
├── lib/
│   ├── mongodb.js             # Database connection
│   └── utils.js               # Utility functions
└── models/
    ├── User.js                # User schema with password hashing
    ├── Post.js                # Post schema
    ├── Comment.js             # Comment schema
    └── Vote.js                # Vote schema
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### 1. Clone and Install

```bash
git clone <repository-url>
cd ssthackers
npm install
# or
bun install
```

### 2. Environment Setup

Create `.env.local`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ssthackers
# For production: mongodb+srv://username:password@cluster.mongodb.net/ssthackers

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Email Domain Restrictions
ALLOWED_DOMAINS=sst.scaler.com,scaler.com

# App Configuration
SITE_URL=http://localhost:3000
SITE_NAME=SST Hackers

# Password Requirements
MIN_PASSWORD_LENGTH=8
```

### 3. Database Setup

**Local MongoDB:**
```bash
# Install MongoDB
brew install mongodb/brew/mongodb-community

# Start MongoDB
brew services start mongodb-community

# MongoDB will be available at mongodb://localhost:27017
```

**MongoDB Atlas (Production):**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create cluster and database
3. Get connection string and update `MONGODB_URI`

### 4. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication System

### User Registration
- Users can sign up with email and password
- Email domain validation ensures only `@sst.scaler.com` and `@scaler.com` addresses
- Passwords are hashed using bcrypt with salt rounds of 12
- Minimum password length is configurable (default: 8 characters)

### Sign In Process
1. User enters email and password
2. System validates email domain
3. Password is verified against hashed version in database
4. JWT session is created with user information
5. User is redirected to intended page

### Security Features
- Password hashing with bcrypt
- JWT-based session management
- Domain-restricted registration
- Protection against duplicate accounts
- Account suspension system for moderation

## 🏗 Development Workflow

### Adding New Features

1. **Database Models**: Add to `src/models/`
2. **API Routes**: Create in `src/app/api/`
3. **Components**: Build in `src/components/`
4. **Pages**: Add to `src/app/`

### Code Style

- Use functional components with hooks
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for better UX

### Database Indexing

Key indexes for performance:
```javascript
// User indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "auraPoints": -1 })

// Post indexes  
db.posts.createIndex({ "hotScore": -1 })
db.posts.createIndex({ "createdAt": -1 })
db.posts.createIndex({ "votes": -1 })

// Vote indexes (prevent duplicates)
db.votes.createIndex({ "user": 1, "post": 1 }, { unique: true, sparse: true })
db.votes.createIndex({ "user": 1, "comment": 1 }, { unique: true, sparse: true })
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Prepare for deployment**:
```bash
npm run build
```

2. **Deploy to Vercel**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

3. **Environment Variables on Vercel**:
- Add all `.env.local` variables to Vercel project settings
- Update `NEXTAUTH_URL` to your production domain
- Generate a strong `NEXTAUTH_SECRET` for production

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Database Migration

For production, ensure proper database setup:
```bash
# Connect to production MongoDB and create indexes
mongosh "your-production-connection-string"

# Run index creation commands
db.users.createIndex({ "email": 1 }, { unique: true })
db.posts.createIndex({ "hotScore": -1 })
# ... other indexes
```

## 🔧 Configuration

### Email Domain Restrictions

Update `ALLOWED_DOMAINS` in environment variables:
```env
ALLOWED_DOMAINS=sst.scaler.com,scaler.com,newdomain.com
```

### Password Requirements

Adjust password validation:
```env
MIN_PASSWORD_LENGTH=10  # Increase minimum length
```

### Hot Score Algorithm

Customize ranking in `src/lib/utils.js`:
```javascript
export function calculateHotScore(votes, createdAt, comments = 0) {
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  const gravity = 1.8 // Adjust this value to change decay rate
  const score = (votes + comments * 0.5) / Math.pow(ageInHours + 2, gravity)
  return score
}
```

### Aura Point System

Modify point values in vote API routes:
```javascript
// Post upvote: +5 aura to author
// Comment upvote: +1 aura to author
// Downvotes: No aura change (can be modified)
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (handled by NextAuth)
- `POST /api/auth/signout` - User logout (handled by NextAuth)

### Posts & Content
- `GET/POST /api/posts` - Fetch/create posts
- `POST /api/posts/[id]/vote` - Vote on posts
- `GET /api/leaderboard` - User leaderboard
- `GET /api/stats` - Community statistics

## 📊 Monitoring & Analytics

### Database Monitoring
- Monitor MongoDB performance and queries
- Set up alerts for high database usage
- Regular backup schedule

### Application Monitoring
- Use Vercel Analytics for performance insights
- Monitor API route response times
- Track user engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Write descriptive commit messages
- Add proper error handling
- Include loading states
- Test on mobile devices
- Follow accessibility guidelines

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open GitHub issues for bugs and feature requests
- **Community**: Join the SST Hackers platform for discussions

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Email/password authentication with domain restrictions
- [x] Core posting and voting functionality
- [x] Basic moderation tools
- [x] Responsive design

### Phase 2 (Planned)
- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Real-time notifications
- [ ] Advanced search functionality  
- [ ] User profiles with avatars
- [ ] Comment threading improvements

### Phase 3 (Future)
- [ ] Two-factor authentication
- [ ] AI-powered content moderation
- [ ] Advanced analytics dashboard
- [ ] Integration with SST systems
- [ ] Mobile app (React Native)

## 👤 User Profiles

### Profile Features
- **Custom Avatars**: Choose from preset avatars or use a custom URL
- **Profile Information**: Name, bio, location, and social links
- **Social Integration**: Link to GitHub, LinkedIn, Twitter, and personal website
- **Activity Display**: View a user's posts and comments history
- **Aura Points Display**: Showcase contribution level with aura points

### Avatar System
The platform includes a collection of preset avatars for users to choose from:
- 8 unique preset avatars with different styles
- Custom avatar URL option for personalization
- Fallback to user initials when no avatar is selected
- Color-coded avatars based on username for consistency

### Profile Management
Users can:
- Edit their profile information at any time
- Update their display name and avatar
- Add a bio (limited to 500 characters)
- Add their location
- Connect social accounts with appropriate links

### Profile Privacy
- Email addresses are only visible to the user and admins
- Usernames are derived from email addresses for consistency
- Profile pages are public but certain information is restricted

---

Built with ❤️ for the Scaler School of Technology community.
