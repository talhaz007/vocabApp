"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Volume2, Mic, Square, Play, Pause, ArrowRight, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateRandomWord, saveLearnedWord, generateShadowingExercise, checkShadowingPronunciation, type WordDetails } from "@/lib/ai-word-service"

interface ShadowingExercise {
  id: string
  text: string
  difficulty: "easy" | "medium" | "hard"
  focusPoints: string[]
  keywords: string[]
  category: string
}

// Sample shadowing exercises for fallback
const shadowingExercises: ShadowingExercise[] = [
  {
    id: "1",
    text: "The eloquent speaker captivated the audience with her persuasive arguments and clear delivery.",
    difficulty: "medium",
    focusPoints: ["Stress on 'eloquent'", "Natural intonation", "Clear pronunciation of 'captivated'"],
    keywords: ["eloquent", "persuasive", "captivated"],
    category: "Eloquent Speaker",
  },
  // ... other sample exercises
]

export default function ShadowingPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const [shadowingExercises, setShadowingExercises] = useState<ShadowingExercise[]>([])
  const isInitialized = useRef(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const [shadowingProgress, setShadowingProgress] = useState(() => 
    Array(5).fill({
      audioURL: null,
      feedback: null,
      feedbackType: null,
      isProcessing: false,
    })
  );

  // Load initial shadowing exercises
  useEffect(() => {
    async function loadShadowingExercises() {
      setIsLoading(true)
      try {
        const newExercises: ShadowingExercise[] = []
        // Keep track of categories we've already generated to avoid duplicates
        const usedCategories: string[] = []
        
        // Generate 5 exercises sequentially
        for (let i = 0; i < 5; i++) {
          const exercise = await generateShadowingExercise({ 
            difficulty: selectedDifficulty || undefined,
            category: usedCategories.length > 0 ? undefined : undefined // Don't specify category to get variety
          })
          
          // Add this category to used categories for future generations
          if (exercise.category) {
            usedCategories.push(exercise.category)
          }
          
          const shadowingExercise: ShadowingExercise = {
            id: `exercise-${i}`,
            text: exercise.text,
            difficulty: exercise.difficulty,
            focusPoints: exercise.focusPoints,
            keywords: exercise.keywords,
            category: exercise.category
          }
          newExercises.push(shadowingExercise)
          
          // Show the first exercise immediately and stop loading indicator
          if (i === 0) {
            setShadowingExercises([shadowingExercise])
            setIsLoading(false)
          } else {
            // Update with all exercises generated so far
            setShadowingExercises([...newExercises])
          }
        }
        
        toast({
          title: "Shadowing exercises loaded",
          description: "Your shadowing exercises are ready",
        })
      } catch (error) {
        console.error("Error loading shadowing exercises:", error)
        toast({
          title: "Error loading exercises",
          description: "Please try again later",
          variant: "destructive",
        })
        setIsLoading(false)
        // Fall back to sample exercises if loading fails
        setShadowingExercises(shadowingExercises)
      }
    }

    if (!isInitialized.current) {
      isInitialized.current = true
      loadShadowingExercises()
    }
  }, [selectedDifficulty, toast])

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentIndex + 1) / shadowingExercises.length) * 100)
  }, [currentIndex, shadowingExercises.length])

  const handleChangeDifficulty = (difficulty: "easy" | "medium" | "hard" | null) => {
    setSelectedDifficulty(difficulty)
    // Reset and reload exercises with new difficulty
    setCurrentIndex(0)
    setAudioURL(null)
    setFeedback(null)
    setFeedbackType(null)
    isInitialized.current = false
  }

  const speakText = () => {
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(shadowingExercises[currentIndex].text)
    utterance.rate = playbackRate
    utterance.onend = () => setIsPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
  }

  const handlePlaybackRateChange = (value: number[]) => {
    setPlaybackRate(value[0])
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        audioChunksRef.current = []
      }

      audioChunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)

      toast({
        title: "Recording started",
        description: "Shadow the text by repeating it aloud",
      })
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use this feature",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all tracks on the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }

      toast({
        title: "Recording stopped",
        description: "Processing your shadowing...",
      })
    }
  }

  const handlePlayRecording = () => {
    if (audioRef.current && audioURL) {
      audioRef.current.play()
    }
  }

  const handleReset = () => {
    setAudioURL(null)
    setFeedback(null)
    setFeedbackType(null)
  }

  const analyzeShadowing = async () => {
    if (!audioURL) return

    setIsProcessing(true)
    try {
      // Use the checkPronunciation function to evaluate the shadowing
      const currentExercise = shadowingExercises[currentIndex]
      const result = await checkShadowingPronunciation(
        currentExercise.text, 
        audioURL
      )

      if (result.accuracy > 0.7) {
        setFeedbackType("success")
        setFeedback(result.feedback || "Excellent shadowing! Your pronunciation and rhythm closely match the original.")
        
        // Use the keywords from the exercise instead of extracting words
        const keywords = currentExercise.keywords || []
        
        // Save the keywords as learned words
        try {
          for (const word of keywords) {
            await saveLearnedWord(
              {
                word: word,
                definition: `Key vocabulary from ${currentExercise.category} shadowing exercise`,
                mnemonic: "",
                difficulty: currentExercise.difficulty,
                hints: currentExercise.focusPoints,
                examples: [currentExercise.text],
                synonyms: [],
                antonyms: []
              },
              {
                mastery: result.accuracy * 100,
                lastPracticed: new Date(),
                notes: `Practiced in ${currentExercise.category} shadowing exercise`
              }
            )
          }
          
          toast({
            title: `${keywords.length} keywords saved to your vocabulary`,
            description: "Your shadowing progress has been recorded",
          })
        } catch (error) {
          console.error("Error saving shadowing progress:", error)
        }
      } else {
        setFeedbackType("error")
        setFeedback(result.feedback || "Good effort! Try to focus more on matching the rhythm and intonation of the original.")
      }
    } catch (error) {
      toast({
        title: "Error analyzing shadowing",
        description: "Please try again later",
        variant: "destructive",
      })
      setFeedback("Unable to analyze shadowing at this time.")
      setFeedbackType("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < shadowingExercises.length - 1) {
      const updatedProgress = [...shadowingProgress];
      updatedProgress[currentIndex] = {
        audioURL,
        feedback,
        feedbackType,
        isProcessing,
      };
      setShadowingProgress(updatedProgress);

      const nextProgress = updatedProgress[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setAudioURL(nextProgress.audioURL);
      setFeedback(nextProgress.feedback);
      setFeedbackType(nextProgress.feedbackType);
      setIsProcessing(nextProgress.isProcessing);
    } else {
      toast({
        title: "All exercises completed!",
        description: "You've completed all shadowing exercises.",
      })
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const updatedProgress = [...shadowingProgress];
      updatedProgress[currentIndex] = {
        audioURL,
        feedback,
        feedbackType,
        isProcessing,
      };
      setShadowingProgress(updatedProgress);

      const prevProgress = updatedProgress[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setAudioURL(prevProgress.audioURL);
      setFeedback(prevProgress.feedback);
      setFeedbackType(prevProgress.feedbackType);
      setIsProcessing(prevProgress.isProcessing);
    }
  }

  const handleFinish = () => {
    // Save the exercises to localStorage for feedback generation
    const exercisesToSave = shadowingProgress.map((progress, index) => {
      const exercise = shadowingExercises[index];
      return {
        exerciseType: "shadowing",
        text: exercise.text,
        isCorrect: progress.feedbackType === "success",
        feedback: progress.feedback || "",
        usageQuality: progress.feedbackType === "success" ? "good" : "fair",
        improvementSuggestions: exercise.focusPoints
      };
    });
    
    localStorage.setItem('savedSpeakingListeningExercises', JSON.stringify(exercisesToSave));
    
    // Navigate to the feedback page
    router.push("/speaking-listening/feedback");
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Speaking & Listening", href: "/speaking-listening", active: false },
            { label: "Shadowing", href: "/speaking-listening/shadowing", active: true },
          ]}
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading shadowing exercises...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentExercise = shadowingExercises[currentIndex]

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Speaking & Listening", href: "/speaking-listening", active: false },
          { label: "Shadowing", href: "/speaking-listening/shadowing", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shadowing Practice</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of 5
          </span>
          {/* <Progress value={progress} className="w-32" /> */}
          
          {/* Add difficulty selector */}
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
          <div className="flex justify-between items-center">
            <CardTitle>Shadow and Repeat</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Playback Speed</span>
              <Slider
                value={[playbackRate]}
                min={0.5}
                max={1.5}
                step={0.1}
                onValueChange={handlePlaybackRateChange}
                className="w-32"
              />
              <span className="text-xs font-medium">{playbackRate.toFixed(1)}x</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-lg font-medium leading-relaxed">{currentExercise.text}</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={isPlaying ? stopSpeaking : speakText}
              className="w-full md:w-auto"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Audio
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Listen to Text
                </>
              )}
            </Button>

            <div className="bg-primary/5 p-4 rounded-md w-full">
              <h3 className="font-medium mb-2">Focus Points</h3>
              <ul className="space-y-1">
                {currentExercise.focusPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 h-5 w-5 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Your Turn: Shadow the Text</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Listen to the text first, then click record and shadow (repeat) the text with the same rhythm and
              intonation.
            </p>

            <div className="flex flex-col items-center gap-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={isRecording || isPlaying}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Record Your Shadowing
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive">
                  <Square className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              )}
            </div>
          </div>

          {audioURL && (
            <div className="flex flex-col items-center gap-4 mt-4 w-full">
              <audio ref={audioRef} src={audioURL} className="hidden" />
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handlePlayRecording}>
                  <Play className="mr-2 h-4 w-4" />
                  Play Your Recording
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button onClick={analyzeShadowing} disabled={isProcessing}>
                  {isProcessing ? "Analyzing..." : "Analyze Shadowing"}
                </Button>
              </div>
            </div>
          )}

          {feedback && (
            <div
              className={`p-4 rounded-md ${
                feedbackType === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-amber-50 border border-amber-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {feedbackType === "success" ? (
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <Volume2 className="h-5 w-5 text-amber-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-medium ${feedbackType === "success" ? "text-green-800" : "text-amber-800"}`}>
                    {feedbackType === "success" ? "Excellent Shadowing!" : "Keep Practicing"}
                  </h3>
                  <p className={feedbackType === "success" ? "text-green-700" : "text-amber-700"}>{feedback}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous Exercise
          </Button>

          {
            currentIndex === 4 ?
            <Button onClick={handleFinish}>
              Finish
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            :
            <Button disabled={isProcessing || currentIndex === shadowingExercises.length - 1} onClick={handleNext}>
              Next Exercise
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          }
        </CardFooter>
      </Card>
    </div>
  )
}

