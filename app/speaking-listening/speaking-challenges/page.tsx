"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Mic, Square, MessageSquare, Check, X, ArrowRight, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateWordSet, saveLearnedWord } from "@/lib/ai-word-service"

interface SpeakingChallenge {
  id: string
  question: string
  targetWords: string[]
  difficulty: "easy" | "medium" | "hard"
  category: string
}

export default function SpeakingChallengesPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [detectedWords, setDetectedWords] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null)
  const [speakingChallenges, setSpeakingChallenges] = useState<SpeakingChallenge[]>([])
  const isInitialized = useRef(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Add a state for feedback type
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)

  const [challengeProgress, setChallengeProgress] = useState(() => 
    Array(5).fill({
      audioURL: null,
      feedback: null,
      feedbackType: null,
      detectedWords: [],
      isProcessing: false,
    })
  );

  // Load initial speaking challenges
  useEffect(() => {
    async function loadSpeakingChallenges() {
      setIsLoading(true)
      try {
        const newChallenges: SpeakingChallenge[] = []
        // Keep track of categories we've already generated to avoid duplicates
        const usedCategories: string[] = []
        
        // Generate 5 challenges sequentially
        for (let i = 0; i < 5; i++) {
          const wordSet = await generateWordSet({ 
            difficulty: selectedDifficulty || undefined,
            includeQuestion: true, // Request a question with the word set
            excludeCategories: usedCategories
          })
          
          // Add this category to used categories for future generations
          if (wordSet.category) {
            usedCategories.push(wordSet.category)
          }
          
          const challenge: SpeakingChallenge = {
            id: `challenge-${i}`,
            question: wordSet.question || `Discuss the topic of ${wordSet.category} using the target words.`,
            targetWords: wordSet.words,
            difficulty: wordSet.difficulty,
            category: wordSet.category
          }
          newChallenges.push(challenge)
          
          // Show the first challenge immediately and stop loading indicator
          if (i === 0) {
            setSpeakingChallenges([challenge])
            setIsLoading(false)
          } else {
            // Update with all challenges generated so far
            setSpeakingChallenges([...newChallenges])
          }
        }
        
        toast({
          title: "Speaking challenges loaded",
          description: "Your speaking exercises are ready",
        })
      } catch (error) {
        console.error("Error loading speaking challenges:", error)
        toast({
          title: "Error loading challenges",
          description: "Please try again later",
          variant: "destructive",
        })
        setIsLoading(false)
        // Fall back to sample challenges if loading fails
        setSpeakingChallenges([
          {
            id: "1",
            question: "What are the benefits of learning a foreign language?",
            targetWords: ["Cognitive", "Cultural", "Perspective", "Enhance", "Opportunity"],
            difficulty: "medium",
            category: "Language Learning"
          },
          // Add more fallback challenges as needed
        ])
      }
    }

    if (!isInitialized.current) {
      isInitialized.current = true
      loadSpeakingChallenges()
    }
  }, [selectedDifficulty, toast])

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentIndex + 1) / speakingChallenges.length) * 100)
  }, [currentIndex, speakingChallenges.length])

  const handleChangeDifficulty = (difficulty: "easy" | "medium" | "hard" | null) => {
    setSelectedDifficulty(difficulty)
    // Reset and reload challenges with new difficulty
    setCurrentIndex(0)
    setAudioURL(null)
    setFeedback(null)
    setDetectedWords([])
    isInitialized.current = false
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
      // Convert the audio URL to a Blob
      const response = await fetch(audioURL);
      const audioBlob = await response.blob();
      
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob);
      const currentChallenge = speakingChallenges[currentIndex]
      formData.append('targetWords', JSON.stringify(currentChallenge.targetWords));
      formData.append('question', currentChallenge.question);
      
      // Send the audio to our API endpoint
      const apiResponse = await fetch('/api/speaking/evaluate-response', {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }
      
      const result = await apiResponse.json();
      
      // Update the UI with the evaluation results
      setDetectedWords(result.detectedWords);
      setFeedback(result.feedback);
      setFeedbackType(result.isValid ? "success" : "error");
      
      // Save successfully used words to Supabase
      if (result.isValid && result.detectedWords.length > 1) {
        try {
          // Save each detected word to the learned_words table
          for (const word of result.detectedWords) {
            saveLearnedWord(
              {
                word: word,
                definition: "Used in speaking challenge",
                mnemonic: "",
                difficulty: currentChallenge.difficulty,
                hints: [],
                examples: [result.transcription], // Use the transcription as an example
                synonyms: [],
                antonyms: []
              },
              {
                mastery: result.quality === "excellent" ? 90 : 70, // Higher mastery for excellent quality
                lastPracticed: new Date(),
                notes: `Used in speaking challenge: "${currentChallenge.question}"`
              }
            )
          }
          
          toast({
            title: `${result.detectedWords.length} words saved to your vocabulary`,
            description: "Your progress has been recorded",
          })
        } catch (error) {
          console.error("Error saving words to vocabulary:", error)
        }
      }
    } catch (error) {
      console.error("Error analyzing response:", error);
      toast({
        title: "Error analyzing response",
        description: "Please try again later",
        variant: "destructive",
      });
      setFeedback("Unable to analyze response at this time.");
      setFeedbackType("error");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleNextChallenge = () => {
    if (currentIndex < speakingChallenges.length - 1) {
      const updatedProgress = [...challengeProgress];
      updatedProgress[currentIndex] = {
        audioURL,
        feedback,
        feedbackType,
        detectedWords,
        isProcessing,
      };
      setChallengeProgress(updatedProgress);

      const nextProgress = updatedProgress[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setAudioURL(nextProgress.audioURL);
      setFeedback(nextProgress.feedback);
      setFeedbackType(nextProgress.feedbackType);
      setDetectedWords(nextProgress.detectedWords);
      setIsProcessing(nextProgress.isProcessing);
    } else {
      toast({
        title: "All challenges completed!",
        description: "You've completed all speaking challenges.",
      })
    }
  }

  const handlePreviousWord = () => {
    if (currentIndex > 0) {
      const updatedProgress = [...challengeProgress];
      updatedProgress[currentIndex] = {
        audioURL,
        feedback,
        feedbackType,
        detectedWords,
        isProcessing,
      };
      setChallengeProgress(updatedProgress);

      const prevProgress = updatedProgress[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setAudioURL(prevProgress.audioURL);
      setFeedback(prevProgress.feedback);
      setFeedbackType(prevProgress.feedbackType);
      setDetectedWords(prevProgress.detectedWords);
      setIsProcessing(prevProgress.isProcessing);
    }
  }

  const handleFinish = () => {
    router.push("/speaking-listening")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb items={[
          { label: "Speaking & Listening", href: "/speaking-listening", active: false },
          { label: "Speaking Challenges", href: "/speaking-listening/speaking-challenges", active: true }
        ]} />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg text-muted-foreground">Generating speaking challenges...</p>
        </div>
      </div>
    )
  }

  const currentChallenge = speakingChallenges[currentIndex]

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb items={[
        { label: "Speaking & Listening", href: "/speaking-listening", active: false },
        { label: "Speaking Challenges", href: "/speaking-listening/speaking-challenges", active: true }
      ]} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Speaking Challenges</h1>
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
          <CardTitle>Speak Using Target Vocabulary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="challenge" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="challenge">Challenge</TabsTrigger>
              <TabsTrigger value="vocabulary">Target Vocabulary</TabsTrigger>
            </TabsList>
            <TabsContent value="challenge" className="space-y-4 pt-4">
              <div className="bg-muted p-6 rounded-md text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">{currentChallenge.question}</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  Answer this question using at least 2 of the target words
                </div>
              </div>
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
                  <ImageIcon className="mr-2 h-4 w-4" />
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
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => handlePreviousWord()}
            disabled={currentIndex === 0}
          >
            Previous Challenge
          </Button>
          
          { currentIndex === 4 ? (
            <Button onClick={handleFinish}>
              Finish <Check className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNextChallenge} disabled={currentIndex === speakingChallenges.length - 1 || isProcessing}>
              Next Challenge
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}