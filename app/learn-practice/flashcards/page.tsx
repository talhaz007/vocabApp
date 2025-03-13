"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Repeat, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { generateMnemonic } from "@/lib/ai-helpers"
import { Breadcrumb } from "@/components/breadcrumb"

interface Flashcard {
  id: string
  word: string
  definition: string
  mnemonic: string
  difficulty: "easy" | "medium" | "hard"
  lastReviewed: Date | null
  nextReview: Date | null
}

// Sample flashcards data
const initialFlashcards: Flashcard[] = [
  {
    id: "1",
    word: "Eloquent",
    definition: "Fluent or persuasive in speaking or writing",
    mnemonic: "Imagine an elephant giving a powerful speech—an eloquent elephant!",
    difficulty: "medium",
    lastReviewed: null,
    nextReview: null,
  },
  {
    id: "2",
    word: "Ephemeral",
    definition: "Lasting for a very short time",
    mnemonic: "Think of a 'femoral' (thigh) pain that's thankfully ephemeral—it goes away quickly!",
    difficulty: "hard",
    lastReviewed: null,
    nextReview: null,
  },
  {
    id: "3",
    word: "Perseverance",
    definition: "Persistence in doing something despite difficulty or delay in achieving success",
    mnemonic: "Per-severe-ance: Even through severe challenges, you advance with perseverance.",
    difficulty: "medium",
    lastReviewed: null,
    nextReview: null,
  },
  {
    id: "4",
    word: "Ubiquitous",
    definition: "Present, appearing, or found everywhere",
    mnemonic: "Think 'ubi-quitous' sounds like 'you be quit-less'—you can't quit seeing it because it's everywhere!",
    difficulty: "hard",
    lastReviewed: null,
    nextReview: null,
  },
  {
    id: "5",
    word: "Serendipity",
    definition: "The occurrence and development of events by chance in a happy or beneficial way",
    mnemonic: "Serene-dip-ity: When you take a serene dip in the sea and unexpectedly find a treasure.",
    difficulty: "medium",
    lastReviewed: null,
    nextReview: null,
  },
]

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentIndex + 1) / flashcards.length) * 100)
  }, [currentIndex, flashcards.length])

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      toast({
        title: "Congratulations!",
        description: "You've completed this set of flashcards.",
      })
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleMarkDifficulty = (difficulty: "easy" | "medium" | "hard") => {
    const updatedFlashcards = [...flashcards]
    updatedFlashcards[currentIndex] = {
      ...updatedFlashcards[currentIndex],
      difficulty,
      lastReviewed: new Date(),
      // Set next review based on difficulty
      nextReview: new Date(
        Date.now() + (difficulty === "easy" ? 3 : difficulty === "medium" ? 1 : 0.5) * 24 * 60 * 60 * 1000,
      ),
    }
    setFlashcards(updatedFlashcards)

    toast({
      title: "Progress saved",
      description: `Marked "${flashcards[currentIndex].word}" as ${difficulty}`,
    })

    // Move to next card after marking
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
      }, 500)
    }
  }

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(flashcards[currentIndex].word)
    utterance.rate = 0.9 // Slightly slower for better clarity
    window.speechSynthesis.speak(utterance)
  }

  const handleNewMnemonic = async () => {
    setIsGeneratingMnemonic(true)
    try {
      const currentWord = flashcards[currentIndex]
      const newMnemonic = await generateMnemonic(currentWord.word, currentWord.definition)

      const updatedFlashcards = [...flashcards]
      updatedFlashcards[currentIndex] = {
        ...updatedFlashcards[currentIndex],
        mnemonic: newMnemonic,
      }
      setFlashcards(updatedFlashcards)

      toast({
        title: "New mnemonic generated",
        description: "We've created a new memory aid for this word.",
      })
    } catch (error) {
      toast({
        title: "Error generating mnemonic",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingMnemonic(false)
    }
  }

  const currentFlashcard = flashcards[currentIndex]
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Learn & Practice", href: "/learn-practice", active: false },
          { label: "Flashcards", href: "/learn-practice/flashcards", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {flashcards.length}
          </span>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <Card
        className={`w-full h-96 perspective-1000 transition-transform duration-500 ${isFlipped ? "rotate-y-180" : ""}`}
      >
        <div className="relative w-full h-full transform-style-3d">
          <div
            className={`absolute w-full h-full backface-hidden ${isFlipped ? "rotate-y-180 pointer-events-none opacity-0" : ""}`}
          >
            <CardHeader className="text-center">
              <Badge variant="outline" className="self-start">
                {currentFlashcard.difficulty}
              </Badge>
              <CardTitle className="text-4xl mt-4">{currentFlashcard.word}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-48">
              <Button variant="ghost" size="lg" onClick={handleFlip}>
                Click to reveal definition and mnemonic
              </Button>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="icon" onClick={handleSpeak}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </div>

          <div
            className={`absolute w-full h-full backface-hidden ${isFlipped ? "" : "rotate-y-180 pointer-events-none opacity-0"}`}
          >
            <CardHeader>
              <CardTitle className="text-2xl">Definition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>{currentFlashcard.definition}</p>

              <div>
                <h3 className="text-lg font-medium mb-2">Mnemonic</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="italic">{currentFlashcard.mnemonic}</p>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleNewMnemonic} disabled={isGeneratingMnemonic}>
                    <Repeat className="h-3 w-3 mr-1" />
                    {isGeneratingMnemonic ? "Generating..." : "New mnemonic"}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => handleMarkDifficulty("easy")}
                >
                  Easy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  onClick={() => handleMarkDifficulty("medium")}
                >
                  Medium
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => handleMarkDifficulty("hard")}
                >
                  Hard
                </Button>
              </div>
              <Button variant="ghost" onClick={handleFlip}>
                Back to word
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

