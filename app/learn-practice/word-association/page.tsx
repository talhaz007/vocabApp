"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Clock, Lightbulb, ArrowRight, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { generateWordSet, evaluateSentence, saveLearnedWord } from "@/lib/ai-word-service"
import { incrementWordLearned, incrementExerciseCompleted } from "@/lib/stats-service"

interface WordSet {
  id: string
  words: string[]
  difficulty: "easy" | "medium" | "hard"
  category: string
  possibleSentences: string[]
}

export default function WordAssociationPage() {
  const router = useRouter()
  const [wordSets, setWordSets] = useState<WordSet[]>([])
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
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const { toast } = useToast()
  const isInitialized = useRef(false)
  const [isChecking, setIsChecking] = useState(false)

  const [wordSetProgress, setWordSetProgress] = useState(() => 
    Array(5).fill({
      selectedWords: [],
      userSentence: "",
      feedback: null,
      feedbackType: null,
      timeLeft: null,
      timerActive: false,
      showAlternatives: false,
      alternativeSentences: [],
    })
  );

  // Clear localStorage on component mount to prevent showing old data
  useEffect(() => {
    // Clear any previous feedback data to prevent showing old results
    localStorage.removeItem('wordAssociationResults');
  }, []);

  // Load initial word sets
  useEffect(() => {
    async function loadWordSets() {
      setIsLoading(true)
      try {
        const newSets: WordSet[] = []
        // Keep track of categories we've already generated to avoid duplicates
        const usedCategories: string[] = []
        
        // Generate 5 sets sequentially
        for (let i = 0; i < 5; i++) {
          const set = await generateWordSet({ 
            difficulty: selectedDifficulty || undefined,
            excludeCategories: usedCategories
          })
          
          // Add this category to used categories for future generations
          usedCategories.push(set.category)
          
          const setWithId = {
            ...set,
            id: `set-${i}`,
          }
          newSets.push(setWithId)
          
          // Show the first set immediately and stop loading indicator
          if (i === 0) {
            setWordSets([setWithId])
            setIsLoading(false)
          } else {
            // Update with all sets generated so far
            setWordSets([...newSets])
          }
        }
        
        toast({
          title: "Word sets loaded",
          description: "Your word association exercises are ready",
        })
      } catch (error) {
        console.error("Error loading word sets:", error)
        toast({
          title: "Error loading word sets",
          description: "Please try again later",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (!isInitialized.current) {
      isInitialized.current = true
      loadWordSets()
    }
  }, [selectedDifficulty, toast])

  useEffect(() => {
    // Update progress when current index changes
    if (wordSets.length > 0) {
      setProgress(((currentIndex + 1) / wordSets.length) * 100)
    }
  }, [currentIndex, wordSets.length])

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

  const handleSubmit = async () => {
    setIsChecking(true)
    if (selectedWords.length < 2) {
      toast({
        title: "Not enough words selected",
        description: "Please select at least 2 words to create a sentence.",
        variant: "destructive",
      })
      setIsChecking(false)
      return
    }

    if (!userSentence.trim()) {
      toast({
        title: "Empty sentence",
        description: "Please write a sentence using your selected words.",
        variant: "destructive",
      })
      setIsChecking(false)
      return
    }

    try {
      const result = await evaluateSentence(
        userSentence, 
        selectedWords, 
        currentWordSet.difficulty
      )
      
      const updatedProgress = [...wordSetProgress];
      updatedProgress[currentIndex] = {
        ...updatedProgress[currentIndex],
        feedbackType: result.isValid ? "success" : "error",
        feedback: result.feedback,
        alternativeSentences: result.alternativeSentences || [],
        selectedWords: selectedWords,
        userSentence: userSentence,
      };
      setWordSetProgress(updatedProgress);

      if (result.isValid) {
        setFeedbackType("success")
        setFeedback(result.feedback)
        setAlternativeSentences(result.alternativeSentences || [])
        
        toast({
          title: "Great job!",
          description: "Your sentence is valid and your progress has been saved.",
        })
      } else {
        setFeedbackType("error")
        setFeedback(result.feedback)
      }
    } catch (error) {
      console.error("Error evaluating sentence:", error)
      setFeedbackType("error")
      setFeedback("We couldn't evaluate your sentence. Please try again.")
    } finally {
      setIsChecking(false)
    }
  }

  const handleNextSet = () => {
    if (currentIndex < wordSets.length - 1) {
      const updatedProgress = [...wordSetProgress];
      updatedProgress[currentIndex] = {
        selectedWords,
        userSentence,
        feedback,
        feedbackType,
        timeLeft,
        timerActive,
        showAlternatives,
        alternativeSentences,
      };
      setWordSetProgress(updatedProgress);

      const nextProgress = updatedProgress[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setSelectedWords(nextProgress.selectedWords);
      setUserSentence(nextProgress.userSentence);
      setFeedback(nextProgress.feedback);
      setFeedbackType(nextProgress.feedbackType);
      setTimeLeft(nextProgress.timeLeft);
      setTimerActive(nextProgress.timerActive);
      setShowAlternatives(nextProgress.showAlternatives);
      setAlternativeSentences(nextProgress.alternativeSentences);
    } else {
      toast({
        title: "All sets completed!",
        description: "You've completed all the word association exercises.",
      });
    }
  }

  const handlePreviousWord = () => {
    if (currentIndex > 0) {
      const updatedProgress = [...wordSetProgress];
      updatedProgress[currentIndex] = {
        selectedWords,
        userSentence,
        feedback,
        feedbackType,
        timeLeft,
        timerActive,
        showAlternatives,
        alternativeSentences,
      };
      setWordSetProgress(updatedProgress);

      const prevProgress = updatedProgress[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setSelectedWords(prevProgress.selectedWords);
      setUserSentence(prevProgress.userSentence);
      setFeedback(prevProgress.feedback);
      setFeedbackType(prevProgress.feedbackType);
      setTimeLeft(prevProgress.timeLeft);
      setTimerActive(prevProgress.timerActive);
      setShowAlternatives(prevProgress.showAlternatives);
      setAlternativeSentences(prevProgress.alternativeSentences);
    }
  }

  const handleFinish = async () => {
    // Save the current question's data before finishing
    const updatedProgress = [...wordSetProgress];
    updatedProgress[currentIndex] = {
      selectedWords,
      userSentence,
      feedback,
      feedbackType,
      timeLeft,
      timerActive,
      showAlternatives,
      alternativeSentences,
    };
    setWordSetProgress(updatedProgress);
  
    // Prepare data for API
    const exercises = [];
    
    // Only include exercises where the user actually created a sentence
    updatedProgress.forEach((progress, index) => {
      if (progress.selectedWords.length > 0 && progress.userSentence) {
        const wordSet = wordSets[index];
        exercises.push({
          category: wordSet.category,
          difficulty: wordSet.difficulty,
          selectedWords: progress.selectedWords,
          userSentence: progress.userSentence,
          // Add feedback if available
          feedback: progress.feedback || null
        });
      }
    });
    
    // Only proceed if we have at least one completed exercise
    if (exercises.length === 0) {
      toast({
        title: "No completed exercises",
        description: "Please complete at least one exercise before finishing.",
        variant: "destructive",
      });
      return;
    }
    
    // Save successfully completed exercises to the user's learned words
    try {
      let successfulExercises = 0;
      
      for (let i = 0; i < wordSetProgress.length; i++) {
        const progress = wordSetProgress[i];
        
        // Only save exercises with successful feedback
        if (progress.feedbackType === "success" && progress.selectedWords.length > 0) {
          const wordSet = wordSets[i];
          
          // Create a word object for each selected word in the exercise
          for (const word of progress.selectedWords) {
            const wordObj = {
              word: word,
              definition: "Used correctly in a word association exercise",
              partOfSpeech: "various",
              synonyms: [],
              antonyms: [],
              examples: [progress.userSentence],
              mnemonic: "",
              difficulty: "medium",
              hints: []
            };
            
             saveLearnedWord(wordObj, {
              mastery: 75, // Medium-high mastery for word association
              lastPracticed: new Date(),
            });
            
            // Increment word learned counter for each word in successful exercises
             incrementWordLearned();
          }
          
          successfulExercises++;
        }
      }
      
      // Increment exercise completed once for the whole session if at least one exercise was successful
      if (successfulExercises > 0) {
         incrementExerciseCompleted(25); // Award 25 points for completing the exercise
      }
    } catch (error) {
      console.error("Error saving learned words:", error);
      toast({
        title: "Error saving progress",
        description: "Your progress couldn't be saved, but your feedback will still be available.",
        variant: "destructive",
      });
    }
    
    // IMPORTANT: Clear any previous results first to prevent showing old data
    localStorage.removeItem('wordAssociationResults');
    
    // Store the exercises in localStorage to be processed by the feedback page
    localStorage.setItem('wordAssociationExercises', JSON.stringify(exercises));
    
    // Navigate to feedback page
    router.push('/learn-practice/word-association/feedback');
  }

  const handleChangeDifficulty = (difficulty: "easy" | "medium" | "hard" | null) => {
    setSelectedDifficulty(difficulty)
    setCurrentIndex(0)
    setSelectedWords([])
    setUserSentence("")
    setFeedback(null)
    setFeedbackType(null)
    setTimeLeft(null)
    setTimerActive(false)
    setShowAlternatives(false)
    setAlternativeSentences([])

    isInitialized.current = false;
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Word Association", href: "/learn-practice/word-association", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating word association exercises...</p>
        </div>
      </div>
    )
  }

  if (wordSets.length === 0) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Word Association", href: "/learn-practice/word-association", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">No word sets available. Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
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

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            Word Association: {currentWordSet.category}
          </CardTitle>
          <p className="text-muted-foreground">
            Select 2-3 words from below and create a sentence that connects them meaningfully.
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

          {/* Action buttons for Reset and Check */}
          <div className="flex justify-between">
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
            
            {!feedbackType && (
              <Button onClick={handleSubmit} disabled={selectedWords.length < 2 || !userSentence.trim()}>
                <span className="flex items-center">
                  {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  <span style={{ minWidth: '100px' }}>{isChecking ? "Checking..." : "Check Sentence"}</span>
                </span>
              </Button>
            )}
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

          {feedbackType === "success" && !showAlternatives && alternativeSentences.length > 0 && (
            <Button variant="outline" onClick={() => setShowAlternatives(true)}>
              <Lightbulb className="mr-2 h-4 w-4" />
              Show Alternative Sentences
            </Button>
          )}

          {showAlternatives && alternativeSentences.length > 0 && (
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
        <CardFooter className="flex justify-between pt-6">
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
              <Button onClick={handleNextSet}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )
          }
        </CardFooter>
      </Card>
    </div>
  )
}