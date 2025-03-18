"use client"

import Link from "next/link"
import { BookOpen, MessageSquare, Network, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/breadcrumb"

export default function LearnPracticePage() {
  return (
    <div className="container py-8 space-y-6">
      <Breadcrumb items={[{ label: "Learn & Practice", href: "/learn-practice", active: true }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Learn & Practice Mode</h1>
      </div>

      <p className="text-muted-foreground max-w-3xl">
        Learn and practice new words through interactive methods. Our AI analyzes and recommends words based on your
        proficiency and interests, providing personalized feedback on your progress.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
            <CardDescription>Best for visual learners and quick recall</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Learn words with definitions, sentence examples, and mnemonics.
            </p>
            {/* Practice with different modes including
            guessing meanings and matching mnemonics. */}
          </CardContent>
          <CardFooter>
            <Link href="/learn-practice/flashcards" className="w-full">
              <Button className="w-full">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle>Sentence Usage</CardTitle>
            <CardDescription>Evaluate and construct sentences with given words</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Practice using words in context by evaluating sentences and creating your own. Receive AI feedback on your
              usage and suggestions for improvement.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/learn-practice/sentence-usage" className="w-full">
              <Button className="w-full" variant="outline">
                Practice Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle>Word Association</CardTitle>
            <CardDescription>Connect words in meaningful sentences</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Select multiple words and create sentences that connect them. Our AI evaluates your associations and
              provides feedback on your sentence structure.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/learn-practice/word-association" className="w-full">
              <Button className="w-full" variant="outline">
                Start Associating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-muted p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">How Learn & Practice Mode Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Interactive Learning</h3>
            <p className="text-sm text-muted-foreground">
              Learn new vocabulary through engaging, interactive methods tailored to your learning style.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">AI Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Receive personalized feedback and suggestions to improve your vocabulary usage and retention.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Network className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Adaptive Learning</h3>
            <p className="text-sm text-muted-foreground">
              Our system adapts to your performance, focusing on areas where you need more practice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

