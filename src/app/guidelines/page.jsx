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
          Our community standards to foster a healthy, respectful environment
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
            SST Hackers is a community platform for students and alumni of Scaler School of Technology.
            We aim to create a space where members can share knowledge, discuss ideas, ask questions,
            and connect with each other in a respectful and constructive manner.
          </p>
          <p>
            These guidelines help ensure our community remains a valuable resource for everyone.
            By participating in SST Hackers, you agree to follow these guidelines.
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
                  <p className="font-medium">Be respectful and kind</p>
                  <p className="text-muted-foreground text-sm">Treat others with respect and empathy, even when disagreeing.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Share valuable content</p>
                  <p className="text-muted-foreground text-sm">Post content that is relevant, informative, or sparks meaningful discussion.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Give proper attribution</p>
                  <p className="text-muted-foreground text-sm">Credit original authors when sharing content that isn't your own.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Use descriptive titles</p>
                  <p className="text-muted-foreground text-sm">Make your post titles clear and informative.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Provide context</p>
                  <p className="text-muted-foreground text-sm">Include sufficient details when asking questions or sharing information.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Report violations</p>
                  <p className="text-muted-foreground text-sm">Help maintain community standards by reporting content that violates guidelines.</p>
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
                  <p className="font-medium">No harassment or bullying</p>
                  <p className="text-muted-foreground text-sm">Avoid personal attacks, insults, or any form of discriminatory behavior.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">No spam or self-promotion</p>
                  <p className="text-muted-foreground text-sm">Don't flood the platform with repetitive content or excessive self-promotion.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">No misinformation</p>
                  <p className="text-muted-foreground text-sm">Don't knowingly share false or misleading information.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">No plagiarism</p>
                  <p className="text-muted-foreground text-sm">Don't present others' work as your own without proper attribution.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">No illegal content</p>
                  <p className="text-muted-foreground text-sm">Don't share content that violates laws or promotes illegal activities.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">No personal information</p>
                  <p className="text-muted-foreground text-sm">Don't share others' personal information without consent.</p>
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
            Our moderators work to ensure these guidelines are followed. Violations may result in:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Content removal</li>
            <li>Warnings</li>
            <li>Temporary suspension</li>
            <li>Permanent account termination (in severe cases)</li>
          </ul>
          <p className="mt-4">
            The severity of action depends on the nature and frequency of violations. We strive to be fair and consistent in enforcing these guidelines.
          </p>
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <p className="font-medium">Have questions or feedback about these guidelines?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact us at <span className="text-primary">dev.aatmik@gmail.com</span> or reach out to a moderator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 