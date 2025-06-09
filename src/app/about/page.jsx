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
          Where innovation meets community - built by SST students, for SST students
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
            SST Hackers is more than just a platform - it's a launchpad for ideas and collaboration. 
            We're on a mission to create a thriving digital ecosystem where the brilliant minds of Scaler School of Technology can:
          </p>
          <ul className="space-y-3 list-disc pl-6">
            <li>Discover and share game-changing resources, articles, and projects</li>
            <li>Spark conversations that challenge and inspire</li>
            <li>Get unstuck with help from peers who've been there</li>
            <li>Build meaningful connections with like-minded innovators</li>
            <li>Stay at the cutting edge of tech trends and campus happenings</li>
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
              Built with cutting-edge tech for lightning-fast performance and seamless user experience:
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li><span className="font-medium">Frontend:</span> Next.js, React, Tailwind CSS</li>
              <li><span className="font-medium">Backend:</span> Next.js API routes</li>
              <li><span className="font-medium">Database:</span> MongoDB</li>
              <li><span className="font-medium">Authentication:</span> NextAuth.js</li>
              <li><span className="font-medium">Deployment:</span> Vercel</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Engineered to be responsive and intuitive across all devices, ensuring your ideas flow freely whether you're on mobile or desktop.
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
                  <p className="text-muted-foreground text-sm">Share insights that matter and dive into vibrant, threaded conversations</p>
                </div>
              </li>
              <li className="flex gap-2">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">User Profiles</p>
                  <p className="text-muted-foreground text-sm">Showcase your unique contributions and build your digital presence in the community</p>
                </div>
              </li>
              <li className="flex gap-2">
                <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Aura Points System</p>
                  <p className="text-muted-foreground text-sm">Watch your influence grow as you contribute value to the community</p>
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
            At SST Hackers, we're building a community powered by these core values:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Knowledge Sharing</h3>
              <p className="text-muted-foreground">
                We believe in the power of collective wisdom - when we share openly, everyone rises together.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Respect & Inclusivity</h3>
              <p className="text-muted-foreground">
                Every voice matters here. We celebrate diverse perspectives and create space for everyone to contribute.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Quality Content</h3>
              <p className="text-muted-foreground">
                We elevate ideas that spark meaningful conversation and drive our community forward.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Constructive Feedback</h3>
              <p className="text-muted-foreground">
                We believe in feedback that builds rather than breaks - helping each other level up is in our DNA.
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
            Ready to make your mark? Here's how you can contribute to our thriving community:
          </p>
          <ul className="space-y-2 list-disc pl-6">
            <li>Share mind-expanding articles and groundbreaking projects</li>
            <li>Jump into discussions and offer your unique perspective</li>
            <li>Be the hero someone needs by answering their burning questions</li>
            <li>Help us evolve by providing thoughtful feedback</li>
            <li>Uphold our community standards by reporting content that crosses the line</li>
          </ul>
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <p className="font-medium">Have ideas to make SST Hackers even better?</p>
            <p className="text-sm text-muted-foreground mt-1">
              We're all ears! Reach out at <span className="text-primary">dev.aatmik@gmail.com</span> or connect with a moderator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 