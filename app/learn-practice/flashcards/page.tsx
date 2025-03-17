"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Repeat, Volume2, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { generateMnemonic } from "@/lib/ai-helpers"
import { Breadcrumb } from "@/components/breadcrumb"
import { generateRandomWord, saveLearnedWord, type WordDetails } from "@/lib/ai-word-service"

export default function FlashcardsPage() {
  const router = useRouter()
  const [flashcards, setFlashcards] = useState<(WordDetails & { 
    id: string, 
    lastReviewed: Date | null,
    nextReview: Date | null
  })[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const { toast } = useToast()
  const isInitialized = useRef(false)

  // Load initial flashcards
  useEffect(() => {
    async function loadFlashcards() {
      setIsLoading(true)
      try {
        const newFlashcards: (WordDetails & { 
          id: string, 
          lastReviewed: Date | null,
          nextReview: Date | null
        })[] = [];
        
        // Generate 5 flashcards sequentially
        for (let i = 0; i < 5; i++) {
          const word = await generateRandomWord({ difficulty: selectedDifficulty || undefined });
          const flashcard = {
            ...word,
            id: `generated-${i}`,
            lastReviewed: null,
            nextReview: null
          };
          newFlashcards.push(flashcard);
          
          // Show the first flashcard immediately and stop loading indicator
          if (i === 0) {
            setFlashcards([flashcard]);
            setIsLoading(false);
          } else {
            // Update with all flashcards generated so far
            setFlashcards([...newFlashcards]);
          }
        }
        
        toast({
          title: "Flashcards loaded",
          description: "Your personalized vocabulary words are ready to learn",
        });
      } catch (error) {
        console.error("Error loading flashcards:", error);
        toast({
          title: "Error loading flashcards",
          description: "Please try again later",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
    
    if (!isInitialized.current) {
      isInitialized.current = true;
      loadFlashcards();
    }
  }, [selectedDifficulty, toast]);

  useEffect(() => {
    // Update progress when current index changes
    if (flashcards.length > 0) {
      setProgress(((currentIndex + 1) / flashcards.length) * 100)
    }
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

  const handleMarkDifficulty = async (difficulty: "easy" | "medium" | "hard") => {
    const currentWord = flashcards[currentIndex]
    const now = new Date()
    
    // Update the flashcard in state
    const updatedFlashcards = [...flashcards]
    updatedFlashcards[currentIndex] = {
      ...updatedFlashcards[currentIndex],
      difficulty,
      lastReviewed: now,
      // Set next review based on difficulty
      nextReview: new Date(
        now.getTime() + (difficulty === "easy" ? 3 : difficulty === "medium" ? 1 : 0.5) * 24 * 60 * 60 * 1000,
      ),
    }
    setFlashcards(updatedFlashcards)

    // Save to user's learned words in Supabase
    try {
      await saveLearnedWord(currentWord, {
        mastery: difficulty === "easy" ? 90 : difficulty === "medium" ? 60 : 30,
        lastPracticed: now,
      })
      
      toast({
        title: "Progress saved",
        description: `Marked "${currentWord.word}" as ${difficulty}`,
      })
    } catch (error) {
      toast({
        title: "Error saving progress",
        description: "Your progress couldn't be saved. Please try again.",
        variant: "destructive",
      })
    }

    // Move to next card after marking
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
      }, 500)
    }
  }

  const handleSpeak = () => {
    if (flashcards.length === 0) return
    
    const utterance = new SpeechSynthesisUtterance(flashcards[currentIndex].word)
    utterance.rate = 0.9 // Slightly slower for better clarity
    window.speechSynthesis.speak(utterance)
  }

  const handleNewMnemonic = async () => {
    if (flashcards.length === 0) return
    
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

  const handleChangeDifficulty = (difficulty: "easy" | "medium" | "hard" | null) => {
    setSelectedDifficulty(difficulty)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  // Update the handleFinish function to use router
  const handleFinish = () => {
    // Navigate back to the learn-practice page using Next.js router
    router.push("/learn-practice")
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Flashcards", href: "/learn-practice/flashcards", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating personalized flashcards...</p>
        </div>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Flashcards", href: "/learn-practice/flashcards", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">No flashcards available. Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of 5
            </span>
            {/* <Progress value={progress} className="w-32" /> */}
          </div>
          
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
      </div>

      <Card className="w-full h-96 overflow-hidden">
        <div className="relative w-full h-full [perspective:1000px]">
          <div
            className={`absolute w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${
              isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            {/* Front of card */}
            <div className="absolute w-full h-full [backface-visibility:hidden] flex flex-col">
              <CardHeader className="text-center flex-shrink-0">
                <Badge variant="outline" className="self-start">
                  {currentFlashcard.difficulty}
                </Badge>
                <CardTitle className="text-4xl mt-4">{currentFlashcard.word}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center flex-grow">
                <Button variant="ghost" size="lg" onClick={handleFlip}>
                  Click to reveal definition and mnemonic
                </Button>
              </CardContent>
              <CardFooter className="flex justify-end flex-shrink-0">
                <Button variant="outline" size="icon" onClick={handleSpeak}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </div>

            {/* Back of card */}
            <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-2xl">Definition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow overflow-hidden text-sm">
                <p className="line-clamp-2">{currentFlashcard.definition}</p>

                <div>
                  <h3 className="text-base font-medium mb-1">Mnemonic</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="italic text-xs line-clamp-3">{currentFlashcard.mnemonic}</p>
                  </div>
                  {/* <div className="mt-1 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={handleNewMnemonic} disabled={isGeneratingMnemonic} className="h-7 text-xs">
                      <Repeat className="h-3 w-3 mr-1" />
                      {isGeneratingMnemonic ? "Generating..." : "New mnemonic"}
                    </Button>
                  </div> */}
                </div>
                
                {currentFlashcard.examples && currentFlashcard.examples.length > 0 && (
                  <div>
                    <h3 className="text-base font-medium mb-1">Examples</h3>
                    <ul className="space-y-1">
                      {currentFlashcard.examples.slice(0, 1).map((example, index) => (
                        <li key={index} className="text-xs bg-muted p-2 rounded line-clamp-2">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between flex-shrink-0">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50 h-7 text-xs"
                    onClick={() => handleMarkDifficulty("easy")}
                  >
                    Easy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 h-7 text-xs"
                    onClick={() => handleMarkDifficulty("medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50 h-7 text-xs"
                    onClick={() => handleMarkDifficulty("hard")}
                  >
                    Hard
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={handleFlip} className="h-7 text-xs">
                  Back to word
                </Button>
              </CardFooter>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        {currentIndex === 4 ? (
          <Button onClick={handleFinish} variant="default">
            Finish <Check className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

