"use client"

import { useState, useEffect } from "react"
import { Clock, Check, X, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Badge } from "@/components/ui/badge"

interface WordCluster {
  id: string
  name: string
  description: string
  words: string[]
  category: "thematic" | "synonym" | "antonym" | "contextual"
}

// Sample word clusters
const wordClusters: WordCluster[] = [
  {
    id: "travel",
    name: "Travel Vocabulary",
    description: "Words related to travel and tourism",
    words: ["Itinerary", "Destination", "Transit", "Accommodation", "Excursion", "Passport", "Luggage"],
    category: "thematic",
  },
  {
    id: "eloquent",
    name: "Eloquent Speech",
    description: "Words related to articulate expression",
    words: ["Eloquent", "Articulate", "Fluent", "Expressive", "Persuasive", "Rhetorical", "Verbose"],
    category: "synonym",
  },
  {
    id: "emotions",
    name: "Positive vs Negative Emotions",
    description: "Words expressing contrasting emotions",
    words: ["Ecstatic", "Despondent", "Jubilant", "Melancholic", "Elated", "Dejected", "Euphoric"],
    category: "antonym",
  },
  {
    id: "negotiation",
    name: "Negotiation Terms",
    description: "Words used in negotiation contexts",
    words: ["Bargain", "Compromise", "Agreement", "Dispute", "Concession", "Terms", "Proposal"],
    category: "contextual",
  },
  {
    id: "academic",
    name: "Academic Writing",
    description: "Words commonly used in academic contexts",
    words: ["Analyze", "Evaluate", "Synthesize", "Critique", "Methodology", "Framework", "Paradigm"],
    category: "contextual",
  },
]

export default function ChunkingPage() {
  const [currentClusterIndex, setCurrentClusterIndex] = useState(0)
  const [mode, setMode] = useState<"learn" | "sort" | "speed">("learn")
  const [userSortedWords, setUserSortedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  const [speedWord, setSpeedWord] = useState<string | null>(null)
  const [speedTimer, setSpeedTimer] = useState<number | null>(null)
  const [speedScore, setSpeedScore] = useState(0)
  const [speedTotal, setSpeedTotal] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    // Update progress when current index changes
    setProgress(((currentClusterIndex + 1) / wordClusters.length) * 100)
  }, [currentClusterIndex])

  useEffect(() => {
    if (mode === "sort") {
      // Initialize sorting exercise
      const currentCluster = wordClusters[currentClusterIndex]
      const otherClusters = wordClusters.filter((_, index) => index !== currentClusterIndex)
      const randomCluster = otherClusters[Math.floor(Math.random() * otherClusters.length)]

      // Mix words from current cluster and another random cluster
      const mixedWords = [...currentCluster.words, ...randomCluster.words.slice(0, 3)]
      // Shuffle the mixed words
      const shuffledWords = mixedWords.sort(() => Math.random() - 0.5)

      setAvailableWords(shuffledWords)
      setUserSortedWords([])
      setIsCorrect(null)
    } else if (mode === "speed") {
      // Initialize speed round
      startSpeedRound()
    }
  }, [mode, currentClusterIndex])

  // Speed round timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (mode === "speed" && speedTimer !== null && speedTimer > 0) {
      timer = setTimeout(() => setSpeedTimer(speedTimer - 1), 1000)
    } else if (mode === "speed" && speedTimer === 0) {
      // Time's up for speed round
      toast({
        title: "Time's up!",
        description: `You got ${speedScore} out of ${speedTotal} words correct.`,
      })
      setMode("learn")
    }
    return () => clearTimeout(timer)
  }, [mode, speedTimer, speedScore, speedTotal, toast])

  const startSpeedRound = () => {
    setSpeedTimer(30) // 30 seconds for speed round
    setSpeedScore(0)
    setSpeedTotal(0)
    presentNextSpeedWord()
  }

  const presentNextSpeedWord = () => {
    // Randomly select a cluster
    const randomClusterIndex = Math.floor(Math.random() * wordClusters.length)
    const randomCluster = wordClusters[randomClusterIndex]

    // Randomly select a word from that cluster
    const randomWordIndex = Math.floor(Math.random() * randomCluster.words.length)
    const randomWord = randomCluster.words[randomWordIndex]

    setSpeedWord(randomWord)
    setSpeedTotal((prev) => prev + 1)
  }

  const handleSpeedAnswer = (clusterId: string) => {
    if (!speedWord) return

    // Find which cluster the word belongs to
    const correctCluster = wordClusters.find((cluster) => cluster.words.includes(speedWord))

    if (correctCluster && correctCluster.id === clusterId) {
      // Correct answer
      setSpeedScore((prev) => prev + 1)
      toast({
        title: "Correct!",
        description: `${speedWord} belongs to ${correctCluster.name}`,
        duration: 1000,
      })
    } else {
      // Wrong answer
      toast({
        title: "Incorrect",
        description: `${speedWord} belongs to ${correctCluster?.name}`,
        variant: "destructive",
        duration: 1000,
      })
    }

    // Present next word
    presentNextSpeedWord()
  }

  const handleWordSelect = (word: string) => {
    if (userSortedWords.includes(word)) return

    setUserSortedWords([...userSortedWords, word])
    setAvailableWords(availableWords.filter((w) => w !== word))
  }

  const handleRemoveWord = (word: string) => {
    setUserSortedWords(userSortedWords.filter((w) => w !== word))
    setAvailableWords([...availableWords, word])
  }

  const handleCheckSorting = () => {
    const currentCluster = wordClusters[currentClusterIndex]

    // Check if all sorted words belong to the current cluster
    const allCorrect = userSortedWords.every((word) => currentCluster.words.includes(word))
    // Check if all cluster words are included in sorted words
    const allIncluded = currentCluster.words.every((word) => userSortedWords.includes(word))

    setIsCorrect(allCorrect && allIncluded)

    if (allCorrect && allIncluded) {
      toast({
        title: "Correct sorting!",
        description: "You've correctly identified all words in this cluster.",
      })
    } else {
      toast({
        title: "Incorrect sorting",
        description: "Some words are misplaced or missing. Try again.",
        variant: "destructive",
      })
    }
  }

  const handleNext = () => {
    if (currentClusterIndex < wordClusters.length - 1) {
      setCurrentClusterIndex(currentClusterIndex + 1)
      setMode("learn")
    } else {
      toast({
        title: "Exercise complete!",
        description: "You've completed all word chunking exercises.",
      })
      // Reset for a new session
      setCurrentClusterIndex(0)
      setMode("learn")
    }
  }

  const currentCluster = wordClusters[currentClusterIndex]

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Memory", href: "/memory", active: false },
          { label: "Chunking", href: "/memory/chunking", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chunking</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentClusterIndex + 1} of {wordClusters.length}
          </span>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Word Clusters</h2>
          <p className="text-muted-foreground">Group related words together to improve memory and recall</p>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === "learn" ? "default" : "outline"} size="sm" onClick={() => setMode("learn")}>
            Learn
          </Button>
          <Button variant={mode === "sort" ? "default" : "outline"} size="sm" onClick={() => setMode("sort")}>
            Sort
          </Button>
          <Button variant={mode === "speed" ? "default" : "outline"} size="sm" onClick={() => setMode("speed")}>
            Speed
          </Button>
        </div>
      </div>

      {mode === "learn" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{currentCluster.name}</CardTitle>
              <Badge variant="outline">
                {currentCluster.category === "thematic" && "Thematic Cluster"}
                {currentCluster.category === "synonym" && "Synonym Cluster"}
                {currentCluster.category === "antonym" && "Antonym Cluster"}
                {currentCluster.category === "contextual" && "Contextual Cluster"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{currentCluster.description}</p>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-3">Words in this cluster:</h3>
              <div className="flex flex-wrap gap-2">
                {currentCluster.words.map((word) => (
                  <Badge key={word} className="text-base py-1.5 px-3">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-md">
              <h3 className="font-medium mb-2">How to remember this cluster</h3>
              <p className="text-sm">
                These words are grouped together because they{" "}
                {currentCluster.category === "thematic" &&
                  "all relate to the theme of " + currentCluster.name.toLowerCase()}
                {currentCluster.category === "synonym" &&
                  "have similar meanings related to " + currentCluster.name.toLowerCase()}
                {currentCluster.category === "antonym" &&
                  "express contrasting concepts related to " + currentCluster.name.toLowerCase()}
                {currentCluster.category === "contextual" &&
                  "are commonly used together in " + currentCluster.name.toLowerCase() + " contexts"}
                . Try to visualize a scenario where you would use all these words together.
              </p>
            </div>

            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-2">Example usage</h3>
              <p className="text-sm italic">
                {currentCluster.category === "thematic" &&
                  `When planning my ${currentCluster.words[0].toLowerCase()}, I chose a tropical ${currentCluster.words[1].toLowerCase()} 
                  and arranged ${currentCluster.words[2].toLowerCase()} and ${currentCluster.words[3].toLowerCase()} in advance.`}
                {currentCluster.category === "synonym" &&
                  `The speaker was ${currentCluster.words[0].toLowerCase()}, ${currentCluster.words[1].toLowerCase()}, 
                  and ${currentCluster.words[2].toLowerCase()}, captivating the audience with her ${currentCluster.words[3].toLowerCase()} style.`}
                {currentCluster.category === "antonym" &&
                  `Her mood swings were extreme, from feeling ${currentCluster.words[0].toLowerCase()} in the morning 
                  to ${currentCluster.words[1].toLowerCase()} by evening.`}
                {currentCluster.category === "contextual" &&
                  `During the ${currentCluster.name.toLowerCase()}, we reached a ${currentCluster.words[1].toLowerCase()} 
                  after a lengthy ${currentCluster.words[3].toLowerCase()} about the ${currentCluster.words[5].toLowerCase()}.`}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setMode("sort")}>
              Practice Sorting
            </Button>
            <Button onClick={handleNext}>
              {currentClusterIndex < wordClusters.length - 1 ? "Next Cluster" : "Finish"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {mode === "sort" && (
        <Card>
          <CardHeader>
            <CardTitle>Sort Words into Clusters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              Drag the words below that belong to the <strong>{currentCluster.name}</strong> cluster. Not all words
              belong to this cluster!
            </p>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-3">Available Words:</h3>
              <div className="flex flex-wrap gap-2">
                {availableWords.map((word) => (
                  <Badge
                    key={word}
                    variant="outline"
                    className="text-base py-1.5 px-3 cursor-pointer hover:bg-secondary"
                    onClick={() => handleWordSelect(word)}
                  >
                    {word}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-2 border-dashed p-4 rounded-md min-h-[100px]">
              <h3 className="font-medium mb-3">Your {currentCluster.name} Cluster:</h3>
              {userSortedWords.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Click words above to add them here</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userSortedWords.map((word) => (
                    <Badge
                      key={word}
                      className="text-base py-1.5 px-3 cursor-pointer"
                      onClick={() => handleRemoveWord(word)}
                    >
                      {word} <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {isCorrect === true && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span>Correct! You've identified all the words in this cluster.</span>
              </div>
            )}

            {isCorrect === false && (
              <div className="flex items-center gap-2 text-red-600">
                <X className="h-5 w-5" />
                <span>Not quite right. Some words are misplaced or missing.</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setUserSortedWords([])
                setAvailableWords([...availableWords, ...userSortedWords])
                setIsCorrect(null)
              }}
              disabled={userSortedWords.length === 0}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>

            <div className="flex gap-2">
              <Button onClick={handleCheckSorting} disabled={userSortedWords.length === 0 || isCorrect === true}>
                Check Sorting
              </Button>

              {isCorrect === true && (
                <Button onClick={handleNext}>
                  Next Cluster <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}

      {mode === "speed" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Speed Round</CardTitle>
              <div className="flex items-center gap-2 text-amber-600">
                <Clock className="h-4 w-4" />
                <span>{speedTimer} seconds remaining</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-3xl font-bold mb-4">{speedWord}</h2>
              <p className="text-muted-foreground">Which cluster does this word belong to?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wordClusters.map((cluster) => (
                <Button
                  key={cluster.id}
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => handleSpeedAnswer(cluster.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">{cluster.name}</div>
                    <div className="text-xs text-muted-foreground">{cluster.category} cluster</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="bg-muted p-4 rounded-md text-center">
              <div className="text-2xl font-bold">
                {speedScore} / {speedTotal}
              </div>
              <p className="text-sm text-muted-foreground">Current score</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setMode("learn")} className="w-full">
              End Speed Round
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

