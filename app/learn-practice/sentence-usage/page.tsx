"use client"

import { useState, useEffect } from "react"
import { Check, X, HelpCircle, ArrowRight, Loader2 } from "lucide-react"
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
import { generateRandomWord, saveLearnedWord, type WordDetails } from "@/lib/ai-word-service"

export default function SentenceUsagePage() {
  const [practiceWords, setPracticeWords] = useState<WordDetails[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const { toast } = useToast()

  // Load initial practice words
  useEffect(() => {
    async function loadPracticeWords() {
      setIsLoading(true)
      try {
        // Generate 5 random words
        const wordPromises = Array(5).fill(0).map(() => 
          generateRandomWord({ difficulty: selectedDifficulty || undefined })
        )
        
        const generatedWords = await Promise.all(wordPromises)
        setPracticeWords(generatedWords)
        
        toast({
          title: "Practice words loaded",
          description: "Your personalized vocabulary words are ready to practice",
        })
      } catch (error) {
        console.error("Error loading practice words:", error)
        toast({
          title: "Error loading practice words",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPracticeWords()
  }, [selectedDifficulty, toast])

  useEffect(() => {
    // Update progress when current index changes
    if (practiceWords.length > 0) {
      setProgress(((currentIndex + 1) / practiceWords.length) * 100)
    }
  }, [currentIndex, practiceWords.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (practiceWords.length === 0) return
    
    const currentWord = practiceWords[currentIndex].word.toLowerCase()
    const userAnswer = userInput.toLowerCase().trim()

    if (userAnswer === currentWord) {
      setIsCorrect(true)
      const pointsEarned = 5 - hintLevel
      setScore(score + pointsEarned)
      setStreak(streak + 1)

      // Save to user's learned words
      try {
        await saveLearnedWord(practiceWords[currentIndex], {
          mastery: Math.min(100, 60 + (pointsEarned * 10)),
          lastPracticed: new Date(),
        })
      } catch (error) {
        console.error("Error saving learned word:", error)
      }

      toast({
        title: "Correct!",
        description: `+${pointsEarned} points! Current streak: ${streak + 1}`,
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
    if (practiceWords.length === 0) return
    
    if (hintLevel < practiceWords[currentIndex].hints.length - 1) {
      setHintLevel(hintLevel + 1)
    }
    setShowHint(true)
  }

  const handleChangeDifficulty = (difficulty: "easy" | "medium" | "hard" | null) => {
    setSelectedDifficulty(difficulty)
    setCurrentIndex(0)
    setUserInput("")
    setIsCorrect(null)
    setShowHint(false)
    setHintLevel(0)
    setScore(0)
    setStreak(0)
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Sentence Usage", href: "/learn-practice/sentence-usage", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating personalized practice words...</p>
        </div>
      </div>
    )
  }

  if (practiceWords.length === 0) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Sentence Usage", href: "/learn-practice/sentence-usage", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">No practice words available. Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
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
      
      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={selectedDifficulty === "easy" ? "default" : "outline"}
            onClick={() => handleChangeDifficulty("easy")}
          >
            Easy
          </Button>
          <Button 
            size="sm" 
            variant={selectedDifficulty === "medium" ? "default" : "outline"}
            onClick={() => handleChangeDifficulty("medium")}
          >
            Medium
          </Button>
          <Button 
            size="sm" 
            variant={selectedDifficulty === "hard" ? "default" : "outline"}
            onClick={() => handleChangeDifficulty("hard")}
          >
            Hard
          </Button>
          {selectedDifficulty && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleChangeDifficulty(null)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">What word matches this definition?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <p className="text-lg">{currentWord.definition}</p>
          </div>

          {currentWord.examples && currentWord.examples.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Example Sentences</h3>
              <ul className="space-y-2">
                {currentWord.examples.map((example, index) => (
                  <li key={index} className="text-sm bg-muted p-3 rounded">
                    {example.replace(new RegExp(currentWord.word, 'gi'), '______')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showHint && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <h3 className="text-blue-800 font-medium mb-1">Hint {hintLevel + 1}/{currentWord.hints.length}</h3>
              <p className="text-blue-700">{currentWord.hints[hintLevel]}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="word-input" className="text-sm font-medium">
                Your answer:
              </label>
              <div className="flex gap-2">
                <Input
                  id="word-input"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type the word here..."
                  className={
                    isCorrect === true
                      ? "border-green-500 focus-visible:ring-green-500"
                      : isCorrect === false
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  disabled={isCorrect === true}
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Word Information</DialogTitle>
                      <DialogDescription>Additional details about this word</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <h4 className="font-medium mb-1">Synonyms</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentWord.synonyms.map((synonym, index) => (
                            <span key={index} className="bg-muted px-2 py-1 rounded text-sm">
                              {synonym}
                            </span>
                          ))}
                        </div>
                      </div>
                      {currentWord.antonyms && currentWord.antonyms.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">Antonyms</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentWord.antonyms.map((antonym, index) => (
                              <span key={index} className="bg-muted px-2 py-1 rounded text-sm">
                                {antonym}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex justify-between">
              {isCorrect === null ? (
                <>
                  <Button type="button" variant="outline" onClick={showNextHint} disabled={showHint && hintLevel === currentWord.hints.length - 1}>
                    {showHint ? "Next Hint" : "Show Hint"}
                  </Button>
                  <Button type="submit">Check Answer</Button>
                </>
              ) : isCorrect ? (
                <div className="flex w-full justify-between">
                  <div className="flex items-center text-green-600 gap-2">
                    <Check className="h-5 w-5" />
                    <span>Correct! The word is "{currentWord.word}"</span>
                  </div>
                  <Button onClick={handleNextWord}>
                    Next Word <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex w-full justify-between">
                  <div className="flex items-center text-red-600 gap-2">
                    <X className="h-5 w-5" />
                    <span>Try again or use a hint</span>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={showNextHint} disabled={showHint && hintLevel === currentWord.hints.length - 1}>
                      {showHint ? "Next Hint" : "Show Hint"}
                    </Button>
                    <Button type="submit">Check Again</Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}