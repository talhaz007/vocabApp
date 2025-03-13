"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, X, HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Breadcrumb } from "@/components/breadcrumb"

interface PracticeWord {
  id: string
  word: string
  definition: string
  mnemonic: string
  difficulty: "easy" | "medium" | "hard"
  hints: string[]
}

// Sample practice words
const practiceWords: PracticeWord[] = [
  {
    id: "1",
    word: "Eloquent",
    definition: "Fluent or persuasive in speaking or writing",
    mnemonic: "Imagine an elephant giving a powerful speech—an eloquent elephant!",
    difficulty: "medium",
    hints: ["Starts with 'E'", "Related to speaking well", "Think of an elephant giving a speech", "E _ _ _ _ _ _ t"],
  },
  {
    id: "2",
    word: "Ephemeral",
    definition: "Lasting for a very short time",
    mnemonic: "Think of a 'femoral' (thigh) pain that's thankfully ephemeral—it goes away quickly!",
    difficulty: "hard",
    hints: [
      "Starts with 'E'",
      "Means something doesn't last long",
      "Think of something that fades quickly",
      "E _ _ _ _ _ _ l",
    ],
  },
  {
    id: "3",
    word: "Perseverance",
    definition: "Persistence in doing something despite difficulty or delay in achieving success",
    mnemonic: "Per-severe-ance: Even through severe challenges, you advance with perseverance.",
    difficulty: "medium",
    hints: ["Starts with 'P'", "Related to not giving up", "Contains the word 'severe'", "P _ _ _ _ _ _ _ _ _ _ e"],
  },
  {
    id: "4",
    word: "Ubiquitous",
    definition: "Present, appearing, or found everywhere",
    mnemonic: "Think 'ubi-quitous' sounds like 'you be quit-less'—you can't quit seeing it because it's everywhere!",
    difficulty: "hard",
    hints: [
      "Starts with 'U'",
      "Means something is everywhere",
      "Think of something you can't quit seeing",
      "U _ _ _ _ _ _ _ _ s",
    ],
  },
  {
    id: "5",
    word: "Serendipity",
    definition: "The occurrence and development of events by chance in a happy or beneficial way",
    mnemonic: "Serene-dip-ity: When you take a serene dip in the sea and unexpectedly find a treasure.",
    difficulty: "medium",
    hints: [
      "Starts with 'S'",
      "Related to lucky coincidences",
      "Think of finding something by chance",
      "S _ _ _ _ _ _ _ _ _ y",
    ],
  },
]

export default function PracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentIndex + 1) / practiceWords.length) * 100)
  }, [currentIndex])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const currentWord = practiceWords[currentIndex].word.toLowerCase()
    const userAnswer = userInput.toLowerCase().trim()

    if (userAnswer === currentWord) {
      setIsCorrect(true)
      setScore(score + (5 - hintLevel)) // Score based on hints used
      setStreak(streak + 1)

      toast({
        title: "Correct!",
        description: `+${5 - hintLevel} points! Current streak: ${streak + 1}`,
        variant: "default",
      })
    } else {
      setIsCorrect(false)
      setStreak(0)

      toast({
        title: "Not quite right",
        description: "Try again or use a hint",
        variant: "destructive",
      })
    }
  }

  const handleNextWord = () => {
    if (currentIndex < practiceWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserInput("")
      setIsCorrect(null)
      setShowHint(false)
      setHintLevel(0)
    } else {
      toast({
        title: "Practice complete!",
        description: `Final score: ${score}`,
      })
    }
  }

  const showNextHint = () => {
    if (hintLevel < practiceWords[currentIndex].hints.length - 1) {
      setHintLevel(hintLevel + 1)
    }
    setShowHint(true)
  }

  const currentWord = practiceWords[currentIndex]

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Learn & Practice", href: "/learn-practice", active: false },
          { label: "Sentence Usage", href: "/learn-practice/sentence-usage", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sentence Usage</h1>
        <div className="flex items-center gap-4">
          <div className="bg-muted px-3 py-1 rounded-md">
            <span className="font-medium">Score: {score}</span>
          </div>
          <div className="bg-muted px-3 py-1 rounded-md">
            <span className="font-medium">Streak: {streak}</span>
          </div>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Definition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">{currentWord.definition}</p>

          {showHint && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Hint {hintLevel + 1}:</h3>
              <p>{currentWord.hints[hintLevel]}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">
                What word matches this definition?
              </label>
              <Input
                id="answer"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your answer here..."
                className={
                  isCorrect === true
                    ? "border-green-500 focus-visible:ring-green-500"
                    : isCorrect === false
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                }
              />
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={showNextHint}
                disabled={hintLevel >= currentWord.hints.length - 1 && showHint}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                {showHint ? "Next Hint" : "Show Hint"}
              </Button>

              <Button type="submit" disabled={isCorrect === true}>
                Check Answer
              </Button>
            </div>
          </form>

          {isCorrect === true && (
            <div className="flex items-center gap-2 text-green-600 mt-4">
              <Check className="h-5 w-5" />
              <span>Correct! The answer is "{currentWord.word}".</span>
            </div>
          )}

          {isCorrect === false && (
            <div className="flex items-center gap-2 text-red-600 mt-4">
              <X className="h-5 w-5" />
              <span>Not quite right. Try again or use a hint.</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">View Mnemonic</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mnemonic for "{currentWord.word}"</DialogTitle>
                <DialogDescription>A memory aid to help you remember this word</DialogDescription>
              </DialogHeader>
              <div className="bg-muted p-4 rounded-md mt-4">
                <p className="italic">{currentWord.mnemonic}</p>
              </div>
            </DialogContent>
          </Dialog>

          {isCorrect === true && (
            <Button onClick={handleNextWord}>
              Next Word <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

