"use client"

import Link from "next/link"
import { Building, Music, Layers, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/breadcrumb"

export default function MemoryModePage() {
  return (
    <div className="container py-8 space-y-6">
      <Breadcrumb items={[{ label: "Memory", href: "/memory", active: true }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Memory Mode</h1>
      </div>

      <p className="text-muted-foreground max-w-3xl">
        Reinforce vocabulary retention using scientifically proven techniques. Our AI analyzes and recommends words
        based on your proficiency and interests, providing personalized feedback on your progress.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle>Memory Palace</CardTitle>
            <CardDescription>Visualize words in imaginary locations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Place words in imaginary rooms and recall them through mental visualization. Choose different themed
              locations to store your vocabulary words.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/memory/memory-palace" className="w-full">
              <Button className="w-full">
                Start Visualizing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle>Sound Mnemonics</CardTitle>
            <CardDescription>Use similar-sounding words to remember vocabulary</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Learn words through audio mnemonics that link them to similar-sounding phrases. Practice pronunciation and
              recall through sound associations.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/memory/sound-mnemonics" className="w-full">
              <Button className="w-full" variant="outline">
                Start Listening
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle>Chunking</CardTitle>
            <CardDescription>Break complex vocabulary into meaningful groups</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Group words by themes, synonyms, antonyms, or context to make them easier to remember. Practice sorting
              and categorizing words for better retention.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/memory/chunking" className="w-full">
              <Button className="w-full" variant="outline">
                Start Grouping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-muted p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">How Memory Mode Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Spatial Memory</h3>
            <p className="text-sm text-muted-foreground">
              Use the power of spatial memory to create strong mental associations with vocabulary words.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Auditory Associations</h3>
            <p className="text-sm text-muted-foreground">
              Create memorable sound connections to make vocabulary stick in your long-term memory.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Organized Grouping</h3>
            <p className="text-sm text-muted-foreground">
              Break down complex vocabulary into manageable chunks for easier learning and recall.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

