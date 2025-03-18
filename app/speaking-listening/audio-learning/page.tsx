"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Volume2, Play, Pause, SkipForward, SkipBack, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateRandomWord, saveLearnedWord, type WordDetails } from "@/lib/ai-word-service"
import { useRouter } from "next/navigation"

interface AudioWord {
  id: string
  word: string
  definition: string
  example: string
  audioAccents: string[] // In a real app, these would be URLs to audio files
  difficulty: "easy" | "medium" | "hard"
}

// Sample audio words for fallback
const sampleAudioWords: AudioWord[] = [
  {
    id: "1",
    word: "Eloquent",
    definition: "Fluent or persuasive in speaking or writing",
    example: "She gave an eloquent speech that moved the entire audience.",
    audioAccents: ["American", "British", "Australian"],
    difficulty: "medium",
  },
  // ... other sample words
]

export default function AudioLearningPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAccent, setSelectedAccent] = useState<string>("American")
  const [isPlaying, setIsPlaying] = useState(false)
  const [mode, setMode] = useState<"learn" | "test">("learn")
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const [audioWords, setAudioWords] = useState<AudioWord[]>([])
  const isInitialized = useRef(false)
  const { toast } = useToast()

  const [audioLearningProgress, setAudioLearningProgress] = useState(() => 
    Array(5).fill({
      userAnswer: "",
      isCorrect: null,
    })
  );

  // Load initial audio words
  useEffect(() => {
    async function loadAudioWords() {
      setIsLoading(true)
      try {
        const newWords: AudioWord[] = []
        // Keep track of words we've already generated to exclude them
        const excludedWords: string[] = []
        
        // Generate 5 words sequentially
        for (let i = 0; i < 5; i++) {
          const word = await generateRandomWord({ 
            difficulty: selectedDifficulty || undefined,
            excludeWords: excludedWords
          })
          
          // Add this word to excluded words for future generations
          excludedWords.push(word.word)
          
          // Get the first example or create a simple one if none exists
          const example = word.examples && word.examples.length > 0 
            ? word.examples[0] 
            : `The word "${word.word}" is often used in academic contexts.`
          
          const audioWord: AudioWord = {
            id: `word-${i}`,
            word: word.word,
            definition: word.definition,
            example: example,
            audioAccents: ["American", "British", "Australian"], // Standard options
            difficulty: word.difficulty as "easy" | "medium" | "hard"
          }
          newWords.push(audioWord)
          
          // Show the first word immediately and stop loading indicator
          if (i === 0) {
            setAudioWords([audioWord])
            setIsLoading(false)
          } else {
            // Update with all words generated so far
            setAudioWords([...newWords])
          }
        }
        
        toast({
          title: "Audio words loaded",
          description: "Your audio learning exercises are ready",
        })
      } catch (error) {
        console.error("Error loading audio words:", error)
        toast({
          title: "Error loading words",
          description: "Please try again later",
          variant: "destructive",
        })
        setIsLoading(false)
        // Fall back to sample words if loading fails
        setAudioWords(sampleAudioWords)
      }
    }

    if (!isInitialized.current) {
      isInitialized.current = true
      loadAudioWords()
    }
  }, [selectedDifficulty, toast])

  useEffect(() => {
    // Update progress when current index changes
    if (audioWords.length > 0) {
      setProgress(((currentIndex + 1) / audioWords.length) * 100)
    }
  }, [currentIndex, audioWords.length])

  const speakWord = () => {
    if (audioWords.length === 0) return
    
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(audioWords[currentIndex].word)

    // Set voice based on accent
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
    if (audioWords.length === 0) return
    
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(audioWords[currentIndex].example)

    // Set voice based on accent
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (audioWords.length === 0) return

    const currentWord = audioWords[currentIndex].word.toLowerCase()
    const userWord = userAnswer.toLowerCase().trim()

    if (userWord === currentWord) {
      setIsCorrect(true)
      toast({
        title: "Correct!",
        description: "You identified the word correctly!",
      })
      
      // Save the word as learned
      try {
        await saveLearnedWord(
          {
            word: audioWords[currentIndex].word,
            definition: audioWords[currentIndex].definition,
            mnemonic: "",
            difficulty: audioWords[currentIndex].difficulty,
            hints: [],
            examples: [audioWords[currentIndex].example],
            synonyms: [],
            antonyms: []
          },
          {
            mastery: 80, // High mastery since they correctly identified it
            lastPracticed: new Date(),
            notes: "Correctly identified in audio learning exercise"
          }
        )
      } catch (error) {
        console.error("Error saving audio learning progress:", error)
      }
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
      const updatedProgress = [...audioLearningProgress];
      updatedProgress[currentIndex] = {
        userAnswer,
        isCorrect,
      };
      setAudioLearningProgress(updatedProgress);

      const nextProgress = updatedProgress[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setUserAnswer(nextProgress.userAnswer);
      setIsCorrect(nextProgress.isCorrect);
    } else {
      toast({
        title: "Exercise complete!",
        description: "You've completed all audio learning exercises.",
      })
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const updatedProgress = [...audioLearningProgress];
      updatedProgress[currentIndex] = {
        userAnswer,
        isCorrect,
      };
      setAudioLearningProgress(updatedProgress);

      const prevProgress = updatedProgress[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setUserAnswer(prevProgress.userAnswer);
      setIsCorrect(prevProgress.isCorrect);
    }
  }

  const handleChangeDifficulty = (difficulty: "easy" | "medium" | "hard" | null) => {
    setSelectedDifficulty(difficulty)
    setCurrentIndex(0)
    setUserAnswer("")
    setIsCorrect(null)
    isInitialized.current = false
  }

  const handleFinish = () => {
    // Only include exercises that have been attempted (have an answer)
    const exercisesToSave = audioLearningProgress
      .map((progress, index) => {
        // Skip exercises that haven't been attempted
        if (progress.isCorrect === null) return null;
        
        const exercise = audioWords[index];
        return {
          exerciseType: "audioLearning",
          word: exercise.word,
          text: exercise.example,
          isCorrect: progress.isCorrect === true,
          feedback: progress.isCorrect === true 
            ? `Correctly identified the word "${exercise.word}" after hearing it.` 
            : `Had difficulty identifying the word "${exercise.word}" after hearing it.`,
          usageQuality: progress.isCorrect === true ? "good" : "fair"
        };
      })
      .filter(Boolean); // Remove null entries (unattempted exercises)
    
    // Only proceed if there are attempted exercises
    if (exercisesToSave.length > 0) {
      localStorage.setItem('savedSpeakingListeningExercises', JSON.stringify(exercisesToSave));
      router.push("/speaking-listening/feedback");
    } else {
      toast({
        title: "No exercises completed",
        description: "Please complete at least one exercise before getting feedback",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Speaking & Listening", href: "/speaking-listening", active: false },
            { label: "Audio Learning", href: "/speaking-listening/audio-learning", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating audio learning exercises...</p>
        </div>
      </div>
    )
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

          {currentIndex === 4 ? (
            <Button onClick={handleFinish}>
              Finish <Check className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            (
              <Button onClick={handleNext} disabled={currentIndex === audioWords.length - 1}>
                Next
                <SkipForward className="ml-2 h-4 w-4" />
              </Button>
            )
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

