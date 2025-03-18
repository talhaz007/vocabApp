"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Check, X, HelpCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
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
  const router = useRouter()
  const [practiceWords, setPracticeWords] = useState<WordDetails[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [usageQuality, setUsageQuality] = useState<string | null>(null)
  const [exampleSentences, setExampleSentences] = useState<string[] | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const { toast } = useToast()
  const isInitialized = useRef(false)

  // Load initial practice words
  useEffect(() => {
    async function loadPracticeWords() {
      setIsLoading(true)
      try {
        const newWords: WordDetails[] = [];
        
        // Generate 5 words sequentially
        for (let i = 0; i < 5; i++) {
          const word = await generateRandomWord({ difficulty: selectedDifficulty || undefined });
          newWords.push(word);
          
          // Show the first word immediately and stop loading indicator
          if (i === 0) {
            setPracticeWords([word]);
            setIsLoading(false);
          } else {
            // Update with all words generated so far
            setPracticeWords([...newWords]);
          }
        }
        
        toast({
          title: "Practice words loaded",
          description: "Your personalized vocabulary words are ready to practice",
        });
      } catch (error) {
        console.error("Error loading practice words:", error);
        toast({
          title: "Error loading practice words",
          description: "Please try again later",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }

    if (!isInitialized.current) {
      isInitialized.current = true;
      loadPracticeWords();
    }
  }, [selectedDifficulty, toast]);

  useEffect(() => {
    // Update progress when current index changes
    if (practiceWords.length > 0) {
      setProgress(((currentIndex + 1) / practiceWords.length) * 100)
    }
  }, [currentIndex, practiceWords.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (practiceWords.length === 0 || userInput.trim() === "") return
    
    setIsSubmitting(true)
    const currentWord = practiceWords[currentIndex]
    
    try {
      // Call the new API for sentence evaluation
      const response = await fetch('/api/writing/sentence-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: currentWord.word,
          sentence: userInput.trim()
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to evaluate sentence')
      }
      
      const result = await response.json()
      
      setIsCorrect(result.isCorrect)
      setFeedback(result.feedback)
      setUsageQuality(result.usageQuality || null)
      setExampleSentences(result.exampleSentences || null)
      
      if (result.isCorrect) {
        const pointsEarned = calculatePoints(result.usageQuality || "good")
        setScore(score + pointsEarned)
        setStreak(streak + 1)

        // Save to user's learned words in Supabase
        try {
          await saveLearnedWord(currentWord, {
            mastery: Math.min(100, 60 + (pointsEarned * 10)),
            lastPracticed: new Date(),
          })
        } catch (error) {
          console.error("Error saving learned word:", error)
        }

        toast({
          title: `${result.usageQuality || "Good"} usage!`,
          description: `+${pointsEarned} points! Current streak: ${streak + 1}`,
          variant: "default",
        })
      } else {
        setStreak(0)
        toast({
          title: "Needs improvement",
          description: "Check the feedback and try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error evaluating sentence:", error)
      toast({
        title: "Error evaluating sentence",
        description: "Please try again later",
        variant: "destructive",
      })
      setIsCorrect(false)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Calculate points based on usage quality
  const calculatePoints = (quality: string): number => {
    switch(quality.toLowerCase()) {
      case "excellent": return 5;
      case "good": return 4;
      case "fair": return 3;
      case "poor": return 1;
      default: return 3;
    }
  }

  const handleNextWord = () => {
    if (currentIndex < practiceWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      resetCurrentWordState()
    } else {
      toast({
        title: "Practice complete!",
        description: `Final score: ${score}`,
      })
    }
  }

  const handlePreviousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      resetCurrentWordState()
    }
  }
  
  const resetCurrentWordState = () => {
    setUserInput("")
    setIsCorrect(null)
    setFeedback(null)
    setUsageQuality(null)
    setExampleSentences(null)
    setShowHint(false)
    setHintLevel(0)
  }

  const handleFinish = () => {
    router.push("/learn-practice")
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
    resetCurrentWordState()
    setScore(0)
    setStreak(0)

    isInitialized.current = false;
  }
  
  const getUsageQualityColor = (quality: string | null) => {
    if (!quality) return "bg-muted text-foreground";
    
    switch(quality.toLowerCase()) {
      case "excellent": return "bg-green-100 text-green-800 border-green-200";
      case "good": return "bg-blue-100 text-blue-800 border-blue-200";
      case "fair": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "poor": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-muted text-foreground";
    }
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
          <p className="text-lg text-muted-foreground">Generating test...</p>
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
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of 5
          </span>
          {/* <div className="bg-muted px-3 py-1 rounded-md">
            <span className="font-medium">Score: {score}</span>
          </div>
          <div className="bg-muted px-3 py-1 rounded-md">
            <span className="font-medium">Streak: {streak}</span>
          </div>
          <Progress value={progress} className="w-32" /> */}
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
          <CardTitle className="text-2xl">Write a sentence using the word "{currentWord.word}"</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <p className="text-lg">Definition: {currentWord.definition}</p>
          </div>

          {/* {showHint && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <h3 className="text-blue-800 font-medium mb-1">Hint {hintLevel + 1}/{currentWord.hints.length}</h3>
              <p className="text-blue-700">{currentWord.hints[hintLevel]}</p>
            </div>
          )} */}
          
          {feedback && (
            <div className={`p-4 rounded-md border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
                <h3 className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? 'Good job!' : 'Try again'}
                </h3>
                {usageQuality && (
                  <span className={`text-sm px-2 py-0.5 rounded-full border ${getUsageQualityColor(usageQuality)}`}>
                    {usageQuality}
                  </span>
                )}
              </div>
              <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>{feedback}</p>
              
              {exampleSentences && exampleSentences.length > 0 && !isCorrect && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Example sentences:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {exampleSentences.map((example, index) => (
                      <li key={index} className="text-sm text-red-700">{example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="word-input" className="text-sm font-medium">
                Your sentence:
              </label>
              <div className="flex gap-2">
                <Input
                  id="word-input"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type a sentence using this word..."
                  className={
                    isCorrect === true
                      ? "border-green-500 focus-visible:ring-green-500"
                      : isCorrect === false
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  disabled={isSubmitting}
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
                  {/* <Button type="button" variant="outline" onClick={showNextHint} disabled={showHint && hintLevel === currentWord.hints.length - 1}>
                    {showHint ? "Next Hint" : "Show Hint"}
                  </Button> */}
                  {!feedback &&
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Check Sentence"
                    )}
                  </Button>
                  }
                </>
              ) : isCorrect ? (
                <div className="flex w-full justify-end">
                  {/* <Button onClick={handleNextWord}>
                    {currentIndex === practiceWords.length - 1 ? "Finish" : "Next Word"} 
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button> */}
                </div>
              ) : (
                <div className="flex w-full justify-between">
                  {/* <Button type="button" variant="outline" onClick={showNextHint} disabled={showHint && hintLevel === currentWord.hints.length - 1}>
                    {showHint ? "Next Hint" : "Show Hint"}
                  </Button> */}
                  <div className="flex gap-2">
                    {/* <Button type="button" variant="outline" onClick={() => setIsCorrect(null)}>
                      Try Again
                    </Button> */}
                    <Button onClick={handleNextWord}>
                      {currentIndex === practiceWords.length - 1 ? "Finish" : "Next Word"} 
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="pt-6">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              onClick={handlePreviousWord} 
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            {
              currentIndex === 4 ? (
                <Button onClick={handleFinish}>
                  Finish <Check className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNextWord} disabled={isSubmitting || currentIndex === practiceWords.length - 1}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )
            }
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}