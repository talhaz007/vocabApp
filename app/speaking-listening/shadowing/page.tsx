"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, Mic, Square, Play, Pause, ArrowRight, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"

interface ShadowingExercise {
  id: string
  text: string
  difficulty: "easy" | "medium" | "hard"
  focusPoints: string[]
}

// Sample shadowing exercises
const shadowingExercises: ShadowingExercise[] = [
  {
    id: "1",
    text: "The eloquent speaker captivated the audience with her persuasive arguments and clear delivery.",
    difficulty: "medium",
    focusPoints: ["Stress on 'eloquent'", "Natural intonation", "Clear pronunciation of 'captivated'"],
  },
  {
    id: "2",
    text: "The ephemeral nature of social media trends makes it difficult to predict what will be popular next month.",
    difficulty: "hard",
    focusPoints: ["Pronunciation of 'ephemeral'", "Rhythm of the sentence", "Linking sounds between words"],
  },
  {
    id: "3",
    text: "With perseverance and dedication, you can overcome even the most challenging obstacles in your path.",
    difficulty: "medium",
    focusPoints: ["Stress on 'perseverance'", "Pacing throughout the sentence", "Clear articulation of 'challenging'"],
  },
  {
    id: "4",
    text: "Technology has become ubiquitous in modern society, transforming how we work, learn, and communicate.",
    difficulty: "hard",
    focusPoints: ["Pronunciation of 'ubiquitous'", "Smooth transitions between phrases", "Natural rhythm"],
  },
  {
    id: "5",
    text: "Finding your perfect career often involves a bit of serendipity along with careful planning and preparation.",
    difficulty: "medium",
    focusPoints: ["Pronunciation of 'serendipity'", "Intonation pattern", "Stress on key words"],
  },
]

export default function ShadowingPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentIndex + 1) / shadowingExercises.length) * 100)
  }, [currentIndex])

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
      // In a real app, this would send the audio to a speech-to-text service
      // and then compare it with the original text

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate random feedback (in a real app, this would be based on actual analysis)
      const randomScore = Math.random()

      if (randomScore > 0.7) {
        setFeedbackType("success")
        setFeedback(
          "Excellent shadowing! Your pronunciation, rhythm, and intonation closely match the original. Keep practicing to maintain this level.",
        )
      } else {
        setFeedbackType("error")
        setFeedback(
          "Good effort! Try to focus more on matching the rhythm and intonation of the original. Pay special attention to the stress patterns and linking between words.",
        )
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
      setCurrentIndex(currentIndex + 1)
      setAudioURL(null)
      setFeedback(null)
      setFeedbackType(null)
      setIsProcessing(false)
    } else {
      toast({
        title: "All exercises completed!",
        description: "You've completed all shadowing exercises.",
      })
    }
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {shadowingExercises.length}
          </span>
          <Progress value={progress} className="w-32" />
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
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            Previous Exercise
          </Button>

          {feedbackType && (
            <Button onClick={handleNext}>
              Next Exercise
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

