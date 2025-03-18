"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mic, Volume2, Play, Square, RotateCcw, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { generateRandomWord, saveLearnedWord, checkPronunciation, type WordDetails } from "@/lib/ai-word-service"

interface PronunciationWord {
  id: string
  word: string
  phonetic: string
  tips: string[]
  difficulty: "easy" | "medium" | "hard"
}

// Sample pronunciation words
const pronunciationWords: PronunciationWord[] = [
  {
    id: "1",
    word: "Eloquent",
    phonetic: "/ˈɛləkwənt/",
    tips: ["Break it down: EL-oh-kwent", "Stress the first syllable", "The 'qu' sounds like 'kw'"],
    difficulty: "medium",
  },
  {
    id: "2",
    word: "Ephemeral",
    phonetic: "/əˈfɛmərəl/",
    tips: ["Break it down: eh-FEM-er-uhl", "Stress the second syllable", "The 'ph' sounds like 'f'"],
    difficulty: "hard",
  },
  {
    id: "3",
    word: "Perseverance",
    phonetic: "/ˌpɜrsəˈvɪrəns/",
    tips: ["Break it down: per-suh-VEER-uhns", "Stress the third syllable", "The 'ance' sounds like 'uhns'"],
    difficulty: "medium",
  },
  {
    id: "4",
    word: "Ubiquitous",
    phonetic: "/juˈbɪkwɪtəs/",
    tips: ["Break it down: yoo-BIK-wih-tuhs", "Stress the second syllable", "The 'qu' sounds like 'kw'"],
    difficulty: "hard",
  },
  {
    id: "5",
    word: "Serendipity",
    phonetic: "/ˌsɛrənˈdɪpɪti/",
    tips: ["Break it down: ser-uhn-DIP-ih-tee", "Stress the third syllable", "The 'i' in 'dip' is short"],
    difficulty: "medium",
  },
]

export default function PronunciationPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)
  const [progress, setProgress] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const [pronunciationWords, setPronunciationWords] = useState<PronunciationWord[]>([])
  const isInitialized = useRef(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const [pronunciationProgress, setPronunciationProgress] = useState(() => 
    Array(5).fill({
      audioURL: null,
      feedback: null,
      feedbackType: null,
      isProcessing: false,
    })
  );

  useEffect(() => {
    async function loadPronunciationWords() {
      setIsLoading(true)
      try {
        const newWords: PronunciationWord[] = []
        
        // Generate 5 words sequentially
        for (let i = 0; i < 5; i++) {
          const word = await generateRandomWord({ difficulty: selectedDifficulty || undefined })
          const pronunciationWord: PronunciationWord = {
            id: `word-${i}`,
            word: word.word,
            // Use the phonetic transcription from the API if available
            phonetic: word.phonetic || `/ˈ${word.word.toLowerCase()}/`,
            // Use pronunciation tips if available, otherwise fall back to hints
            tips: word.pronunciationTips || word.hints.slice(0, 3),
            difficulty: word.difficulty as "easy" | "medium" | "hard"
          }
          newWords.push(pronunciationWord)
          
          // Show the first word immediately and stop loading indicator
          if (i === 0) {
            setPronunciationWords([pronunciationWord])
            setIsLoading(false)
          } else {
            // Update with all words generated so far
            setPronunciationWords([...newWords])
          }
        }
        
        toast({
          title: "Pronunciation words loaded",
          description: "Your pronunciation exercises are ready",
        })
      } catch (error) {
        console.error("Error loading pronunciation words:", error)
        toast({
          title: "Error loading words",
          description: "Please try again later",
          variant: "destructive",
        })
        setIsLoading(false)
        // Fall back to sample words if loading fails
        setPronunciationWords(samplePronunciationWords)
      }
    }

    if (!isInitialized.current) {
      isInitialized.current = true
      loadPronunciationWords()
    }
  }, [selectedDifficulty, toast])

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentIndex + 1) / pronunciationWords.length) * 100)
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
        description: "Processing your pronunciation...",
      })
    }
  }

  const playReference = () => {
    const utterance = new SpeechSynthesisUtterance(pronunciationWords[currentIndex].word)
    utterance.rate = playbackRate
    window.speechSynthesis.speak(utterance)
  }

  const handlePlaybackRateChange = (value: number[]) => {
    setPlaybackRate(value[0])
  }

  const handlePlayRecording = () => {
    if (audioRef.current && audioURL) {
      audioRef.current.play()
    }
  }

  const handleNextWord = () => {
    if (currentIndex < pronunciationWords.length - 1) {
      const updatedProgress = [...pronunciationProgress];
      updatedProgress[currentIndex] = {
        audioURL,
        feedback,
        feedbackType,
        isProcessing,
      };
      setPronunciationProgress(updatedProgress);

      const nextProgress = updatedProgress[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setAudioURL(nextProgress.audioURL);
      setFeedback(nextProgress.feedback);
      setFeedbackType(nextProgress.feedbackType);
      setIsProcessing(nextProgress.isProcessing);
    } else {
      toast({
        title: "Practice complete!",
        description: "You've completed all pronunciation exercises.",
      })
    }
  }

  const handlePreviousWord = () => {
    if (currentIndex > 0) {
      const updatedProgress = [...pronunciationProgress];
      updatedProgress[currentIndex] = {
        audioURL,
        feedback,
        feedbackType,
        isProcessing,
      };
      setPronunciationProgress(updatedProgress);

      const prevProgress = updatedProgress[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setAudioURL(prevProgress.audioURL);
      setFeedback(prevProgress.feedback);
      setFeedbackType(prevProgress.feedbackType);
      setIsProcessing(prevProgress.isProcessing);
    }
  }

  const handleReset = () => {
    setAudioURL(null)
    setFeedback(null)
    setFeedbackType(null)
  }

  const handleChangeDifficulty = (difficulty: "easy" | "medium" | "hard" | null) => {
    setSelectedDifficulty(difficulty)
    setCurrentIndex(0)
    setAudioURL(null)
    setFeedback(null)
    setFeedbackType(null)
    isInitialized.current = false
  }

  const analyzePronunciation = async () => {
    if (!audioURL) return

    setIsProcessing(true)
    try {
      const currentWord = pronunciationWords[currentIndex].word
      const result = await checkPronunciation(currentWord, audioURL)

      if (result.accuracy > 0.7) {
        setFeedbackType("success")
        setFeedback(result.feedback || "Great pronunciation! You said it correctly.")
        
        // Save the word as learned
        try {
          saveLearnedWord(
            {
              word: currentWord,
              definition: "Practiced pronunciation",
              mnemonic: "",
              difficulty: pronunciationWords[currentIndex].difficulty,
              hints: pronunciationWords[currentIndex].tips,
              examples: [],
              synonyms: [],
              antonyms: []
            },
            {
              mastery: result.accuracy * 100,
              lastPracticed: new Date(),
              notes: "Practiced in pronunciation exercise"
            }
          )
        } catch (error) {
          console.error("Error saving pronunciation progress:", error)
        }
      } else {
        setFeedbackType("error")
        setFeedback(result.feedback || "Try again with the pronunciation tips below.")
      }
    } catch (error) {
      toast({
        title: "Error analyzing pronunciation",
        description: "Please try again later",
        variant: "destructive",
      })
      setFeedback("Unable to analyze pronunciation at this time.")
      setFeedbackType("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFinish = () => {
    // Navigate back to the learn-practice page using Next.js router
    router.push("/speaking-listening")
  }

  const currentWord = pronunciationWords[currentIndex]

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Speaking & Listening", href: "/speaking-listening", active: false },
            { label: "Pronunciation", href: "/speaking-listening/pronunciation", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating pronunciation exercises...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Speaking & Listening", href: "/speaking-listening", active: false },
          { label: "Pronunciation", href: "/speaking-listening/pronunciation", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pronunciation Coach</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of 5
          </span>
          {/* <Progress value={progress} className="w-32" /> */}
          
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
          <CardTitle className="text-4xl text-center">{currentWord.word}</CardTitle>
          <p className="text-center text-muted-foreground">{currentWord.phonetic}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={playReference}>
                <Volume2 className="h-4 w-4" />
              </Button>
              <div className="flex flex-col gap-1 w-48">
                <span className="text-xs text-muted-foreground">Playback Speed</span>
                <Slider
                  value={[playbackRate]}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  onValueChange={handlePlaybackRateChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slow</span>
                  <span>{playbackRate.toFixed(1)}x</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              {!isRecording ? (
                <Button onClick={startRecording} disabled={isRecording} className="bg-red-500 hover:bg-red-600">
                  <Mic className="mr-2 h-4 w-4" />
                  Record Your Pronunciation
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
                  <Button variant="outline" size="icon" onClick={handlePlayRecording}>
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button onClick={analyzePronunciation} disabled={isProcessing}>
                    {isProcessing ? "Analyzing..." : "Check Pronunciation"}
                  </Button>
                </div>
              </div>
            )}

            {feedback && (
              <div
                className={`mt-4 p-4 rounded-md w-full ${
                  feedbackType === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {feedbackType === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-medium ${feedbackType === "success" ? "text-green-800" : "text-red-800"}`}>
                      {feedbackType === "success" ? "Well done!" : "Keep practicing"}
                    </h3>
                    <p className={feedbackType === "success" ? "text-green-700" : "text-red-700"}>{feedback}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Pronunciation Tips</h3>
            <ul className="space-y-2">
              {currentWord.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-muted h-5 w-5 text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousWord}
            disabled={currentIndex === 0}
          >
            Previous Word
          </Button>
          {currentIndex === 4 ? (
            <Button onClick={handleFinish} variant="default">
              Finish
            </Button>
          ) : (
            <Button onClick={handleNextWord} disabled={currentIndex === pronunciationWords.length - 1}>
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

const samplePronunciationWords: PronunciationWord[] = [
  // ... existing sample words ...
]

