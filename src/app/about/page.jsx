import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, Globe, MessageSquare, Lightbulb, Users, Heart } from 'lucide-react'

export const metadata = {
  title: 'About SST Hackers',
  description: 'Learn more about the SST Hackers community platform',
}

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-bold">About SST Hackers</h1>
        <p className="text-xl text-muted-foreground">
          A community platform for Scaler School of Technology students and alumni
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4">
            SST Hackers is a Hacker News-style community platform built specifically for the Scaler School of Technology ecosystem. 
            Our mission is to create a vibrant online space where students, alumni, and faculty can:
          </p>
          <ul className="space-y-3 list-disc pl-6">
            <li>Share valuable resources, articles, and projects</li>
            <li>Discuss ideas and trends in technology and education</li>
            <li>Ask questions and receive help from peers</li>
            <li>Connect with others who share similar interests</li>
            <li>Stay updated on important news and events</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Technology
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              SST Hackers is built with modern web technologies to provide a fast, responsive, and accessible experience:
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li><span className="font-medium">Frontend:</span> Next.js, React, Tailwind CSS</li>
              <li><span className="font-medium">Backend:</span> Next.js API routes</li>
              <li><span className="font-medium">Database:</span> MongoDB</li>
              <li><span className="font-medium">Authentication:</span> NextAuth.js</li>
              <li><span className="font-medium">Deployment:</span> Vercel</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              The platform is designed to be responsive and work well on all devices, from mobile phones to desktop computers.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <li className="flex gap-2">
                <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Content Sharing & Discussion</p>
                  <p className="text-muted-foreground text-sm">Share links or text posts and engage in threaded discussions</p>
                </div>
              </li>
              <li className="flex gap-2">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">User Profiles</p>
                  <p className="text-muted-foreground text-sm">Personalized profiles to showcase your contributions and interests</p>
                </div>
              </li>
              <li className="flex gap-2">
                <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Aura Points System</p>
                  <p className="text-muted-foreground text-sm">Earn reputation through valuable contributions to the community</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Community Values
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4">
            At SST Hackers, we believe in fostering a community that values:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Knowledge Sharing</h3>
              <p className="text-muted-foreground">
                We encourage the free exchange of ideas, resources, and experiences to help everyone grow and learn.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Respect & Inclusivity</h3>
              <p className="text-muted-foreground">
                We welcome diverse perspectives and treat all members with respect, regardless of background or experience level.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Quality Content</h3>
              <p className="text-muted-foreground">
                We value thoughtful, well-articulated content that adds value to the community.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Constructive Feedback</h3>
              <p className="text-muted-foreground">
                We believe in providing feedback in a way that helps others improve and grow.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Get Involved
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4">
            There are many ways to contribute to the SST Hackers community:
          </p>
          <ul className="space-y-2 list-disc pl-6">
            <li>Share interesting articles, resources, and projects</li>
            <li>Participate in discussions and provide thoughtful responses</li>
            <li>Help answer questions from fellow community members</li>
            <li>Provide feedback to improve the platform</li>
            <li>Report content that violates our community guidelines</li>
          </ul>
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <p className="font-medium">Have questions or suggestions?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact us at <span className="text-primary">dev.aatmik@gmail.com</span> or reach out to a moderator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 