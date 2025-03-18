"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Volume2, Repeat, Check, X, ArrowRight, HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { generateRandomWord, type WordDetails } from "@/lib/ai-word-service"

interface SoundMnemonic {
  id: string
  word: string
  definition: string
  mnemonic: string
  soundDescription: string
  difficulty: "easy" | "medium" | "hard"
}

export default function SoundMnemonicsPage() {
  const router = useRouter()
  const [soundMnemonics, setSoundMnemonics] = useState<SoundMnemonic[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<"learn" | "practice">("learn")
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const { toast } = useToast()
  const isInitialized = useRef(false)

  useEffect(() => {
    async function loadSoundMnemonics() {
      setIsLoading(true)
      try {
        const newMnemonics: SoundMnemonic[] = []
        
        // Generate 5 mnemonics sequentially
        for (let i = 0; i < 5; i++) {
          const word = await generateRandomWord({ 
            difficulty: selectedDifficulty || undefined,
            mnemonicType: "sound" // Add this flag to request sound-based single word mnemonics
          })
          
          // Extract just the mnemonic word from the full description
          let mnemonicWord = word.mnemonic.split(":")[0].trim()
          // Further clean up to ensure we get just a single word
          mnemonicWord = mnemonicWord.split(" ")[0].replace(/[^a-zA-Z]/g, "")
          
          const mnemonic: SoundMnemonic = {
            id: `generated-${i}`,
            word: word.word,
            definition: word.definition,
            mnemonic: word.mnemonic,
            soundDescription: word.mnemonic,
            difficulty: word.difficulty
          }
          newMnemonics.push(mnemonic)
          
          // Show the first mnemonic immediately and stop loading indicator
          if (i === 0) {
            setSoundMnemonics([mnemonic])
            setIsLoading(false)
          } else {
            // Update with all mnemonics generated so far
            setSoundMnemonics([...newMnemonics])
          }
        }
        
        toast({
          title: "Sound mnemonics loaded",
          description: "Your personalized vocabulary words are ready to learn",
        })
      } catch (error) {
        console.error("Error loading sound mnemonics:", error)
        toast({
          title: "Error loading mnemonics",
          description: "Please try again later",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }
    
    if (!isInitialized.current) {
      isInitialized.current = true
      loadSoundMnemonics()
    }
  }, [selectedDifficulty, toast])

  useEffect(() => {
    // Update progress when current index changes
    if (soundMnemonics.length > 0) {
      setProgress(((currentIndex + 1) / soundMnemonics.length) * 100)
    }
  }, [currentIndex, soundMnemonics.length])

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(soundMnemonics[currentIndex].word)
    utterance.rate = 0.9 // Slightly slower for better clarity
    window.speechSynthesis.speak(utterance)
  }

  const speakMnemonic = () => {
    const utterance = new SpeechSynthesisUtterance(soundMnemonics[currentIndex].mnemonic)
    utterance.rate = 0.9 // Slightly slower for better clarity
    window.speechSynthesis.speak(utterance)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const currentMnemonic = soundMnemonics[currentIndex].mnemonic.toLowerCase()
    const userMnemonic = userAnswer.toLowerCase().trim()

    if (userMnemonic === currentMnemonic) {
      setIsCorrect(true)
      toast({
        title: "Correct!",
        description: "You remembered the sound mnemonic!",
      })
    } else {
      setIsCorrect(false)
      toast({
        title: "Not quite right",
        description: "Try again or use a hint.",
        variant: "destructive",
      })
    }
  }

  const handleNext = () => {
    if (currentIndex < 4) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer("")
      setIsCorrect(null)
      setShowHint(false)
    } else {
      // Switch modes or complete exercise
      if (mode === "learn") {
        setMode("practice")
        setCurrentIndex(0)
        toast({
          title: "Learning complete!",
          description: "Now let's practice recalling the mnemonics.",
        })
      } else {
        toast({
          title: "Exercise complete!",
          description: "You've completed the sound mnemonics exercise.",
        })
        // Reset for a new session
        setMode("learn")
        setCurrentIndex(0)
      }
    }
  }

  const handleChangeDifficulty = (difficulty: "easy" | "medium" | "hard" | null) => {
    setSelectedDifficulty(difficulty)
    setCurrentIndex(0)
    setUserAnswer("")
    setIsCorrect(null)
    setShowHint(false)
    // Reset initialization flag to trigger mnemonics reload
    isInitialized.current = false
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Memory", href: "/memory", active: false },
            { label: "Sound Mnemonics", href: "/memory/sound-mnemonics", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating sound mnemonics...</p>
        </div>
      </div>
    )
  }

  if (soundMnemonics.length === 0) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Memory", href: "/memory", active: false },
            { label: "Sound Mnemonics", href: "/memory/sound-mnemonics", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">No sound mnemonics available. Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const handleFinish = () => {
    router.push("/memory")
  }

  const currentMnemonic = soundMnemonics[currentIndex]

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Memory", href: "/memory", active: false },
          { label: "Sound Mnemonics", href: "/memory/sound-mnemonics", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sound Mnemonics</h1>
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
          <CardTitle className="flex justify-between items-center">
            <span>{mode === "learn" ? "Learn Sound Mnemonics" : "Recall Sound Mnemonics"}</span>
            <Button variant="outline" size="sm" onClick={() => setMode(mode === "learn" ? "practice" : "learn")}>
              Switch to {mode === "learn" ? "Practice" : "Learn"} Mode
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "learn" && (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">{currentMnemonic.word}</h2>
                  <p className="text-muted-foreground">{currentMnemonic.definition}</p>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <Button variant="outline" size="icon" onClick={speakWord}>
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">Listen to the word</span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Sound Mnemonic</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{currentMnemonic.mnemonic}</p>
                    <p className="text-sm text-muted-foreground mt-1">{currentMnemonic.soundDescription}</p>
                  </div>
                  <Button variant="outline" size="icon" onClick={speakMnemonic}>
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-md">
                <h3 className="font-medium mb-2">Practice Saying It</h3>
                <p className="text-sm">
                  Say both the word and its mnemonic out loud several times to create a strong sound association.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="font-medium">{currentMnemonic.word}</span>
                  <span>→</span>
                  <span className="font-medium">{currentMnemonic.mnemonic}</span>
                </div>
              </div>
            </>
          )}

          {mode === "practice" && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">{currentMnemonic.word}</h2>
                <p className="text-muted-foreground">{currentMnemonic.definition}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={speakWord}>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Listen to the word
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="answer" className="text-sm font-medium">
                    What is the sound mnemonic for this word?
                  </label>
                  <Input
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type the mnemonic word..."
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

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowHint(true)}
                    disabled={showHint || isCorrect === true}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Show Hint
                  </Button>

                  {isCorrect !== true && (
                    <Button type="submit" disabled={!userAnswer.trim()}>
                      Check Answer
                    </Button>
                  )}
                </div>
              </form>

              {showHint && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                  <h3 className="font-medium text-amber-800 mb-1">Hint</h3>
                  <p className="text-amber-700">{currentMnemonic.soundDescription}</p>
                  <p className="text-amber-700 mt-2">
                    The mnemonic starts with "{currentMnemonic.mnemonic.charAt(0)}" and has{" "}
                    {currentMnemonic.mnemonic.length} letters.
                  </p>
                </div>
              )}

              {isCorrect === true && (
                <div className="flex items-center gap-2 text-green-600 mt-4">
                  <Check className="h-5 w-5" />
                  <span>Correct! The mnemonic is "{currentMnemonic.mnemonic}".</span>
                </div>
              )}

              {isCorrect === false && (
                <div className="flex items-center gap-2 text-red-600 mt-4">
                  <X className="h-5 w-5" />
                  <span>Not quite right. Try using the hint to help you remember.</span>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          {mode === "learn" || isCorrect === true ? (
            <Button onClick={handleNext} disabled={currentIndex === soundMnemonics.length - 1 && currentIndex < 4} className="w-full">
              {currentIndex < 4 ? "Next Word" : mode === "learn" ? "Start Practice" : "Finish"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setMode("learn")}>
                <Repeat className="mr-2 h-4 w-4" />
                Review This Word
              </Button>

              {currentIndex === 4 ?
                <Button onClick={handleFinish}>
                  Finish
                </Button>
              :
                <Button onClick={handleNext}>
                  Next
                </Button>
              }
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

