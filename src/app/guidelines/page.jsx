import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Check, Shield, Users } from 'lucide-react'

export const metadata = {
  title: 'Community Guidelines - SST Hackers',
  description: 'Guidelines for participating in the SST Hackers community',
}

export default function GuidelinesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-bold">Community Guidelines</h1>
        <p className="text-xl text-muted-foreground">
          Building a thriving ecosystem where great ideas and respectful discourse flourish
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Welcome to SST Hackers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4">
            SST Hackers is where the brilliant minds of Scaler School of Technology converge.
            We're creating a space that amplifies your voice, nurtures your curiosity, and
            connects you with peers who share your passion for innovation and growth.
          </p>
          <p>
            These guidelines aren't just rules-they're the foundation for a community where everyone can thrive.
            By joining SST Hackers, you're becoming part of something special.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Do's
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Elevate with respect and kindness</p>
                  <p className="text-muted-foreground text-sm">Foster an environment where everyone feels valued, even during passionate debates.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Share content that inspires</p>
                  <p className="text-muted-foreground text-sm">Post resources that spark curiosity, solve problems, or ignite meaningful conversations.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Credit the creators</p>
                  <p className="text-muted-foreground text-sm">Acknowledge the brilliant minds behind the content you share-great ideas deserve recognition.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Craft compelling titles</p>
                  <p className="text-muted-foreground text-sm">Make your posts discoverable with titles that capture the essence of your contribution.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Add valuable context</p>
                  <p className="text-muted-foreground text-sm">Enrich your posts with details that help others fully grasp and engage with your ideas.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Be a guardian of quality</p>
                  <p className="text-muted-foreground text-sm">Help us maintain our high standards by reporting content that doesn't align with our community values.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Don'ts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">No room for negativity</p>
                  <p className="text-muted-foreground text-sm">Challenge ideas, not people. Personal attacks and discrimination have no place in our community.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Skip the self-promotion overload</p>
                  <p className="text-muted-foreground text-sm">Share your work when it adds value, not just to promote yourself or your projects.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Fact-check before sharing</p>
                  <p className="text-muted-foreground text-sm">In a world of information overload, be a beacon of accuracy and reliability.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Honor original creators</p>
                  <p className="text-muted-foreground text-sm">Give credit where it's due-plagiarism undermines our collective growth.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Stay on the right side of the law</p>
                  <p className="text-muted-foreground text-sm">Keep all content legal and ethical-we're here to innovate responsibly.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Respect privacy boundaries</p>
                  <p className="text-muted-foreground text-sm">Protect others' personal information as carefully as you would your own.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Enforcement
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4">
            Our dedicated moderators work tirelessly to ensure these guidelines shape a community we can all be proud of. When guidelines aren't followed, we may take these steps:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Content removal to maintain our high standards</li>
            <li>Friendly warnings to help guide behavior</li>
            <li>Temporary suspension for reflection and reset</li>
            <li>Account termination in rare cases of serious violations</li>
          </ul>
          <p className="mt-4">
            We approach enforcement with fairness and consistency, always aiming to educate rather than punish. Our goal is to maintain a space where everyone feels safe to contribute their best ideas.
          </p>
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <p className="font-medium">Have thoughts on how we can improve these guidelines?</p>
            <p className="text-sm text-muted-foreground mt-1">
              We value your input! Reach out to us at <span className="text-primary">dev.aatmik@gmail.com</span> or connect with a moderator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 