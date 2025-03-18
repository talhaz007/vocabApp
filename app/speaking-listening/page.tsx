"use client"

import Link from "next/link"
import { Mic, Volume2, MessageSquare, Headphones, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/breadcrumb"

export default function SpeakingListeningPage() {
  return (
    <div className="container py-8 space-y-6">
      <Breadcrumb items={[{ label: "Speaking & Listening", href: "/speaking-listening", active: true }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Speaking & Listening Mode</h1>
      </div>

      <p className="text-muted-foreground max-w-3xl">
        Enhance your pronunciation and comprehension through active usage. Practice speaking words correctly and
        understanding them in different contexts and accents.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>Pronunciation Feedback</CardTitle>
            <CardDescription>Improve your spoken accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Speak words aloud and receive instant feedback on your pronunciation.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/speaking-listening/pronunciation" className="w-full">
              <Button className="w-full">
                Start Speaking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle>Audio Learning</CardTitle>
            <CardDescription>Ideal for auditory learners</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Listen to words in different accents and contexts. Train your ear to recognize vocabulary in various
              speaking styles.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/speaking-listening/audio-learning" className="w-full">
              <Button className="w-full" variant="outline">
                Start Listening
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle>Speaking Challenges</CardTitle>
            <CardDescription>Build confidence in word usage</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Answer questions using vocabulary words. Receive feedback on your fluency and word
              usage.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/speaking-listening/speaking-challenges" className="w-full">
              <Button className="w-full" variant="outline">
                Take Challenge
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle>Shadowing Practice</CardTitle>
            <CardDescription>Improve natural speech flow</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Repeat words and sentences after an AI-generated voice. Perfect your pace and pronunciation by mimicking
              native speakers.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/speaking-listening/shadowing" className="w-full">
              <Button className="w-full" variant="outline">
                Start Shadowing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-muted p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">How Speaking & Listening Mode Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Speak Clearly</h3>
            <p className="text-sm text-muted-foreground">
              Practice pronouncing words correctly with real-time feedback on your accuracy.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Volume2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Listen Carefully</h3>
            <p className="text-sm text-muted-foreground">
              Train your ear to recognize words in different accents and contexts.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Use in Context</h3>
            <p className="text-sm text-muted-foreground">
              Apply vocabulary in real-world speaking situations to build confidence.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Shadow and Repeat</h3>
            <p className="text-sm text-muted-foreground">
              Mimic native speakers to develop natural rhythm and intonation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

