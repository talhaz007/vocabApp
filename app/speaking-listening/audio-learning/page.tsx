"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Volume2, Play, Pause, SkipForward, SkipBack, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AudioWord {
  id: string
  word: string
  definition: string
  example: string
  audioAccents: string[] // In a real app, these would be URLs to audio files
  difficulty: "easy" | "medium" | "hard"
}

// Sample audio words
const audioWords: AudioWord[] = [
  {
    id: "1",
    word: "Eloquent",
    definition: "Fluent or persuasive in speaking or writing",
    example: "She gave an eloquent speech that moved the entire audience.",
    audioAccents: ["American", "British", "Australian"],
    difficulty: "medium",
  },
  {
    id: "2",
    word: "Ephemeral",
    definition: "Lasting for a very short time",
    example: "The ephemeral beauty of cherry blossoms lasts only a few days.",
    audioAccents: ["American", "British", "Australian"],
    difficulty: "hard",
  },
  {
    id: "3",
    word: "Perseverance",
    definition: "Persistence in doing something despite difficulty",
    example: "Her perseverance in the face of obstacles led to her ultimate success.",
    audioAccents: ["American", "British", "Australian"],
    difficulty: "medium",
  },
  {
    id: "4",
    word: "Ubiquitous",
    definition: "Present, appearing, or found everywhere",
    example: "Smartphones have become ubiquitous in modern society.",
    audioAccents: ["American", "British", "Australian"],
    difficulty: "hard",
  },
  {
    id: "5",
    word: "Serendipity",
    definition: "The occurrence of events by chance in a happy or beneficial way",
    example: "Finding his dream job while on vacation was pure serendipity.",
    audioAccents: ["American", "British", "Australian"],
    difficulty: "medium",
  },
]

export default function AudioLearningPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAccent, setSelectedAccent] = useState<string>("American")
  const [isPlaying, setIsPlaying] = useState(false)
  const [mode, setMode] = useState<"learn" | "test">("learn")
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentIndex + 1) / audioWords.length) * 100)
  }, [currentIndex])

  const speakWord = () => {
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(audioWords[currentIndex].word)

    // Set voice based on accent (this is a simplification)
    const voices = window.speechSynthesis.getVoices()
    if (selectedAccent === "British") {
      const britishVoice = voices.find((voice) => voice.lang.includes("en-GB"))
      if (britishVoice) utterance.voice = britishVoice
    } else if (selectedAccent === "Australian") {
      const ausVoice = voices.find((voice) => voice.lang.includes("en-AU"))
      if (ausVoice) utterance.voice = ausVoice
    }

    utterance.rate = playbackRate
    utterance.onend = () => setIsPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  const speakExample = () => {
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(audioWords[currentIndex].example)

    // Set voice based on accent (this is a simplification)
    const voices = window.speechSynthesis.getVoices()
    if (selectedAccent === "British") {
      const britishVoice = voices.find((voice) => voice.lang.includes("en-GB"))
      if (britishVoice) utterance.voice = britishVoice
    } else if (selectedAccent === "Australian") {
      const ausVoice = voices.find((voice) => voice.lang.includes("en-AU"))
      if (ausVoice) utterance.voice = ausVoice
    }

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

  const handleAccentChange = (value: string) => {
    setSelectedAccent(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const currentWord = audioWords[currentIndex].word.toLowerCase()
    const userWord = userAnswer.toLowerCase().trim()

    if (userWord === currentWord) {
      setIsCorrect(true)
      toast({
        title: "Correct!",
        description: "You identified the word correctly!",
      })
    } else {
      setIsCorrect(false)
      toast({
        title: "Not quite right",
        description: "Listen again and try once more.",
        variant: "destructive",
      })
    }
  }

  const handleNext = () => {
    if (currentIndex < audioWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer("")
      setIsCorrect(null)
    } else {
      toast({
        title: "Exercise complete!",
        description: "You've completed all audio learning exercises.",
      })
      // Reset for a new session
      setCurrentIndex(0)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setUserAnswer("")
      setIsCorrect(null)
    }
  }

  const currentWord = audioWords[currentIndex]

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Speaking & Listening", href: "/speaking-listening", active: false },
          { label: "Audio Learning", href: "/speaking-listening/audio-learning", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audio Learning</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {audioWords.length}
          </span>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Listen and Learn</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setMode(mode === "learn" ? "test" : "learn")}>
              Switch to {mode === "learn" ? "Test" : "Learn"} Mode
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <label htmlFor="accent" className="text-sm font-medium">
                Select Accent
              </label>
              <Select value={selectedAccent} onValueChange={handleAccentChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select accent" />
                </SelectTrigger>
                <SelectContent>
                  {currentWord.audioAccents.map((accent) => (
                    <SelectItem key={accent} value={accent}>
                      {accent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="playbackRate" className="text-sm font-medium">
                Playback Speed
              </label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[playbackRate]}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  onValueChange={handlePlaybackRateChange}
                  className="w-32"
                />
                <span className="text-sm">{playbackRate.toFixed(1)}x</span>
              </div>
            </div>
          </div>

          {mode === "learn" && (
            <>
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold mb-2">{currentWord.word}</h2>
                <p className="text-muted-foreground">{currentWord.definition}</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={isPlaying ? stopSpeaking : speakWord}
                    className="h-12 w-12"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                  <span className="text-sm">Listen to the word</span>
                </div>

                <div className="bg-muted p-4 rounded-md w-full mt-4">
                  <h3 className="font-medium mb-2">Example Sentence</h3>
                  <p className="italic mb-3">{currentWord.example}</p>
                  <Button variant="outline" onClick={speakExample} disabled={isPlaying}>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Listen to example
                  </Button>
                </div>
              </div>
            </>
          )}

          {mode === "test" && (
            <>
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={isPlaying ? stopSpeaking : speakWord}
                  className="h-16 w-16 rounded-full"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">Listen and identify the word</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="answer" className="text-sm font-medium">
                    What word do you hear?
                  </label>
                  <Input
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type the word you hear..."
                    className={
                      isCorrect === true
                        ? "border-green-500 focus-visible:ring-green-500"
                        : isCorrect === false
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                    }
                    disabled={isCorrect === true}
                  />
                </div>

                {isCorrect !== true && (
                  <Button type="submit" disabled={!userAnswer.trim()}>
                    Check Answer
                  </Button>
                )}
              </form>

              {isCorrect === true && (
                <div className="flex items-center gap-2 text-green-600 mt-4">
                  <Check className="h-5 w-5" />
                  <div>
                    <span>Correct! The word is "{currentWord.word}".</span>
                    <p className="text-sm text-green-700 mt-1">{currentWord.definition}</p>
                  </div>
                </div>
              )}

              {isCorrect === false && (
                <div className="flex items-center gap-2 text-red-600 mt-4">
                  <X className="h-5 w-5" />
                  <span>Not quite right. Listen again and try once more.</span>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
            <SkipBack className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {(mode === "learn" || isCorrect === true) && (
            <Button onClick={handleNext}>
              Next
              <SkipForward className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

