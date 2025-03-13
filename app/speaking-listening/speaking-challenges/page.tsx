"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, Square, Image, MessageSquare, Check, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SpeakingChallenge {
  id: string
  type: "image" | "question"
  content: string
  imageUrl?: string
  targetWords: string[]
  difficulty: "easy" | "medium" | "hard"
}

// Sample speaking challenges
const speakingChallenges: SpeakingChallenge[] = [
  {
    id: "1",
    type: "image",
    content: "Describe this cityscape using at least 3 of the target words.",
    imageUrl: "/placeholder.svg?height=300&width=500",
    targetWords: ["Bustling", "Skyline", "Urban", "Towering", "Vibrant"],
    difficulty: "medium",
  },
  {
    id: "2",
    type: "question",
    content: "What are the benefits of learning a foreign language?",
    targetWords: ["Cognitive", "Cultural", "Perspective", "Enhance", "Opportunity"],
    difficulty: "medium",
  },
  {
    id: "3",
    type: "image",
    content: "Describe this natural landscape and how it makes you feel.",
    imageUrl: "/placeholder.svg?height=300&width=500",
    targetWords: ["Serene", "Majestic", "Breathtaking", "Tranquil", "Awe"],
    difficulty: "easy",
  },
  {
    id: "4",
    type: "question",
    content: "How might technology change education in the next decade?",
    targetWords: ["Innovation", "Transform", "Implement", "Virtual", "Accessible"],
    difficulty: "hard",
  },
  {
    id: "5",
    type: "image",
    content: "Describe what might be happening in this social gathering.",
    imageUrl: "/placeholder.svg?height=300&width=500",
    targetWords: ["Interaction", "Convivial", "Animated", "Engaging", "Sociable"],
    difficulty: "medium",
  },
]

export default function SpeakingChallengesPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [detectedWords, setDetectedWords] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentIndex + 1) / speakingChallenges.length) * 100)
  }, [currentIndex])

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
        description: "Speak clearly into your microphone",
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
        description: "Processing your response...",
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
    setDetectedWords([])
  }

  const analyzeResponse = async () => {
    if (!audioURL) return

    setIsProcessing(true)
    try {
      // In a real app, this would send the audio to a speech-to-text service
      // and then analyze the text for the target words

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const currentChallenge = speakingChallenges[currentIndex]

      // Simulate detected words (randomly select 2-4 target words)
      const shuffled = [...currentChallenge.targetWords].sort(() => 0.5 - Math.random())
      const detected = shuffled.slice(0, Math.floor(Math.random() * 3) + 2)
      setDetectedWords(detected)

      // Generate feedback based on detected words
      if (detected.length >= 3) {
        setFeedback(
          "Excellent job! You used several target vocabulary words effectively. Your response was clear and well-structured.",
        )
      } else if (detected.length >= 1) {
        setFeedback(
          "Good effort! You used some target vocabulary. Try to incorporate more of the suggested words in your next response.",
        )
      } else {
        setFeedback(
          "You didn't use any of the target vocabulary words. Try to practice incorporating these words into your speech.",
        )
      }
    } catch (error) {
      toast({
        title: "Error analyzing response",
        description: "Please try again later",
        variant: "destructive",
      })
      setFeedback("Unable to analyze response at this time.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNextChallenge = () => {
    if (currentIndex < speakingChallenges.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAudioURL(null)
      setFeedback(null)
      setDetectedWords([])
      setIsProcessing(false)
    } else {
      toast({
        title: "All challenges completed!",
        description: "You've completed all speaking challenges.",
      })
    }
  }

  const currentChallenge = speakingChallenges[currentIndex]

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb items={[
        { label: "Speaking & Listening", href: "/speaking-listening", active: false },
        { label: "Speaking Challenges", href: "/speaking-listening/speaking-challenges", active: true }
      ]} />

      <div className="flex justify-  active: true }
      ]} />

      <div className=\"flex justify-between items-center">
        <h1 className="text-3xl font-bold">Speaking Challenges</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {speakingChallenges.length}
          </span>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Speak Using Target Vocabulary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="challenge" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="challenge">Challenge</TabsTrigger>
              <TabsTrigger value="vocabulary">Target Vocabulary</TabsTrigger>
            </TabsList>
            <TabsContent value="challenge" className="space-y-4 pt-4">
              {currentChallenge.type === "image" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                    <img 
                      src={currentChallenge.imageUrl || "/placeholder.svg"} 
                      alt="Challenge image" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-center font-medium">{currentChallenge.content}</p>
                </div>
              )}
              
              {currentChallenge.type === "question" && (
                <div className="bg-muted p-6 rounded-md text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium">{currentChallenge.content}</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="vocabulary" className="pt-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-3">Try to use these words in your response:</h3>
                <div className="flex flex-wrap gap-2">
                  {currentChallenge.targetWords.map((word) => (
                    <div 
                      key={word} 
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        detectedWords.includes(word) 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-primary/10 border border-primary/20"
                      }`}
                    >
                      {word}
                      {detectedWords.includes(word) && <Check className="inline ml-1 h-3 w-3" />}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col items-center gap-4">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={isRecording} className="bg-red-500 hover:bg-red-600">
                <Mic className="mr-2 h-4 w-4" />
                Record Your Response
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">
                <Square className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>

          {audioURL && (
            <div className="flex flex-col items-center gap-4 mt-4 w-full">
              <audio ref={audioRef} src={audioURL} className="hidden" />
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handlePlayRecording}>
                  <Image className="mr-2 h-4 w-4" />
                  Play Recording
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button onClick={analyzeResponse} disabled={isProcessing}>
                  {isProcessing ? "Analyzing..." : "Analyze Response"}
                </Button>
              </div>
            </div>
          )}

          {feedback && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Feedback</h3>
              <p>{feedback}</p>
              
              {detectedWords.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-sm">Words detected in your response:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {detectedWords.map((word) => (
                      <div 
                        key={word} 
                        className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            Previous Challenge
          </Button>
          
          {feedback && (
            <Button onClick={handleNextChallenge}>
              Next Challenge
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

