"use client"

import { useState, useEffect } from "react"
import { Check, X, ArrowRight, RefreshCw, PlusCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveLearnedWord } from "@/lib/ai-word-service";

interface WordCluster {
  id: string
  name: string
  description: string
  words: string[]
  category: "thematic" | "synonym" | "antonym" | "contextual"
  randomWords: string[]
}

export default function ChunkingPage() {
  const [wordClusters, setWordClusters] = useState<WordCluster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentClusterIndex, setCurrentClusterIndex] = useState(0)
  const [mode, setMode] = useState<"learn" | "sort">("learn")
  const [userSortedWords, setUserSortedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  
  // Custom cluster dialog states
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [customTopic, setCustomTopic] = useState("")
  const [customCategory, setCustomCategory] = useState<"thematic" | "synonym" | "antonym" | "contextual">("thematic")
  const [customWordCount, setCustomWordCount] = useState(7)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false)
  const [isLastCluster, setIsLastCluster] = useState(false)
  
  const [nextCluster, setNextCluster] = useState<WordCluster | null>(null)
  
  const { toast } = useToast()

  // Fetch initial clusters on component mount
  useEffect(() => {
    const fetchInitialAndNextClusters = async () => {
      await fetchInitialClusters(); // Fetch the first cluster
      const secondCluster = await fetchNextCluster(); // Fetch the second cluster in the background
      setNextCluster(secondCluster); // Store the second cluster
    };

    fetchInitialAndNextClusters();
  }, []);

  // Update progress when current index changes
  useEffect(() => {
    if (wordClusters.length > 0) {
      setProgress(((currentClusterIndex + 1) / wordClusters.length) * 100)
    }
  }, [currentClusterIndex, wordClusters.length])

  useEffect(() => {
    if (mode === "sort" && wordClusters.length > 0) {
      // Initialize sorting exercise
      initializeSortingExercise()
    }
  }, [mode, currentClusterIndex, wordClusters])

  // Function to fetch initial clusters
  const fetchInitialClusters = async () => {
    setIsLoading(true) // Start loading
    try {
      // Fetch a single random topic and category
      const demoTopics = [
        "Architecture", "Technology", "Cuisine", "Art", "Literature", "Travel", 
        "Weather", "Space", "Medical", "Fashion", "Film", "Emotions", 
        "Geography", "History", "Mathematics", "Transportation", 
        "Photography", "Psychology", "Mythology", "Theatre", "Economics", 
        "Gardening"
      ]
      const categories: ("thematic" | "synonym" | "antonym" | "contextual")[] = [
        "thematic", "synonym", "antonym", "contextual"
      ]
      
      const topic = demoTopics[Math.floor(Math.random() * demoTopics.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]
      
      const response = await fetch("/api/chunking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          category,
          wordsCount: 7
        }),
      })
      
      if (!response.ok) throw new Error("Failed to fetch cluster")
      
      const data = await response.json()
      
      // Add the new cluster to the list
      setWordClusters([data.cluster]) // Set the first cluster directly
      
      setIsLoading(false) // Stop loading after the first cluster is added
    } catch (error) {
      console.error("Error fetching initial clusters:", error)
      toast({
        title: "Failed to load clusters",
        description: "Could not fetch word clusters from the server. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Fetch the next cluster in the background
  const fetchNextCluster = async () => {
    const demoTopics = [
      "Architecture", "Technology", "Cuisine", "Art", "Literature", "Travel", 
      "Weather", "Space", "Medical", "Fashion", "Film", "Emotions", 
      "Geography", "History", "Mathematics", "Transportation", 
      "Photography", "Psychology", "Mythology", "Theatre", "Economics", 
      "Gardening"
    ]
    const categories: ("thematic" | "synonym" | "antonym" | "contextual")[] = [
      "thematic", "synonym", "antonym", "contextual"
    ];

    const topic = demoTopics[Math.floor(Math.random() * demoTopics.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];

    const response = await fetch("/api/chunking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        category,
        wordsCount: 7
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch cluster");

    const data = await response.json();
    return data.cluster;
  };

  const initializeSortingExercise = () => {
    if (wordClusters.length === 0) return
    
    const currentCluster = wordClusters[currentClusterIndex]
    
    // Use randomWords from the current cluster instead of mixing with other clusters
    const mixedWords = [...currentCluster.words, ...currentCluster.randomWords.slice(0, 5)]
    
    // Shuffle the mixed words
    const shuffledWords = mixedWords.sort(() => Math.random() - 0.5)
  
    setAvailableWords(shuffledWords)
    setUserSortedWords([])
    setIsCorrect(null)
  }

  // Handle generating a custom word cluster
  const handleGenerateCustomCluster = async () => {
    if (!customTopic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your custom cluster",
        variant: "destructive",
      })
      return
    }
    
    setIsGenerating(true)
    
    try {
      const response = await fetch("/api/chunking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: customTopic,
          category: customCategory,
          wordsCount: customWordCount
        }),
      })
      
      if (!response.ok) throw new Error("Failed to generate cluster")
      
      const data = await response.json()
      
      // Add the new cluster to the list
      const updatedClusters = [...wordClusters, data.cluster]
      setWordClusters(updatedClusters)
      
      // Go to the new cluster
      setCurrentClusterIndex(updatedClusters.length - 1)
      setMode("learn")
      
      toast({
        title: "Cluster generated",
        description: `New ${customCategory} cluster "${data.cluster.name}" created`,
      })
      
      // Reset form and close dialog
      setCustomTopic("")
      setCustomDialogOpen(false)
    } catch (error) {
      console.error("Error generating cluster:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate custom cluster. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle word selection for sorting
  const handleWordSelect = (word: string) => {
    if (userSortedWords.includes(word)) return

    setUserSortedWords([...userSortedWords, word])
    setAvailableWords(availableWords.filter((w) => w !== word))
  }

  // Handle removing word from sorted list
  const handleRemoveWord = (word: string) => {
    setUserSortedWords(userSortedWords.filter((w) => w !== word))
    setAvailableWords([...availableWords, word])
  }

  const handleCheckSorting = () => {
    const currentCluster = wordClusters[currentClusterIndex]
  
    // Check if ALL sorted words belong to the current cluster
    const allWordsCorrect = userSortedWords.every((word) => 
      currentCluster.words.includes(word)
    )
    
    // Also check that at least one word has been selected
    const hasSelectedWords = userSortedWords.length > 0
    
    setIsCorrect(allWordsCorrect && hasSelectedWords)
  
    if (allWordsCorrect && hasSelectedWords) {
      // Save the words to the database
      saveLearnedWord({
        word: currentCluster.name,
        definition: currentCluster.description,
        notes: currentCluster.description,
        difficulty: "easy",
        hints: currentCluster.words,
      }, {
        mode: 'Chunking',
        mastery: 100,
        lastPracticed: new Date(),
      })
  
      toast({
        title: "Correct sorting!",
        description: "All selected words belong to this cluster.",
      })
    } else if (!hasSelectedWords) {
      toast({
        title: "No words selected",
        description: "Please select at least one word to check.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Incorrect sorting",
        description: "One or more selected words do not belong to this cluster.",
        variant: "destructive",
      })
    }
  }

  // Handle fetching the next cluster
  const handleNext = async () => {
    if (currentClusterIndex < wordClusters.length - 1) {
      setCurrentClusterIndex(currentClusterIndex + 1);
    } else {
      // Show the next cluster that was fetched in the background
      if (nextCluster) {
        setWordClusters(prevClusters => [...prevClusters, nextCluster]);
        setCurrentClusterIndex(wordClusters.length); // Move to the new cluster
        setNextCluster(null); // Clear the next cluster after using it
        // Fetch the next cluster in the background
        const newNextCluster = await fetchNextCluster();
        setNextCluster(newNextCluster); // Store the new next cluster
      } else {
        // If no next cluster is available, fetch a new one
        setIsAwaitingResponse(true);
        try {
          const newCluster = await fetchNextCluster();
          setWordClusters(prevClusters => [...prevClusters, newCluster]);
          setCurrentClusterIndex(wordClusters.length); // Move to the new cluster
        } catch (error) {
          console.error("Error fetching next cluster:", error);
        } finally {
          setIsAwaitingResponse(false);
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Memory", href: "/memory", active: false },
            { label: "Chunking", href: "/memory/chunking", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold">Loading word clusters...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your exercises</p>
        </div>
      </div>
    )
  }

  // If no clusters were loaded, show error and retry button
  if (wordClusters.length === 0) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Memory", href: "/memory", active: false },
            { label: "Chunking", href: "/memory/chunking", active: true },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-12">
          <X className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold">Failed to load word clusters</h2>
          <p className="text-muted-foreground mb-6">We couldn't load any word clusters at the moment.</p>
          <Button onClick={fetchInitialClusters}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const currentCluster = wordClusters[currentClusterIndex]


console.log('availableWords', availableWords);
console.log('currentCluster', currentCluster);
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
        
        {/* Custom Cluster Dialog */}
        <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Custom Cluster
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Word Cluster</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic or Theme</Label>
                <Input 
                  id="topic" 
                  placeholder="E.g., Astronomy, Cooking, etc."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Cluster Category</Label>
                <Select 
                  value={customCategory} 
                  onValueChange={(value: any) => setCustomCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thematic">Thematic</SelectItem>
                    <SelectItem value="synonym">Synonym</SelectItem>
                    <SelectItem value="antonym">Antonym</SelectItem>
                    <SelectItem value="contextual">Contextual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wordCount">Number of Words</Label>
                <Input 
                  id="wordCount" 
                  type="number"
                  min="5"
                  max="10"
                  value={customWordCount}
                  onChange={(e) => setCustomWordCount(parseInt(e.target.value) || 7)}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleGenerateCustomCluster}
                disabled={isGenerating || !customTopic.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Cluster"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  `When discussing ${currentCluster.name.toLowerCase()}, I referred to ${currentCluster.words[0]?.toLowerCase() || "concepts"}, ${currentCluster.words[1]?.toLowerCase() || "terms"}, 
                  and explored the relationship between ${currentCluster.words[2]?.toLowerCase() || "elements"} and ${currentCluster.words[3]?.toLowerCase() || "components"}.`}
                {currentCluster.category === "synonym" &&
                  `The writer was ${currentCluster.words[0]?.toLowerCase() || "skilled"}, ${currentCluster.words[1]?.toLowerCase() || "talented"}, 
                  and ${currentCluster.words[2]?.toLowerCase() || "proficient"}, demonstrating ${currentCluster.words[3]?.toLowerCase() || "mastery"} in their craft.`}
                {currentCluster.category === "antonym" &&
                  `The results were ${currentCluster.words[0]?.toLowerCase() || "positive"} for some participants but 
                  ${currentCluster.words[1]?.toLowerCase() || "negative"} for others.`}
                {currentCluster.category === "contextual" &&
                  `In the field of ${currentCluster.name.toLowerCase()}, experts often discuss ${currentCluster.words[0]?.toLowerCase() || "concepts"} 
                  in relation to ${currentCluster.words[1]?.toLowerCase() || "principles"} and their impact on ${currentCluster.words[2]?.toLowerCase() || "practices"}.`}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setMode("sort")}>
              Practice Sorting
            </Button>
            <Button onClick={handleNext} disabled={isAwaitingResponse}>
              {isAwaitingResponse ? (
                <>
                  {/* <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
                  Loading...
                </>
              ) : (
                <>
                  Next Cluster
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
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
              Click on the words below that belong to the <strong>{currentCluster.name}</strong> cluster. Not all words
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
                <span>Not quite right. Some words are misplaced.</span>
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
    </div>
  )
}

