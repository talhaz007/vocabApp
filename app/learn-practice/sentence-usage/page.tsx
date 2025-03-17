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
}

// Sample practice words
const practiceWords: PracticeWord[] = [
  {
    id: "1",
    word: "Eloquent",
    definition: "Fluent or persuasive in speaking or writing",
  },
  {
    id: "2",
    word: "Ephemeral",
    definition: "Lasting for a very short time",
  },
  {
    id: "3",
    word: "Perseverance",
    definition: "Persistence in doing something despite difficulty or delay in achieving success",
  },
  {
    id: "4",
    word: "Ubiquitous",
    definition: "Present, appearing, or found everywhere",
  },
  {
    id: "5",
    word: "Serendipity",
    definition: "The occurrence and development of events by chance in a happy or beneficial way",
  },
]

export default function PracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
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

      toast({
        title: "Correct!",
        description: `Correct answer!`,
        variant: "default",
      })
    } else {
      setIsCorrect(false)

      toast({
        title: "Not quite right",
        description: "",
        variant: "destructive",
      })
    }
  }

  const handleNextWord = () => {
    if (currentIndex < practiceWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserInput("")
      setIsCorrect(null)
    } else {
      toast({
        title: "Practice complete!",
      })
    }
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
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
        <div className="flex flex-row gap-2">
            <CardTitle className="text-xl">Word:</CardTitle>
            <p className="text-lg">{currentWord.word}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row gap-2">
            <CardTitle className="text-base">Definition:</CardTitle>
            <p className="text-base">{currentWord.definition}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="answer" className="text-md font-medium font-bold">
                Write a sentence using the given word correctly.
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
              <Button type="submit" disabled={userInput.trim() === "" || isCorrect === true}>
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
              <span>Not quite right.</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Dialog>
            {/* Removed mnemonic dialog code */}
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


