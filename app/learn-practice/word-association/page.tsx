"use client"

import { useState, useEffect } from "react"
import { Check, X, Clock, Lightbulb, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"

interface WordSet {
  id: string
  words: string[]
  difficulty: "easy" | "medium" | "hard"
  category: string
}

// Sample word sets
const wordSets: WordSet[] = [
  {
    id: "1",
    words: ["Eloquent", "Persuasive", "Debate", "Audience"],
    difficulty: "medium",
    category: "Communication",
  },
  {
    id: "2",
    words: ["Ephemeral", "Fleeting", "Moment", "Memory"],
    difficulty: "hard",
    category: "Time",
  },
  {
    id: "3",
    words: ["Perseverance", "Challenge", "Overcome", "Success"],
    difficulty: "medium",
    category: "Achievement",
  },
  {
    id: "4",
    words: ["Ubiquitous", "Prevalent", "Technology", "Modern"],
    difficulty: "hard",
    category: "Technology",
  },
  {
    id: "5",
    words: ["Serendipity", "Chance", "Discovery", "Fortunate"],
    difficulty: "medium",
    category: "Luck",
  },
]

export default function WordAssociationPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [userSentence, setUserSentence] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [timerActive, setTimerActive] = useState(false)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [alternativeSentences, setAlternativeSentences] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentIndex + 1) / wordSets.length) * 100)
  }, [currentIndex])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timerActive && timeLeft === 0) {
      handleSubmit()
      setTimerActive(false)
    }
    return () => clearTimeout(timer)
  }, [timerActive, timeLeft])

  const toggleWordSelection = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word))
    } else {
      setSelectedWords([...selectedWords, word])
    }
  }

  const startTimedMode = () => {
    setTimeLeft(30)
    setTimerActive(true)
    toast({
      title: "Timed mode started",
      description: "You have 30 seconds to create your sentence!",
    })
  }

  const handleSubmit = () => {
    if (selectedWords.length < 2) {
      toast({
        title: "Not enough words selected",
        description: "Please select at least 2 words to create a sentence.",
        variant: "destructive",
      })
      return
    }

    if (!userSentence.trim()) {
      toast({
        title: "Empty sentence",
        description: "Please write a sentence using your selected words.",
        variant: "destructive",
      })
      return
    }

    // Check if all selected words are used in the sentence
    const wordsUsed = selectedWords.filter((word) => userSentence.toLowerCase().includes(word.toLowerCase()))

    if (wordsUsed.length === selectedWords.length) {
      setFeedbackType("success")
      setFeedback("Great job! Your sentence successfully connects all the selected words in a meaningful way.")

      // Generate alternative sentences (simulated)
      setAlternativeSentences([
        `The ${selectedWords[0].toLowerCase()} speaker was ${selectedWords[1].toLowerCase()} in convincing the ${selectedWords[2].toLowerCase()}.`,
        `During the ${selectedWords[2].toLowerCase()}, her ${selectedWords[0].toLowerCase()} style made her ${selectedWords[1].toLowerCase()}.`,
        `The ${selectedWords[1].toLowerCase()} argument was delivered in an ${selectedWords[0].toLowerCase()} manner.`,
      ])
    } else {
      setFeedbackType("error")
      setFeedback(
        `Your sentence is missing some of the selected words. Make sure to include: ${selectedWords
          .filter((word) => !userSentence.toLowerCase().includes(word.toLowerCase()))
          .join(", ")}.`,
      )
    }

    setTimerActive(false)
  }

  const handleNextSet = () => {
    if (currentIndex < wordSets.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedWords([])
      setUserSentence("")
      setFeedback(null)
      setFeedbackType(null)
      setTimeLeft(null)
      setTimerActive(false)
      setShowAlternatives(false)
    } else {
      toast({
        title: "Exercise complete!",
        description: "You've completed all word association exercises.",
      })
    }
  }

  const currentWordSet = wordSets[currentIndex]

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Learn & Practice", href: "/learn-practice", active: false },
          { label: "Word Association", href: "/learn-practice/word-association", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Word Association</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {wordSets.length}
          </span>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create a Sentence</CardTitle>
            <Badge variant="outline">{currentWordSet.category}</Badge>
          </div>
          <p className="text-muted-foreground">
            Select 2-5 words from below and create a sentence that connects them meaningfully.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {currentWordSet.words.map((word) => (
              <Badge
                key={word}
                variant={selectedWords.includes(word) ? "default" : "outline"}
                className="text-base py-1.5 px-3 cursor-pointer"
                onClick={() => toggleWordSelection(word)}
              >
                {word}
              </Badge>
            ))}
          </div>

          {timeLeft !== null && (
            <div className="flex items-center gap-2 text-amber-600">
              <Clock className="h-4 w-4" />
              <span>{timeLeft} seconds remaining</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="sentence" className="text-sm font-medium">
                Your sentence using {selectedWords.length > 0 ? selectedWords.join(", ") : "selected words"}:
              </label>
              {timeLeft === null && !feedbackType && (
                <Button variant="outline" size="sm" onClick={startTimedMode}>
                  <Clock className="mr-2 h-3 w-3" />
                  Timed Mode (30s)
                </Button>
              )}
            </div>
            <Textarea
              id="sentence"
              value={userSentence}
              onChange={(e) => setUserSentence(e.target.value)}
              placeholder="Write a sentence that connects all your selected words..."
              className="min-h-[100px]"
              disabled={feedbackType === "success"}
            />
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-md ${
                feedbackType === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {feedbackType === "success" ? (
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-medium ${feedbackType === "success" ? "text-green-800" : "text-red-800"}`}>
                    {feedbackType === "success" ? "Well done!" : "Try again"}
                  </h3>
                  <p className={feedbackType === "success" ? "text-green-700" : "text-red-700"}>{feedback}</p>
                </div>
              </div>
            </div>
          )}

          {feedbackType === "success" && !showAlternatives && (
            <Button variant="outline" onClick={() => setShowAlternatives(true)}>
              <Lightbulb className="mr-2 h-4 w-4" />
              Show Alternative Sentences
            </Button>
          )}

          {showAlternatives && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Alternative Sentences</h3>
              <ul className="space-y-2">
                {alternativeSentences.map((sentence, index) => (
                  <li key={index} className="text-sm">
                    • {sentence}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedWords([])
              setUserSentence("")
              setFeedback(null)
              setFeedbackType(null)
              setTimeLeft(null)
              setTimerActive(false)
              setShowAlternatives(false)
            }}
            disabled={selectedWords.length === 0 && userSentence === ""}
          >
            Reset
          </Button>

          <div className="flex gap-2">
            {!feedbackType && (
              <Button onClick={handleSubmit} disabled={selectedWords.length < 2 || !userSentence.trim()}>
                Check Sentence
              </Button>
            )}
            {feedbackType === "success" && (
              <Button onClick={handleNextSet}>
                Next Set <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

